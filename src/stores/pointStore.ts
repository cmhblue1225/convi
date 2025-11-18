import { create } from 'zustand';
import { supabase } from '../lib/supabase/client';

interface PointStore {
  balance: number;
  transactions: any[];
  isLoading: boolean;
  fetchUserPoints: (userId: string) => Promise<void>;
  earnOrderPoints: (userId: string, orderId: string, orderAmount: number) => Promise<{ success: boolean; pointsEarned?: number; error?: string }>;
  usePointsForOrder: (userId: string, orderId: string, pointsToUse: number) => Promise<{ success: boolean; pointsUsed?: number; error?: string }>;
  refundPoints: (userId: string, orderId: string, refundAmount: number, originalOrderAmount: number) => Promise<{ success: boolean; pointsRefunded?: number; error?: string }>;
}

export const usePointStore = create<PointStore>((set, get) => ({
  balance: 0,
  transactions: [],
  isLoading: false,

  fetchUserPoints: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const points = data || [];
      
      // 총 포인트 계산
      const total = points.reduce((sum, point) => {
        if (point.type === 'earned' || point.type === 'bonus' || point.type === 'refund') {
          return sum + point.amount;
        } else if (point.type === 'used') {
          return sum - Math.abs(point.amount);
        }
        return sum;
      }, 0);

      set({ 
        balance: total, 
        transactions: points, 
        isLoading: false 
      });
    } catch (error) {
      console.error('포인트 조회 오류:', error);
      set({ isLoading: false });
    }
  },

  earnOrderPoints: async (userId: string, orderId: string, orderAmount: number) => {
    try {
      // 중복 적립 방지
      const { data: existingPoints } = await supabase
        .from('points')
        .select('id')
        .eq('user_id', userId)
        .eq('order_id', orderId)
        .eq('type', 'earned')
        .single();

      if (existingPoints) {
        return { success: false, error: '이미 적립된 주문입니다.' };
      }

      // 포인트 계산 및 적립
      const pointsToEarn = Math.max(Math.floor(orderAmount * 0.01), 100);
      
      const { data: newPoint, error } = await supabase
        .from('points')
        .insert({
          user_id: userId,
          order_id: orderId,
          amount: pointsToEarn,
          type: 'earned',
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // 포인트 잔액 업데이트
      await get().fetchUserPoints(userId);

      return { success: true, pointsEarned: pointsToEarn };
    } catch (error) {
      console.error('포인트 적립 오류:', error);
      return { success: false, error: '포인트 적립에 실패했습니다.' };
    }
  },

  usePointsForOrder: async (userId: string, orderId: string, pointsToUse: number) => {
    try {
      // 포인트 차감
      const { data: newPoint, error } = await supabase
        .from('points')
        .insert({
          user_id: userId,
          order_id: orderId,
          amount: -pointsToUse,
          type: 'used',
          expires_at: null
        })
        .select()
        .single();

      if (error) throw error;

      // 포인트 잔액 업데이트
      await get().fetchUserPoints(userId);

      return { success: true, pointsUsed: pointsToUse };
    } catch (error) {
      console.error('포인트 사용 오류:', error);
      return { success: false, error: '포인트 사용에 실패했습니다.' };
    }
  },

  refundPoints: async (userId: string, orderId: string, refundAmount: number, originalOrderAmount: number) => {
    try {
      // 원래 적립된 포인트 찾기
      const { data: earnedPoint } = await supabase
        .from('points')
        .select('amount')
        .eq('user_id', userId)
        .eq('order_id', orderId)
        .eq('type', 'earned')
        .single();

      if (!earnedPoint) {
        return { success: false, error: '적립된 포인트를 찾을 수 없습니다.' };
      }

      // 환불 비율에 따른 포인트 복구
      const refundRatio = refundAmount / originalOrderAmount;
      const pointsToRefund = Math.floor(earnedPoint.amount * refundRatio);

      // 환불 포인트 기록
      const { data: refundPoint, error } = await supabase
        .from('points')
        .insert({
          user_id: userId,
          order_id: orderId,
          amount: pointsToRefund,
          type: 'refund',
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // 포인트 잔액 업데이트
      await get().fetchUserPoints(userId);

      return { success: true, pointsRefunded: pointsToRefund };
    } catch (error) {
      console.error('포인트 환불 복구 오류:', error);
      return { success: false, error: '포인트 환불 복구에 실패했습니다.' };
    }
  }
}));
