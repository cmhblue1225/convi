// 접근성 관련 유틸리티 함수들

/**
 * 스크린 리더를 위한 텍스트 안내
 */
export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // 1초 후 제거
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * 포커스 트랩 - 모달 내에서 포커스를 가둬둠
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }
  
  element.addEventListener('keydown', handleTabKey);
  
  // 첫 번째 요소에 포커스
  if (firstElement) {
    firstElement.focus();
  }
  
  // 정리 함수 반환
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Escape 키로 모달 닫기
 */
export function handleEscapeKey(callback: () => void): () => void {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      callback();
    }
  }
  
  document.addEventListener('keydown', handleKeyDown);
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * 페이지 제목 업데이트 (SPA용)
 */
export function updatePageTitle(title: string, siteName = 'ConviStore'): void {
  document.title = title ? `${title} - ${siteName}` : siteName;
}

/**
 * 메타 설명 업데이트
 */
export function updateMetaDescription(description: string): void {
  let metaDescription = document.querySelector('meta[name="description"]');
  
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  
  metaDescription.setAttribute('content', description);
}

/**
 * 접근성 위반 검사
 */
export function checkAccessibility(): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  // 이미지에 alt 속성이 없는지 확인
  const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
  if (imagesWithoutAlt.length > 0) {
    console.warn('접근성 경고: alt 속성이 없는 이미지가 있습니다:', imagesWithoutAlt);
  }
  
  // 버튼에 접근 가능한 텍스트가 없는지 확인
  const buttonsWithoutText = document.querySelectorAll('button:empty:not([aria-label]):not([aria-labelledby])');
  if (buttonsWithoutText.length > 0) {
    console.warn('접근성 경고: 텍스트나 라벨이 없는 버튼이 있습니다:', buttonsWithoutText);
  }
  
  // 폼 입력 요소에 라벨이 없는지 확인
  const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
  const inputsWithLabels = Array.from(inputsWithoutLabels).filter(input => {
    const id = input.getAttribute('id');
    return !id || !document.querySelector(`label[for="${id}"]`);
  });
  
  if (inputsWithLabels.length > 0) {
    console.warn('접근성 경고: 라벨이 없는 입력 필드가 있습니다:', inputsWithLabels);
  }
}

/**
 * 키보드 네비게이션을 위한 포커스 스타일 강화
 */
export function enhanceFocusVisibility(): void {
  // 마우스 사용자를 위해 포커스 링을 숨기고, 키보드 사용자를 위해 표시
  let isUsingMouse = false;
  
  document.addEventListener('mousedown', () => {
    isUsingMouse = true;
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      isUsingMouse = false;
    }
  });
  
  document.addEventListener('focusin', () => {
    if (isUsingMouse) {
      document.body.classList.add('using-mouse');
    } else {
      document.body.classList.remove('using-mouse');
    }
  });
}

/**
 * 색상 대비 확인 (개발 모드에서만)
 */
export function checkColorContrast(element: HTMLElement): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const styles = window.getComputedStyle(element);
  const backgroundColor = styles.backgroundColor;
  const color = styles.color;
  
  // 실제 색상 대비 계산은 복잡하므로 간단한 경고만 표시
  if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
    console.warn('접근성 경고: 배경색이 투명한 요소가 있습니다. 색상 대비를 확인하세요:', element);
  }
}

/**
 * ARIA 라이브 리전 설정
 */
export function createLiveRegion(type: 'polite' | 'assertive' = 'polite'): HTMLElement {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', type);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  
  document.body.appendChild(liveRegion);
  
  return liveRegion;
}

/**
 * 스크린 리더 전용 텍스트 추가
 */
export function addScreenReaderText(element: HTMLElement, text: string): void {
  const srText = document.createElement('span');
  srText.className = 'sr-only';
  srText.textContent = text;
  element.appendChild(srText);
}