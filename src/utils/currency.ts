/**
 * 금액 관련 유틸리티 함수들
 */

/**
 * 소수점 단위 금액을 반올림하여 정수로 변환
 * @param amount - 반올림할 금액
 * @returns 반올림된 정수 금액
 */
export const roundAmount = (amount: number | string | null | undefined): number => {
  if (amount === null || amount === undefined) return 0;
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 0;
  return Math.round(numAmount);
};

/**
 * 금액을 한국 원화 형식으로 포맷팅 (반올림 적용)
 * @param amount - 포맷팅할 금액
 * @returns 포맷팅된 금액 문자열
 */
export const formatKRW = (amount: number | string | null | undefined): string => {
  const roundedAmount = roundAmount(amount);
  return roundedAmount.toLocaleString('ko-KR');
};

/**
 * 포인트를 한국 원화 형식으로 포맷팅 (반올림 적용)
 * @param points - 포맷팅할 포인트
 * @returns 포맷팅된 포인트 문자열
 */
export const formatPoints = (points: number | string | null | undefined): string => {
  const roundedPoints = roundAmount(points);
  return roundedPoints.toLocaleString('ko-KR');
};

/**
 * 할인 금액을 한국 원화 형식으로 포맷팅 (반올림 적용, 음수 부호 포함)
 * @param discountAmount - 포맷팅할 할인 금액
 * @returns 포맷팅된 할인 금액 문자열
 */
export const formatDiscount = (discountAmount: number | string | null | undefined): string => {
  const roundedAmount = roundAmount(discountAmount);
  if (roundedAmount === 0) return '0원';
  return `-${roundedAmount.toLocaleString('ko-KR')}원`;
};
