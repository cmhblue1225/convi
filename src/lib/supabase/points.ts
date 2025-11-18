import { supabase } from './client';
import { Point } from '../../types/common';

// 포인트 적립 API
export const earnPoints = async (
  userId: string,
  amount: number,
  orderId: string,
  description: string,
  type: string = 'earned'
): Promise<{ success: boolean; point_id?: string; error?: string }> => {
  try {
    // 1. 포인트 테이블에 적립 기록 추가
    const { data: pointData, error: pointError } = await supabase
      .from('points')
      .insert([{
        user_id: userId,
        amount: amount,
        type: type,
        description: description,
        order_id: orderId,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1년 후 만료
        created_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (pointError) {
      console.error('포인트 적립 기록 추가 실패:', pointError);
      throw new Error(pointError.message);
    }

    // 2. 포인트 거래 내역 테이블에도 기록 (선택사항)
    try {
      await supabase
        .from('point_transactions')
        .insert([{
          user_id: userId,
          amount: amount,
          type: type,
          description: description,
          order_id: orderId,
          transaction_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        }]);
    } catch (transactionError) {
      // 거래 내역 기록 실패는 로그만 남기고 계속 진행
      console.warn('포인트 거래 내역 기록 실패 (무시됨):', transactionError);
    }

    console.log(`✅ 포인트 적립 성공: ${amount}포인트 (사용자: ${userId}, 주문: ${orderId})`);
    
    return {
      success: true,
      point_id: pointData.id
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '포인트 적립에 실패했습니다.';
    console.error('포인트 적립 API 오류:', error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// 포인트 사용 API
export const usePoints = async (
  userId: string,
  amount: number,
  orderId: string,
  description: string,
  type: string = 'used'
): Promise<{ success: boolean; point_id?: string; error?: string }> => {
  try {
    // 1. 현재 포인트 잔액 확인
    const currentBalance = await getPointBalance(userId);
    
    if (currentBalance < amount) {
      return {
        success: false,
        error: `보유 포인트가 부족합니다. (보유: ${currentBalance}포인트, 필요: ${amount}포인트)`
      };
    }

    // 2. 포인트 사용 기록 추가
    const { data: pointData, error: pointError } = await supabase
      .from('points')
      .insert([{
        user_id: userId,
        amount: -amount, // 사용은 음수로 기록
        type: type,
        description: description,
        order_id: orderId,
        expires_at: null, // 사용된 포인트는 만료일 없음
        created_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (pointError) {
      console.error('포인트 사용 기록 추가 실패:', pointError);
      throw new Error(pointError.message);
    }

    // 3. 포인트 거래 내역 테이블에도 기록
    try {
      await supabase
        .from('point_transactions')
        .insert([{
          user_id: userId,
          amount: -amount,
          type: type,
          description: description,
          order_id: orderId,
          transaction_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        }]);
    } catch (transactionError) {
      console.warn('포인트 거래 내역 기록 실패 (무시됨):', transactionError);
    }

    console.log(`✅ 포인트 사용 성공: ${amount}포인트 (사용자: ${userId}, 주문: ${orderId})`);
    
    return {
      success: true,
      point_id: pointData.id
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '포인트 사용에 실패했습니다.';
    console.error('포인트 사용 API 오류:', error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// 포인트 잔액 조회 API
export const getPointBalance = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('points')
      .select('amount, type')
      .eq('user_id', userId);

    if (error) {
      console.error('포인트 잔액 조회 실패:', error);
      return 0;
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

    return Math.max(0, balance); // 음수 방지

  } catch (error) {
    console.error('포인트 잔액 조회 API 오류:', error);
    return 0;
  }
};

// 포인트 거래 내역 조회 API
export const getPointTransactions = async (
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Point[]> => {
  try {
    const { data, error } = await supabase
      .from('points')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('포인트 거래 내역 조회 실패:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error('포인트 거래 내역 조회 API 오류:', error);
    return [];
  }
};

// 포인트 만료 처리 API (배치 작업용)
export const processExpiredPoints = async (): Promise<{ success: boolean; expired_count?: number; error?: string }> => {
  try {
    const now = new Date().toISOString();
    
    // 1. 만료된 포인트 조회
    const { data: expiredPoints, error: selectError } = await supabase
      .from('points')
      .select('id, user_id, amount')
      .not('expires_at', 'is', null)
      .lt('expires_at', now)
      .eq('type', 'earned');

    if (selectError) {
      console.error('만료된 포인트 조회 실패:', selectError);
      throw new Error(selectError.message);
    }

    if (!expiredPoints || expiredPoints.length === 0) {
      return { success: true, expired_count: 0 };
    }

    // 2. 만료된 포인트들을 만료 상태로 변경
    const expiredPointIds = expiredPoints.map(point => point.id);
    
    const { error: updateError } = await supabase
      .from('points')
      .update({ 
        type: 'expired',
        description: '포인트 만료',
        updated_at: now
      })
      .in('id', expiredPointIds);

    if (updateError) {
      console.error('포인트 만료 처리 실패:', updateError);
      throw new Error(updateError.message);
    }

    console.log(`✅ 만료된 포인트 처리 완료: ${expiredPoints.length}개`);
    
    return {
      success: true,
      expired_count: expiredPoints.length
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '포인트 만료 처리에 실패했습니다.';
    console.error('포인트 만료 처리 API 오류:', error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// 포인트 통계 조회 API
export const getPointStatistics = async (userId: string): Promise<{
  total_earned: number;
  total_used: number;
  total_expired: number;
  current_balance: number;
  expiring_soon: number;
}> => {
  try {
    const { data, error } = await supabase
      .from('points')
      .select('amount, type, expires_at')
      .eq('user_id', userId);

    if (error) {
      console.error('포인트 통계 조회 실패:', error);
      return {
        total_earned: 0,
        total_used: 0,
        total_expired: 0,
        current_balance: 0,
        expiring_soon: 0
      };
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const stats = data.reduce((acc, point) => {
      if (point.type === 'earned' || point.type === 'bonus' || point.type === 'refund') {
        acc.total_earned += point.amount;
        
        // 30일 내 만료 예정인 포인트 확인
        if (point.expires_at && new Date(point.expires_at) <= thirtyDaysFromNow) {
          acc.expiring_soon += point.amount;
        }
      } else if (point.type === 'used') {
        acc.total_used += Math.abs(point.amount);
      } else if (point.type === 'expired') {
        acc.total_expired += Math.abs(point.amount);
      }
      return acc;
    }, {
      total_earned: 0,
      total_used: 0,
      total_expired: 0,
      current_balance: 0,
      expiring_soon: 0
    });

    stats.current_balance = stats.total_earned - stats.total_used - stats.total_expired;

    return stats;

  } catch (error) {
    console.error('포인트 통계 조회 API 오류:', error);
    return {
      total_earned: 0,
      total_used: 0,
      total_expired: 0,
      current_balance: 0,
      expiring_soon: 0
    };
  }
};

