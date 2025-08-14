import { create } from 'zustand';
import { supabase } from '../lib/supabase/client';
import { Point, PointSettings } from '../types/common';

interface PointStore {
  // 상태
  balance: number;
  transactions: Point[];
  isLoading: boolean;
  error: string | null;
  
  // 액션
  earnPoints: (userId: string, amount: number, orderId: string, description?: string) => Promise<{ success: boolean; pointsEarned?: number; error?: string }>;
  usePoints: (userId: string, amount: number, orderId: string, description?: string) => Promise<{ success: boolean; error?: string }>;
  fetchUserPoints: (userId: string) => Promise<void>;
  fetchPointTransactions: (userId: string) => Promise<void>;
  getPointBalance: (userId: string) => Promise<number>;
  clearError: () => void;
}

export const usePointStore = create<PointStore>((set, get) => ({
  // 초기 상태
  balance: 0,
  transactions: [],
  isLoading: false,
  error: null,

  // 포인트 적립 함수
  earnPoints: async (userId: string, amount: number, orderId: string, description?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // 적립할 포인트 계산 (주문 금액의 1%)
      const pointsToEarn = Math.floor(amount * 0.01);
      
      if (pointsToEarn <= 0) {
        return { success: false, error: '적립할 포인트가 없습니다.' };
      }

      // 포인트 적립 API 호출 (데이터베이스 함수 시그니처에 맞춤)
      const { data, error } = await supabase.rpc('earn_points', {
        user_uuid: userId,
        point_amount: pointsToEarn,
        point_description: description || '주문 완료 포인트 적립',
        order_uuid: orderId
      });

      if (error) {
        console.error('포인트 적립 API 오류:', error);
        throw new Error(error.message);
      }

      if (data && data.success) {
        // 로컬 상태 업데이트
        const currentBalance = get().balance;
        const newTransaction: Point = {
          id: data.point_id || `temp_${Date.now()}`,
          user_id: userId,
          amount: pointsToEarn,
          type: 'earned',
          description: description || '주문 완료 포인트 적립',
          order_id: orderId,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1년 후 만료
          created_at: new Date().toISOString()
        };

        set(state => ({
          balance: currentBalance + pointsToEarn,
          transactions: [newTransaction, ...state.transactions],
          isLoading: false
        }));

        console.log(`✅ 포인트 적립 완료: ${pointsToEarn}포인트 (주문 금액: ${amount.toLocaleString()}원)`);
        return { success: true, pointsEarned: pointsToEarn };
      } else {
        throw new Error(data?.error || '포인트 적립에 실패했습니다.');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('포인트 적립 실패:', error);
      
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      
      return { success: false, error: errorMessage };
    }
  },

  // 포인트 사용 함수
  usePoints: async (userId: string, amount: number, orderId: string, description?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentBalance = get().balance;
      
      if (currentBalance < amount) {
        return { success: false, error: '보유 포인트가 부족합니다.' };
      }

      // 포인트 사용 API 호출 (데이터베이스 함수 시그니처에 맞춤)
      const { data, error } = await supabase.rpc('use_points', {
        user_uuid: userId,
        point_amount: amount,
        point_description: description || '주문 시 포인트 사용',
        order_uuid: orderId
      });

      if (error) {
        console.error('포인트 사용 API 오류:', error);
        throw new Error(error.message);
      }

      if (data && data.success) {
        // 로컬 상태 업데이트
        const newTransaction: Point = {
          id: data.point_id || `temp_${Date.now()}`,
          user_id: userId,
          amount: -amount, // 사용은 음수로 표시
          type: 'used',
          description: description || '주문 시 포인트 사용',
          order_id: orderId,
          expires_at: null,
          created_at: new Date().toISOString()
        };

        set(state => ({
          balance: currentBalance - amount,
          transactions: [newTransaction, ...state.transactions],
          isLoading: false
        }));

        console.log(`✅ 포인트 사용 완료: ${amount}포인트`);
        return { success: true };
      } else {
        throw new Error(data?.error || '포인트 사용에 실패했습니다.');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('포인트 사용 실패:', error);
      
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      
      return { success: false, error: errorMessage };
    }
  },

  // 사용자 포인트 조회
  fetchUserPoints: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // 포인트 잔액 계산
      const balance = data.reduce((total, point) => {
        if (point.type === 'earned' || point.type === 'bonus' || point.type === 'refund') {
          return total + point.amount;
        } else if (point.type === 'used' || point.type === 'expired') {
          return total - Math.abs(point.amount);
        }
        return total;
      }, 0);

      set({
        balance: Math.max(0, balance), // 음수 방지
        transactions: data || [],
        isLoading: false
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '포인트 조회에 실패했습니다.';
      console.error('포인트 조회 실패:', error);
      
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
    }
  },

  // 포인트 거래 내역 조회
  fetchPointTransactions: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50); // 최근 50개 거래만

      if (error) {
        throw new Error(error.message);
      }

      set({
        transactions: data || [],
        isLoading: false
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '거래 내역 조회에 실패했습니다.';
      console.error('거래 내역 조회 실패:', error);
      
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
    }
  },

  // 포인트 잔액 조회
  getPointBalance: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('points')
        .select('amount, type')
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }

      const balance = data.reduce((total, point) => {
        if (point.type === 'earned' || point.type === 'bonus' || point.type === 'refund') {
          return total + point.amount;
        } else if (point.type === 'used' || point.type === 'expired') {
          return total - Math.abs(point.amount);
        }
        return total;
      }, 0);

      return Math.max(0, balance);
    } catch (error) {
      console.error('포인트 잔액 조회 실패:', error);
      return 0;
    }
  },

  // 에러 초기화
  clearError: () => {
    set({ error: null });
  }
}));
