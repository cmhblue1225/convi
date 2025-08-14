import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner 컴포넌트', () => {
  it('기본 스피너가 렌더링되어야 함', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('size prop에 따라 적절한 크기가 적용되어야 함', () => {
    const { container, rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-4', 'w-4');

    rerender(<LoadingSpinner size="md" />);
    spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-6', 'w-6');

    rerender(<LoadingSpinner size="lg" />);
    spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('커스텀 className이 적용되어야 함', () => {
    const { container } = render(<LoadingSpinner className="custom-spinner" />);
    const wrapper = container.querySelector('div');
    expect(wrapper).toHaveClass('custom-spinner');
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center'); // 기본 클래스도 유지
  });

  it('기본 색상이 적용되어야 함', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('text-primary-600');
  });
});