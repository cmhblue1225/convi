import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LazyImage from './LazyImage';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
  showThumbnails?: boolean;
  autoSlide?: boolean;
  slideInterval?: number;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  productName,
  className = '',
  showThumbnails = true,
  autoSlide = false,
  slideInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  // 이미지가 없는 경우 기본 이미지 표시
  const displayImages = images.length > 0 ? images : [''];

  // 자동 슬라이드
  React.useEffect(() => {
    if (!autoSlide || displayImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, slideInterval, displayImages.length]);

  // 이전 이미지
  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  // 다음 이미지
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  // 특정 이미지로 이동
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // 모달 열기
  const openModal = (index: number) => {
    setModalIndex(index);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 모달에서 이전 이미지
  const modalPrevious = () => {
    setModalIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  // 모달에서 다음 이미지
  const modalNext = () => {
    setModalIndex((prev) => (prev + 1) % displayImages.length);
  };

  return (
    <>
      <div className={`relative ${className}`}>
        {/* 메인 이미지 */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <LazyImage
            src={displayImages[currentIndex]}
            alt={`${productName} 이미지 ${currentIndex + 1}`}
            className="cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => openModal(currentIndex)}
          />

          {/* 네비게이션 버튼 (이미지가 2개 이상인 경우만) */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                aria-label="이전 이미지"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                aria-label="다음 이미지"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </>
          )}

          {/* 인디케이터 */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {displayImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-white'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                  aria-label={`이미지 ${index + 1}로 이동`}
                />
              ))}
            </div>
          )}

          {/* 이미지 카운터 */}
          {displayImages.length > 1 && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
              {currentIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* 썸네일 (옵션) */}
        {showThumbnails && displayImages.length > 1 && (
          <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-blue-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <LazyImage
                  src={image}
                  alt={`${productName} 썸네일 ${index + 1}`}
                  className="w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 전체화면 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            {/* 닫기 버튼 */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
              aria-label="모달 닫기"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* 모달 이미지 */}
            <div className="relative">
              <img
                src={displayImages[modalIndex]}
                alt={`${productName} 확대 이미지 ${modalIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain"
              />

              {/* 모달 네비게이션 */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={modalPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                    aria-label="이전 이미지"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={modalNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                    aria-label="다음 이미지"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* 모달 인디케이터 */}
            {displayImages.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {displayImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setModalIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === modalIndex
                        ? 'bg-white'
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                    aria-label={`이미지 ${index + 1}로 이동`}
                  />
                ))}
              </div>
            )}

            {/* 이미지 정보 */}
            <div className="text-center mt-4 text-white">
              <p className="text-lg font-medium">{productName}</p>
              <p className="text-sm opacity-75">
                {modalIndex + 1} / {displayImages.length}
              </p>
            </div>
          </div>

          {/* 모달 배경 클릭으로 닫기 */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeModal}
          />
        </div>
      )}
    </>
  );
};

export default ImageGallery;
