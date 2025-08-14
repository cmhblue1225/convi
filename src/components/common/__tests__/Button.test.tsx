import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button 컴포넌트', () => {
  it('기본 버튼이 렌더링되어야 함', () => {
    render(<Button>클릭하세요</Button>);
    expect(screen.getByText('클릭하세요')).toBeInTheDocument();
  });

  it('클릭 이벤트가 발생해야 함', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    
    fireEvent.click(screen.getByText('클릭'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('비활성화 상태에서 클릭이 무시되어야 함', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>비활성화</Button>);
    
    fireEvent.click(screen.getByText('비활성화'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('로딩 상태에서 스피너가 표시되어야 함', () => {
    render(<Button loading>로딩 중</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('variant props에 따라 적절한 스타일이 적용되어야 함', () => {
    const { rerender } = render(<Button variant="destructive">삭제</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');

    rerender(<Button variant="secondary">보조</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary-600');
  });

  it('size props에 따라 적절한 크기가 적용되어야 함', () => {
    const { rerender } = render(<Button size="sm">작은 버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-9');

    rerender(<Button size="lg">큰 버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-11');
  });

  it('커스텀 className이 병합되어야 함', () => {
    render(<Button className="custom-class">커스텀</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('inline-flex'); // 기본 클래스도 유지
  });
});