import { supabase } from '../lib/supabase/client';
import { usePointStore } from '../stores/pointStore';

/**
 * 환불 승인 시 포인트 회수를 처리하는 유틸리티 함수
 * @param refundRequestId 환불 요청 ID
 * @param customerId 고객 ID
 * @param orderId 주문 ID
 * @param refundAmount 환불 금액
 * @param orderAmount 원 주문 금액
 * @returns 포인트 회수 결과
 */
export const processPointRefund = async (
  refundRequestId: string,
  customerId: string,
  orderId: string,
  refundAmount: number,
  orderAmount: number
): Promise<{ success: boolean; pointsRefunded?: number; error?: string }> => {
  try {
    console.log(`🔄 환불 시 포인트 회수 처리 시작:`, {
      refundRequestId,
      customerId,
      orderId,
      refundAmount,
      orderAmount
    });

    // 해당 주문으로 적립된 포인트 조회
    const { data: earnedPoints, error: fetchError } = await supabase
      .from('points')
      .select('*')
      .eq('user_id', customerId)
      .eq('order_id', orderId)
      .eq('type', 'earned');

    if (fetchError) {
      console.error('적립 포인트 조회 실패:', fetchError);
      return { success: false, error: '적립 포인트 조회에 실패했습니다.' };
    }

    if (!earnedPoints || earnedPoints.length === 0) {
      console.log('ℹ️ 해당 주문으로 적립된 포인트가 없습니다.');
      return { success: false, error: '해당 주문으로 적립된 포인트가 없습니다.' };
    }

    // 적립된 포인트 총액 계산
    const totalEarnedPoints = earnedPoints.reduce((sum, point) => sum + point.amount, 0);
    console.log(`📊 적립된 총 포인트: ${totalEarnedPoints}포인트`);

    // 환불 금액에 비례하여 회수할 포인트 계산
    const pointsToRefund = Math.floor((refundAmount / orderAmount) * totalEarnedPoints);
    
    if (pointsToRefund <= 0) {
      console.log('ℹ️ 회수할 포인트가 없습니다.');
      return { success: false, error: '회수할 포인트가 없습니다.' };
    }

    console.log(`💰 회수할 포인트: ${pointsToRefund}포인트 (환불 금액: ${refundAmount.toLocaleString()}원)`);

    // 포인트 회수 처리
    const pointResult = await usePointStore.getState().refundPoints(
      customerId,
      orderId,
      refundAmount,
      `환불 승인으로 인한 포인트 회수 (환불 금액: ${refundAmount.toLocaleString()}원)`
    );

    if (pointResult.success) {
      console.log(`✅ 포인트 회수 완료: ${pointResult.pointsRefunded}포인트`);
      
      // 환불 요청에 포인트 회수 정보 업데이트
      await supabase
        .from('refund_requests' as any)
        .update({
          points_refunded: pointResult.pointsRefunded,
          points_refunded_at: new Date().toISOString()
        })
        .eq('id', refundRequestId);

      return { 
        success: true, 
        pointsRefunded: pointResult.pointsRefunded 
      };
    } else {
      console.error('❌ 포인트 회수 실패:', pointResult.error);
      return { 
        success: false, 
        error: pointResult.error || '포인트 회수에 실패했습니다.' 
      };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    console.error('❌ 포인트 회수 처리 중 오류:', error);
    return { success: false, error: errorMessage };
  }
};

/**
 * 환불 요청 승인 시 자동으로 포인트 회수를 처리하는 함수
 * @param refundRequestId 환불 요청 ID
 * @returns 처리 결과
 */
export const autoProcessPointRefund = async (
  refundRequestId: string
): Promise<{ success: boolean; pointsRefunded?: number; error?: string }> => {
  try {
    console.log(`🔄 자동 포인트 회수 처리 시작: ${refundRequestId}`);

    // 환불 요청 정보 조회
    const { data: refundRequest, error: fetchError } = await supabase
      .from('refund_requests' as any)
      .select('*')
      .eq('id', refundRequestId)
      .single();

    if (fetchError || !refundRequest) {
      console.error('환불 요청 정보 조회 실패:', fetchError);
      return { success: false, error: '환불 요청 정보를 찾을 수 없습니다.' };
    }

    // 주문 정보 조회
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('id', refundRequest.order_id)
      .single();

    if (orderError || !orderData) {
      console.error('주문 정보 조회 실패:', orderError);
      return { success: false, error: '주문 정보를 찾을 수 없습니다.' };
    }

    // 포인트 회수 처리
    return await processPointRefund(
      refundRequestId,
      refundRequest.customer_id,
      refundRequest.order_id,
      refundRequest.approved_refund_amount || refundRequest.requested_refund_amount,
      orderData.total_amount
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    console.error('❌ 자동 포인트 회수 처리 중 오류:', error);
    return { success: false, error: errorMessage };
  }
};

/**
 * 포인트 회수 이력을 조회하는 함수
 * @param customerId 고객 ID
 * @param orderId 주문 ID
 * @returns 포인트 회수 이력
 */
export const getPointRefundHistory = async (
  customerId: string,
  orderId: string
) => {
  try {
    const { data, error } = await supabase
      .from('points')
      .select('*')
      .eq('user_id', customerId)
      .eq('order_id', orderId)
      .eq('type', 'used')
      .like('description', '%환불%회수%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('포인트 회수 이력 조회 실패:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('포인트 회수 이력 조회 중 오류:', error);
    return [];
  }
};
