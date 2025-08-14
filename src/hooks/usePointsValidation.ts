import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import type { Point } from '../types/common';

interface UsePointsValidationProps {
  userId: string;
  totalAmount: number;
  couponDiscount?: number;
}

interface PointsValidation {
  totalPoints: number;
  maxUsablePoints: number;
  isValidPointsUsage: (points: number) => boolean;
  getValidationMessage: (points: number) => string;
}

export const usePointsValidation = ({
  userId,
  totalAmount,
  couponDiscount = 0
}: UsePointsValidationProps): PointsValidation => {
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 포인트 조회
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('points')
          .select('amount')
          .eq('user_id', userId);

        if (error) {
          console.error('포인트 조회 실패:', error);
          return;
        }

        // 총 포인트 계산
        const total = (data || []).reduce((sum, point) => sum + point.amount, 0);
        setTotalPoints(total);
      } catch (error) {
        console.error('포인트 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPoints();
  }, [userId]);

  // 최대 사용 가능한 포인트 계산
  const maxUsablePoints = Math.min(totalPoints, totalAmount - couponDiscount);

  // 포인트 사용 유효성 검사
  const isValidPointsUsage = (points: number): boolean => {
    if (points < 0) return false;
    if (points > totalPoints) return false;
    if (points > maxUsablePoints) return false;
    return true;
  };

  // 검증 메시지 생성
  const getValidationMessage = (points: number): string => {
    if (points < 0) {
      return '포인트는 음수로 사용할 수 없습니다.';
    }
    
    if (points > totalPoints) {
      return `보유 포인트(${totalPoints.toLocaleString()}P)보다 많이 사용할 수 없습니다.`;
    }
    
    if (points > maxUsablePoints) {
      return `주문 금액(${(totalAmount - couponDiscount).toLocaleString()}원)을 초과해서 포인트를 사용할 수 없습니다.`;
    }
    
    return '';
  };

  return {
    totalPoints,
    maxUsablePoints,
    isValidPointsUsage,
    getValidationMessage
  };
};

