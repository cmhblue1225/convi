import { describe, it, expect, vi } from 'vitest';
import {
  cn,
  formatDate,
  formatTime,
  formatDateTime,
  formatPrice,
  formatNumber,
  truncate,
  maskEmail,
  maskPhone,
  formatFileSize,
  isValidUrl,
  isValidEmail,
  isValidPhone,
  delay,
  generateId,
  shuffle,
  groupBy,
  unique,
  removeNullValues,
  deepClone,
  debounce,
  throttle
} from '../common';

describe('유틸리티 함수 테스트', () => {
  describe('cn (className 병합)', () => {
    it('기본 클래스들을 병합해야 함', () => {
      expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
    });

    it('조건부 클래스를 처리해야 함', () => {
      expect(cn('btn', { 'btn-primary': true, 'btn-secondary': false })).toBe('btn btn-primary');
    });
  });

  describe('날짜/시간 포맷팅', () => {
    const testDate = new Date('2023-12-25T10:30:00');

    it('날짜를 한국어로 포맷팅해야 함', () => {
      const formatted = formatDate(testDate);
      expect(formatted).toMatch(/2023년.*12월.*25일/);
    });

    it('시간을 포맷팅해야 함', () => {
      const formatted = formatTime(testDate);
      expect(formatted).toBe('오전 10:30');
    });

    it('날짜와 시간을 함께 포맷팅해야 함', () => {
      const formatted = formatDateTime(testDate);
      expect(formatted).toMatch(/2023.*12.*25.*10.*30/);
    });
  });

  describe('숫자 포맷팅', () => {
    it('가격을 원화로 포맷팅해야 함', () => {
      expect(formatPrice(1000)).toBe('₩1,000');
    });

    it('숫자에 천단위 구분자를 추가해야 함', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
    });
  });

  describe('문자열 처리', () => {
    it('문자열을 지정된 길이로 자르고 ...을 추가해야 함', () => {
      expect(truncate('긴 문자열입니다', 5)).toBe('긴 문자열...');
      expect(truncate('짧음', 10)).toBe('짧음');
    });

    it('이메일을 마스킹해야 함', () => {
      expect(maskEmail('test@example.com')).toBe('te**@example.com');
      expect(maskEmail('a@test.com')).toBe('a@test.com'); // 2글자 이하는 마스킹 안함
    });

    it('전화번호를 마스킹해야 함', () => {
      expect(maskPhone('01012345678')).toBe('0101*******');
      expect(maskPhone('010')).toBe('010'); // 4글자 이하는 마스킹 안함
    });
  });

  describe('파일 크기 포맷팅', () => {
    it('바이트 단위를 적절하게 변환해야 함', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('유효성 검증', () => {
    it('URL 유효성을 검증해야 함', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('invalid-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });

    it('이메일 유효성을 검증해야 함', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.kr')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });

    it('전화번호 유효성을 검증해야 함', () => {
      expect(isValidPhone('010-1234-5678')).toBe(true);
      expect(isValidPhone('02-1234-5678')).toBe(true);
      expect(isValidPhone('+82-10-1234-5678')).toBe(true);
      expect(isValidPhone('123')).toBe(false); // 너무 짧음
      expect(isValidPhone('abc-def-ghij')).toBe(false); // 문자 포함
    });
  });

  describe('비동기 처리', () => {
    it('지연 함수가 정확한 시간만큼 대기해야 함', async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(95); // 약간의 오차 허용
    });
  });

  describe('ID 생성', () => {
    it('고유한 ID를 생성해야 함', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[a-z0-9]{9}$/);
    });
  });

  describe('배열 처리', () => {
    it('배열을 셔플해야 함', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled).toEqual(expect.arrayContaining(original));
      // 원본 배열은 변경되지 않아야 함
      expect(original).toEqual([1, 2, 3, 4, 5]);
    });

    it('배열을 그룹화해야 함', () => {
      const items = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 }
      ];
      const grouped = groupBy(items, item => item.category);
      expect(grouped).toEqual({
        A: [{ category: 'A', value: 1 }, { category: 'A', value: 3 }],
        B: [{ category: 'B', value: 2 }]
      });
    });

    it('배열에서 중복을 제거해야 함', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });
  });

  describe('객체 처리', () => {
    it('null/undefined 값을 제거해야 함', () => {
      const obj = { a: 1, b: null, c: undefined, d: 'test' };
      expect(removeNullValues(obj)).toEqual({ a: 1, d: 'test' });
    });

    it('객체를 깊은 복사해야 함', () => {
      const original = {
        a: 1,
        b: { c: 2, d: [3, 4] },
        e: new Date('2023-01-01')
      };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.d).not.toBe(original.b.d);
      expect(cloned.e).not.toBe(original.e);
    });
  });

  describe('함수 제어', () => {
    it('디바운스 함수가 마지막 호출만 실행해야 함', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('call1');
      debouncedFn('call2');
      debouncedFn('call3');
      
      expect(mockFn).not.toHaveBeenCalled();
      
      await delay(150);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call3');
    });

    it('쓰로틀 함수가 지정된 간격으로만 실행해야 함', async () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);
      
      throttledFn('call1');
      throttledFn('call2');
      throttledFn('call3');
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call1');
      
      await delay(150);
      throttledFn('call4');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('call4');
    });
  });
});