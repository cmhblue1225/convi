import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import type { Point } from '../types/common';

interface UsePointsValidationProps {
  userId: string;
  totalAmount: number;
  couponDiscount?: number;
}

interface PointsValidation {
  maxUsablePoints: number;
  isValidPointsUsage: (points: number) => boolean;
  getValidationMessage: (points: number) => string;
}

export const usePointsValidation = ({
  userId,
  totalAmount,
  couponDiscount = 0
}: UsePointsValidationProps): PointsValidation => {
  const [isLoading, setIsLoading] = useState(true);

  // 최대 사용 가능한 포인트 계산 (totalPoints는 외부에서 전달받음)
  const maxUsablePoints = totalAmount - couponDiscount;

  // 포인트 사용 유효성 검사
  const isValidPointsUsage = (points: number): boolean => {
    if (points < 0) return false;
    if (points > maxUsablePoints) return false;
    return true;
  };

  // 검증 메시지 생성
  const getValidationMessage = (points: number): string => {
    if (points < 0) {
      return '포인트는 음수로 사용할 수 없습니다.';
    }
    
    if (points > maxUsablePoints) {
      return `주문 금액(${(totalAmount - couponDiscount).toLocaleString()}원)을 초과해서 포인트를 사용할 수 없습니다.`;
    }
    
    return '';
  };

  return {
    maxUsablePoints,
    isValidPointsUsage,
    getValidationMessage
  };
};
