import React, { useState, useRef, useCallback } from 'react';
import { 
  CloudArrowUpIcon, 
  XMarkIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase/client';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  url?: string;
  displayOrder: number;
}

interface ImageUploadProps {
  productId?: string;
  maxImages?: number;
  maxFileSize?: number; // bytes
  onImagesChange: (imageUrls: string[]) => void;
  initialImages?: string[];
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  productId,
  maxImages = 5,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  onImagesChange,
  initialImages = [],
  disabled = false
}) => {
  const [images, setImages] = useState<ImageFile[]>(() => 
    initialImages.map((url, index) => ({
      id: `initial-${index}`,
      file: null as any,
      preview: url,
      uploading: false,
      uploaded: true,
      url,
      displayOrder: index
    }))
  );
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 압축 함수
  const compressImage = useCallback((file: File, maxWidth = 800, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // 비율 유지하며 크기 조정
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Blob으로 변환
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  // 파일 검증
  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return '이미지 파일만 업로드 가능합니다.';
    }
    if (file.size > maxFileSize) {
      return `파일 크기는 ${(maxFileSize / 1024 / 1024).toFixed(1)}MB 이하여야 합니다.`;
    }
    return null;
  }, [maxFileSize]);

  // 파일 추가
  const addFiles = useCallback(async (fileList: FileList) => {
    if (disabled) return;

    const files = Array.from(fileList);
    const remainingSlots = maxImages - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    for (const file of filesToAdd) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        continue;
      }

      const id = `${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);
      
      const newImage: ImageFile = {
        id,
        file,
        preview,
        uploading: false,
        uploaded: false,
        displayOrder: images.length
      };

      setImages(prev => [...prev, newImage]);
    }
  }, [disabled, maxImages, images.length, validateFile]);

  // 이미지 업로드
  const uploadImage = useCallback(async (imageFile: ImageFile) => {
    if (!productId) return;

    try {
      setImages(prev => prev.map(img => 
        img.id === imageFile.id 
          ? { ...img, uploading: true, error: undefined }
          : img
      ));

      // 이미지 압축
      const compressedFile = await compressImage(imageFile.file);
      
      // 파일 경로 생성
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, compressedFile);

      if (error) throw error;

      // 공개 URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      // 메타데이터 저장 (product_images 테이블)
      if (productId) {
        await supabase.from('product_images').insert({
          product_id: productId,
          image_url: publicUrl,
          alt_text: imageFile.file.name,
          is_primary: imageFile.displayOrder === 0
        });
      }

      setImages(prev => prev.map(img => 
        img.id === imageFile.id 
          ? { ...img, uploading: false, uploaded: true, url: publicUrl }
          : img
      ));

      // 부모 컴포넌트에 알림
      const updatedUrls = images
        .filter(img => img.uploaded || img.id === imageFile.id)
        .map(img => img.id === imageFile.id ? publicUrl : img.url!)
        .filter(Boolean);
      
      onImagesChange(updatedUrls);

    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      setImages(prev => prev.map(img => 
        img.id === imageFile.id 
          ? { ...img, uploading: false, error: '업로드에 실패했습니다.' }
          : img
      ));
    }
  }, [productId, compressImage, images, onImagesChange]);

  // 이미지 삭제
  const removeImage = useCallback(async (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (!imageToRemove) return;

    try {
      // Storage에서 삭제 (업로드된 이미지인 경우)
      if (imageToRemove.uploaded && imageToRemove.url) {
        const path = imageToRemove.url.split('/').pop();
        if (path) {
          await supabase.storage
            .from('product-images')
            .remove([path]);
        }

        // 메타데이터 삭제
        await supabase
          .from('product_images')
          .delete()
          .eq('image_url', imageToRemove.url);
      }

      // 프리뷰 URL 정리
      if (imageToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      // 상태에서 제거
      setImages(prev => {
        const filtered = prev.filter(img => img.id !== imageId);
        // 순서 재정렬
        const reordered = filtered.map((img, index) => ({
          ...img,
          displayOrder: index
        }));
        return reordered;
      });

      // 부모 컴포넌트에 알림
      const updatedUrls = images
        .filter(img => img.id !== imageId && img.uploaded)
        .map(img => img.url!)
        .filter(Boolean);
      
      onImagesChange(updatedUrls);

    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      alert('이미지 삭제에 실패했습니다.');
    }
  }, [images, onImagesChange]);

  // 이미지 순서 변경
  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      
      // 순서 재정렬
      const reordered = newImages.map((img, index) => ({
        ...img,
        displayOrder: index
      }));
      
      return reordered;
    });
  }, []);

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled && e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  }, [disabled, addFiles]);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  }, [addFiles]);

  return (
    <div className="space-y-4">
      {/* 드롭존 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          이미지를 드래그하거나 클릭하여 업로드
        </p>
        <p className="text-xs text-gray-500">
          PNG, JPG, WebP 파일 (최대 {maxImages}개, {(maxFileSize / 1024 / 1024).toFixed(1)}MB 이하)
        </p>
        
        {images.length >= maxImages && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg">
            <p className="text-sm text-gray-600">최대 {maxImages}개까지 업로드 가능</p>
          </div>
        )}
      </div>

      {/* 이미지 미리보기 그리드 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image.preview}
                  alt={`상품 이미지 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* 로딩 오버레이 */}
                {image.uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
                
                {/* 에러 오버레이 */}
                {image.error && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center p-2">
                    <p className="text-white text-xs text-center">{image.error}</p>
                  </div>
                )}
              </div>

              {/* 컨트롤 버튼들 */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* 삭제 버튼 */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={image.uploading}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              {/* 순서 표시 */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {index + 1}
                {index === 0 && <span className="ml-1">메인</span>}
              </div>

              {/* 업로드 버튼 (업로드되지 않은 경우) */}
              {!image.uploaded && !image.uploading && !image.error && (
                <div className="absolute bottom-2 left-2 right-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      uploadImage(image);
                    }}
                    className="w-full bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    업로드
                  </button>
                </div>
              )}

              {/* 업로드 완료 표시 */}
              {image.uploaded && (
                <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full p-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 일괄 업로드 버튼 */}
      {images.some(img => !img.uploaded && !img.uploading) && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              images
                .filter(img => !img.uploaded && !img.uploading && !img.error)
                .forEach(uploadImage);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            disabled={disabled}
          >
            모든 이미지 업로드
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
