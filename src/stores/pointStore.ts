import { create } from 'zustand';
import { supabase } from '../lib/supabase/client';
import { Point, PointSettings } from '../types/common';

interface PointStore {
  // 상태
  balance: number;
  transactions: Point[];
  isLoading: boolean;
  error: string | null;
  
  // 액션 (POINT_SYSTEM_LOGIC.txt와 일치)
  earnOrderPoints: (userId: string, orderId: string, orderAmount: number) => Promise<{ success: boolean; pointsEarned?: number; error?: string }>;
  earnReviewPoints: (userId: string, reviewId: string) => Promise<{ success: boolean; pointsEarned?: number; error?: string }>;
  addBonusPoints: (userId: string, amount: number, reason: string) => Promise<{ success: boolean; pointsEarned?: number; error?: string }>;
  usePointsForOrder: (userId: string, amount: number, orderId: string) => Promise<{ success: boolean; error?: string }>;
  refundPoints: (userId: string, orderId: string, refundAmount: number, description?: string) => Promise<{ success: boolean; pointsRefunded?: number; error?: string }>;
  fetchUserPoints: (userId: string) => Promise<void>;
  fetchPointTransactions: (userId: string) => Promise<void>;
  getPointBalance: (userId: string) => Promise<number>;
  getExpiringPoints: (userId: string) => Promise<Point[]>;
  clearError: () => void;
}

export const usePointStore = create<PointStore>((set, get) => ({
  // 초기 상태
  balance: 0,
  transactions: [],
  isLoading: false,
  error: null,

  // 주문 완료 시 포인트 적립 (POINT_SYSTEM_LOGIC.txt와 일치)
  earnOrderPoints: async (userId: string, orderId: string, orderAmount: number) => {
    try {
      set({ isLoading: true, error: null });
      
      // 적립할 포인트 계산 (주문 금액의 1%, 최소 100원)
      const pointsToEarn = Math.max(100, Math.floor(orderAmount * 0.01));
      
      console.log('🎯 주문 완료 포인트 적립 시작:', {
        userId,
        orderId,
        orderAmount,
        pointsToEarn
      });

      // 중복 적립 방지 (같은 주문/리뷰)
      const existingPoint = await supabase
        .from('points')
        .select('id')
        .eq('user_id', userId)
        .eq('order_id', orderId)
        .eq('type', 'earned')
        .single();

      if (existingPoint) {
        console.log('⚠️ 이미 적립된 주문:', orderId);
        return { success: false, error: '이미 적립된 주문입니다.' };
      }

      // 포인트 테이블에 직접 삽입
      const { data, error } = await supabase
        .from('points')
        .insert([{
          user_id: userId,
          amount: pointsToEarn,
          type: 'earned',
          description: '주문 완료 포인트 적립',
          order_id: orderId,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1년 후 만료
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ 포인트 적립 실패:', error);
        throw new Error(error.message);
      }

      // 로컬 상태 업데이트
      const currentBalance = get().balance;
      const newTransaction: Point = {
        id: data.id,
        user_id: userId,
        amount: pointsToEarn,
        type: 'earned',
        description: '주문 완료 포인트 적립',
        order_id: orderId,
        expires_at: data.expires_at,
        created_at: data.created_at
      };

      set(state => ({
        balance: currentBalance + pointsToEarn,
        transactions: [newTransaction, ...state.transactions],
        isLoading: false
      }));

      console.log(`✅ 포인트 적립 완료: ${pointsToEarn}포인트 (주문 금액: ${orderAmount.toLocaleString()}원)`);
      return { success: true, pointsEarned: pointsToEarn };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('❌ 포인트 적립 실패:', error);
      
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      
      return { success: false, error: errorMessage };
    }
  },

  // 리뷰 작성 시 포인트 적립 (POINT_SYSTEM_LOGIC.txt와 일치)
  earnReviewPoints: async (userId: string, reviewId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const pointsToEarn = 100; // 리뷰 작성 시 100포인트
      
      // 중복 적립 방지
      const existingPoint = await supabase
        .from('points')
        .select('id')
        .eq('user_id', userId)
        .eq('order_id', reviewId) // reviewId를 order_id로 사용
        .eq('type', 'earned')
        .single();

      if (existingPoint) {
        return { success: false, error: '이미 적립된 리뷰입니다.' };
      }

      const { data, error } = await supabase
        .from('points')
        .insert([{
          user_id: userId,
          amount: pointsToEarn,
          type: 'earned',
          description: '리뷰 작성 포인트 적립',
          order_id: reviewId,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // 로컬 상태 업데이트
      const currentBalance = get().balance;
      const newTransaction: Point = {
        id: data.id,
        user_id: userId,
        amount: pointsToEarn,
        type: 'earned',
        description: '리뷰 작성 포인트 적립',
        order_id: reviewId,
        expires_at: data.expires_at,
        created_at: data.created_at
      };

      set(state => ({
        balance: currentBalance + pointsToEarn,
        transactions: [newTransaction, ...state.transactions],
        isLoading: false
      }));

      return { success: true, pointsEarned: pointsToEarn };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '포인트 적립에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // 보너스 포인트 적립 (POINT_SYSTEM_LOGIC.txt와 일치)
  addBonusPoints: async (userId: string, amount: number, reason: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('points')
        .insert([{
          user_id: userId,
          amount: amount,
          type: 'bonus',
          description: reason,
          order_id: null,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // 로컬 상태 업데이트
      const currentBalance = get().balance;
      const newTransaction: Point = {
        id: data.id,
        user_id: userId,
        amount: amount,
        type: 'bonus',
        description: reason,
        order_id: null,
        expires_at: data.expires_at,
        created_at: data.created_at
      };

      set(state => ({
        balance: currentBalance + amount,
        transactions: [newTransaction, ...state.transactions],
        isLoading: false
      }));

      return { success: true, pointsEarned: amount };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '보너스 포인트 적립에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // 주문 시 포인트 사용 (POINT_SYSTEM_LOGIC.txt와 일치)
  usePointsForOrder: async (userId: string, amount: number, orderId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentBalance = get().balance;
      
      if (currentBalance < amount) {
        return { success: false, error: '보유 포인트가 부족합니다.' };
      }

      // 포인트 사용 기록
      const { data, error } = await supabase
        .from('points')
        .insert([{
          user_id: userId,
          amount: -amount, // 사용은 음수로 표시
          type: 'used',
          description: '주문 시 포인트 사용',
          order_id: orderId,
          expires_at: null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // 로컬 상태 업데이트
      const newTransaction: Point = {
        id: data.id,
        user_id: userId,
        amount: -amount,
        type: 'used',
        description: '주문 시 포인트 사용',
        order_id: orderId,
        expires_at: null,
        created_at: data.created_at
      };

      set(state => ({
        balance: currentBalance - amount,
        transactions: [newTransaction, ...state.transactions],
        isLoading: false
      }));

      console.log(`✅ 포인트 사용 완료: ${amount}포인트`);
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '포인트 사용에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // 포인트 회수 함수 (환불 시 사용)
  refundPoints: async (userId: string, orderId: string, refundAmount: number, description?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // 해당 주문으로 적립된 포인트 조회
      const { data: earnedPoints, error: fetchError } = await supabase
        .from('points')
        .select('*')
        .eq('user_id', userId)
        .eq('order_id', orderId)
        .eq('type', 'earned');

      if (fetchError) {
        console.error('적립 포인트 조회 실패:', fetchError);
        throw new Error(fetchError.message);
      }

      if (!earnedPoints || earnedPoints.length === 0) {
        return { success: false, error: '해당 주문으로 적립된 포인트가 없습니다.' };
      }

      // 적립된 포인트 총액 계산
      const totalEarnedPoints = earnedPoints.reduce((sum, point) => sum + point.amount, 0);
      
      // 환불 금액에 비례하여 회수할 포인트 계산
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error('주문 정보 조회 실패:', orderError);
        throw new Error('주문 정보를 찾을 수 없습니다.');
      }

      const orderAmount = orderData.total_amount;
      const pointsToRefund = Math.floor((refundAmount / orderAmount) * totalEarnedPoints);
      
      if (pointsToRefund <= 0) {
        return { success: false, error: '회수할 포인트가 없습니다.' };
      }

      // 포인트 회수 기록 (refund 타입 사용)
      const { data, error } = await supabase
        .from('points')
        .insert([{
          user_id: userId,
          amount: -pointsToRefund, // 회수는 음수로 표시
          type: 'refund', // 환불로 인한 회수는 'refund' 타입으로 처리
          description: description || `환불로 인한 포인트 회수 (환불 금액: ${refundAmount.toLocaleString()}원)`,
          order_id: orderId,
          expires_at: null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // 로컬 상태 업데이트
      const currentBalance = get().balance;
      const newTransaction: Point = {
        id: data.id,
        user_id: userId,
        amount: -pointsToRefund,
        type: 'refund',
        description: description || `환불로 인한 포인트 회수 (환불 금액: ${refundAmount.toLocaleString()}원)`,
        order_id: orderId,
        expires_at: null,
        created_at: data.created_at
      };

      set(state => ({
        balance: Math.max(0, currentBalance - pointsToRefund), // 음수 방지
        transactions: [newTransaction, ...state.transactions],
        isLoading: false
      }));

      console.log(`✅ 포인트 회수 완료: ${pointsToRefund}포인트 (환불 금액: ${refundAmount.toLocaleString()}원)`);
      return { success: true, pointsRefunded: pointsToRefund };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '포인트 회수에 실패했습니다.';
      console.error('포인트 회수 실패:', error);
      
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

      if (error) throw error;

      // 포인트 잔액 계산 (POINT_SYSTEM_LOGIC.txt와 일치)
      const balance = (data as Point[]).reduce((total, point) => {
        if (point.type === 'earned' || point.type === 'bonus') {
          return total + point.amount;
        } else if (point.type === 'used' || point.type === 'expired' || point.type === 'refund') {
          return total - Math.abs(point.amount);
        }
        return total;
      }, 0);

      set({
        balance: Math.max(0, balance), // 음수 방지
        transactions: (data as Point[]) || [],
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

      if (error) throw error;

      set({
        transactions: (data as Point[]) || [],
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

      if (error) throw error;

      const balance = (data as { amount: number; type: string }[]).reduce((total, point) => {
        if (point.type === 'earned' || point.type === 'bonus') {
          return total + point.amount;
        } else if (point.type === 'used' || point.type === 'expired' || point.type === 'refund') {
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

  // 만료 예정 포인트 조회 (POINT_SYSTEM_LOGIC.txt와 일치)
  getExpiringPoints: async (userId: string) => {
    try {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'earned')
        .lt('expires_at', thirtyDaysFromNow.toISOString())
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true });

      if (error) throw error;
      return (data as Point[]) || [];
    } catch (error) {
      console.error('만료 예정 포인트 조회 실패:', error);
      return [];
    }
  },

  // 에러 초기화
  clearError: () => {
    set({ error: null });
  }
}));
