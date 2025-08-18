import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

interface PointsValidationProps {
  userId: string;
  totalAmount: number;
  couponDiscount: number;
}

interface PointsValidation {
  totalPoints: number;
  maxUsablePoints: number;
  isValidPointsUsage: (pointsToUse: number) => boolean;
  getValidationMessage: (pointsToUse: number) => string;
}

export const usePointsValidation = ({ userId, totalAmount, couponDiscount }: PointsValidationProps): PointsValidation => {
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (userId) {
      fetchUserPoints();
    }
  }, [userId]);

  const fetchUserPoints = async () => {
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

      setTotalPoints(Math.max(0, total));
    } catch (error) {
      console.error('포인트 조회 오류:', error);
      setTotalPoints(0);
    }
  };

  // 최대 사용 가능한 포인트 계산
  const maxUsablePoints = Math.min(
    totalPoints,
    Math.floor((totalAmount - couponDiscount) * 0.3), // 최대 30%
    totalPoints >= 100 ? totalPoints : 0 // 최소 100포인트 보유 시에만 사용 가능
  );

  // 포인트 사용 유효성 검사
  const isValidPointsUsage = (pointsToUse: number): boolean => {
    if (pointsToUse <= 0) return false;
    if (pointsToUse < 100) return false; // 최소 100포인트
    if (pointsToUse > totalPoints) return false;
    if (pointsToUse > maxUsablePoints) return false;
    if (totalAmount - couponDiscount <= 10000) return false; // 주문 금액 > 10,000원
    return true;
  };

  // 검증 메시지 생성
  const getValidationMessage = (pointsToUse: number): string => {
    if (pointsToUse <= 0) return '사용할 포인트를 입력해주세요.';
    if (pointsToUse < 100) return '최소 100포인트부터 사용 가능합니다.';
    if (pointsToUse > totalPoints) return '보유 포인트가 부족합니다.';
    if (pointsToUse > maxUsablePoints) return `최대 ${maxUsablePoints.toLocaleString()}포인트까지 사용 가능합니다.`;
    if (totalAmount - couponDiscount <= 10000) return '10,000원 이상 주문 시 포인트를 사용할 수 있습니다.';
    return '포인트 사용이 가능합니다.';
  };

  return {
    totalPoints,
    maxUsablePoints,
    isValidPointsUsage,
    getValidationMessage
  };
};

