import React, { useState, useRef, useEffect } from 'react';
import { generatePlaceholder, getDefaultProductImage, getOptimizedImageUrl } from '../../lib/imageUtils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallback?: string;
  placeholder?: string;
  quality?: number;
  format?: 'webp' | 'avif';
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = React.memo(({
  src,
  alt,
  className = '',
  width,
  height,
  fallback,
  placeholder,
  quality = 80,
  format,
  onLoad,
  onError,
  onClick
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer를 사용한 지연 로딩
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 이미지 로드 핸들러
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // 이미지 에러 핸들러
  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // 플레이스홀더 생성
  const getPlaceholderSrc = () => {
    if (placeholder) return placeholder;
    if (width && height) return generatePlaceholder(width, height);
    return generatePlaceholder(400, 400);
  };

  // 대체 이미지 생성
  const getFallbackSrc = () => {
    if (fallback) return fallback;
    return getDefaultProductImage();
  };

  // 유효한 이미지 URL인지 확인 및 최적화
  const getValidSrc = () => {
    // src가 빈 문자열이거나 null/undefined인 경우 대체 이미지 사용
    if (!src || src.trim() === '') {
      return getFallbackSrc();
    }
    
    if (isError) {
      return getFallbackSrc();
    }
    
    // 이미지 최적화 적용
    return getOptimizedImageUrl(src, {
      width,
      height,
      quality,
      format
    });
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef} onClick={onClick}>
      {/* 플레이스홀더 */}
      {!isInView && (
        <img
          src={getPlaceholderSrc()}
          alt="로딩 중..."
          className="w-full h-full object-cover"
        />
      )}

      {/* 실제 이미지 */}
      {isInView && (
        <>
          <img
            src={getValidSrc()}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />

          {/* 로딩 스피너 */}
          {!isLoaded && !isError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default LazyImage;
