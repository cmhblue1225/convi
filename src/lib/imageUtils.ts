import { supabase } from './supabase/client';

export interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

export interface ImageMetadata {
  id: string;
  productId: string;
  storagePath: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  isPrimary: boolean;
  displayOrder: number;
  altText?: string;
  url: string;
}

/**
 * 이미지 압축 및 최적화
 */
export const compressImage = async (
  file: File, 
  options: ImageUploadOptions = {}
): Promise<File> => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // 원본 크기
      const { width: originalWidth, height: originalHeight } = img;
      
      // 비율 계산
      const ratio = Math.min(
        maxWidth / originalWidth,
        maxHeight / originalHeight,
        1 // 원본보다 크게 만들지 않음
      );

      // 새 크기 계산
      const newWidth = Math.round(originalWidth * ratio);
      const newHeight = Math.round(originalHeight * ratio);

      // 캔버스 크기 설정
      canvas.width = newWidth;
      canvas.height = newHeight;

      // 고품질 렌더링 설정
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Blob으로 변환
      const mimeType = format === 'png' ? 'image/png' : 
                     format === 'webp' ? 'image/webp' : 'image/jpeg';
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: mimeType,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          reject(new Error('Image compression failed'));
        }
      }, mimeType, quality);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 이미지 크기 정보 가져오기
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 파일 검증
 */
export const validateImageFile = (
  file: File, 
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    minWidth?: number;
    minHeight?: number;
  } = {}
): Promise<{ isValid: boolean; error?: string }> => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    minWidth = 100,
    minHeight = 100
  } = options;

  return new Promise(async (resolve) => {
    // 파일 타입 검사
    if (!allowedTypes.includes(file.type)) {
      resolve({ isValid: false, error: '지원하지 않는 파일 형식입니다.' });
      return;
    }

    // 파일 크기 검사
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
      resolve({ isValid: false, error: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다.` });
      return;
    }

    try {
      // 이미지 크기 검사
      const { width, height } = await getImageDimensions(file);
      
      if (width < minWidth || height < minHeight) {
        resolve({ 
          isValid: false, 
          error: `이미지 크기는 최소 ${minWidth}x${minHeight}px 이상이어야 합니다.` 
        });
        return;
      }

      resolve({ isValid: true });
    } catch (error) {
      resolve({ isValid: false, error: '이미지 파일이 손상되었습니다.' });
    }
  });
};

/**
 * 상품 이미지 업로드
 */
export const uploadProductImage = async (
  productId: string,
  file: File,
  options: ImageUploadOptions & { 
    displayOrder?: number;
    isPrimary?: boolean;
    altText?: string;
  } = {}
): Promise<ImageMetadata> => {
  const { displayOrder = 0, isPrimary = false, altText, ...compressOptions } = options;

  try {
    // 1. 파일 검증
    const validation = await validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // 2. 이미지 압축
    const compressedFile = await compressImage(file, compressOptions);
    const dimensions = await getImageDimensions(compressedFile);

    // 3. 파일 경로 생성
    const fileExt = compressedFile.type.split('/')[1];
    const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // 4. Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, compressedFile);

    if (uploadError) throw uploadError;

    // 5. 공개 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    // 6. 메타데이터 저장
    const { data: metadataData, error: metadataError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        storage_path: fileName,
        original_name: file.name,
        file_size: compressedFile.size,
        mime_type: compressedFile.type,
        width: dimensions.width,
        height: dimensions.height,
        is_primary: isPrimary,
        display_order: displayOrder,
        alt_text: altText
      })
      .select()
      .single();

    if (metadataError) throw metadataError;

    return {
      id: metadataData.id,
      productId: metadataData.product_id,
      storagePath: metadataData.storage_path,
      originalName: metadataData.original_name,
      fileSize: metadataData.file_size,
      mimeType: metadataData.mime_type,
      width: metadataData.width,
      height: metadataData.height,
      isPrimary: metadataData.is_primary,
      displayOrder: metadataData.display_order,
      altText: metadataData.alt_text,
      url: publicUrl
    };
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    throw error;
  }
};

/**
 * 상품 이미지 목록 조회
 */
export const getProductImages = async (productId: string): Promise<ImageMetadata[]> => {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('display_order', { ascending: true });

  if (error) throw error;

  return (data || []).map(item => ({
    id: item.id,
    productId: item.product_id,
    storagePath: item.storage_path,
    originalName: item.original_name,
    fileSize: item.file_size,
    mimeType: item.mime_type,
    width: item.width,
    height: item.height,
    isPrimary: item.is_primary,
    displayOrder: item.display_order,
    altText: item.alt_text,
    url: supabase.storage.from('product-images').getPublicUrl(item.storage_path).data.publicUrl
  }));
};

/**
 * 상품 이미지 삭제
 */
export const deleteProductImage = async (imageId: string): Promise<void> => {
  // 1. 메타데이터 조회
  const { data: imageData, error: fetchError } = await supabase
    .from('product_images')
    .select('storage_path')
    .eq('id', imageId)
    .single();

  if (fetchError) throw fetchError;

  // 2. Storage에서 파일 삭제
  const { error: storageError } = await supabase.storage
    .from('product-images')
    .remove([imageData.storage_path]);

  if (storageError) throw storageError;

  // 3. 메타데이터 삭제
  const { error: metadataError } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId);

  if (metadataError) throw metadataError;
};

/**
 * 메인 이미지 설정
 */
export const setPrimaryImage = async (productId: string, imageId: string): Promise<void> => {
  const { error } = await supabase.rpc('set_primary_product_image', {
    product_uuid: productId,
    image_uuid: imageId
  });

  if (error) throw error;
};

/**
 * 이미지 순서 재정렬
 */
export const reorderImages = async (
  productId: string, 
  imageOrders: { id: string; order: number }[]
): Promise<void> => {
  const { error } = await supabase.rpc('reorder_product_images', {
    product_uuid: productId,
    image_orders: imageOrders
  });

  if (error) throw error;
};

/**
 * 이미지 URL 최적화 (크기별 변형 URL 생성)
 */
export const getOptimizedImageUrl = (
  originalUrl: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif';
  } = {}
): string => {
  if (!originalUrl) return originalUrl;
  
  const { width, height, quality = 80, format } = options;
  
  // 환경 변수에서 CDN 설정 확인
  const cdnProvider = import.meta.env.VITE_IMAGE_CDN_PROVIDER;
  const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  
  // Cloudinary CDN 변형 URL 생성
  if (cdnProvider === 'cloudinary' && cloudinaryCloudName) {
    return generateCloudinaryUrl(originalUrl, { width, height, quality, format }, cloudinaryCloudName);
  }
  
  // 기본 Supabase 이미지 변형 시도 (Transform 기능 사용 - 유료 플랜)
  if (originalUrl.includes('supabase.co') && (width || height)) {
    return generateSupabaseTransformUrl(originalUrl, { width, height, quality });
  }
  
  // 변형이 필요없거나 지원되지 않는 경우 원본 URL 반환
  return originalUrl;
};

/**
 * Cloudinary URL 생성
 */
const generateCloudinaryUrl = (
  originalUrl: string,
  options: { width?: number; height?: number; quality?: number; format?: string },
  cloudName: string
): string => {
  const { width, height, quality, format } = options;
  
  // 원본 이미지의 public_id 추출 (Supabase URL에서는 파일명 사용)
  const urlParts = originalUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];
  const publicId = fileName.split('.')[0];
  
  // 변형 파라미터 구성
  const transformations = [];
  
  if (width && height) {
    transformations.push(`w_${width},h_${height},c_fill`);
  } else if (width) {
    transformations.push(`w_${width}`);
  } else if (height) {
    transformations.push(`h_${height}`);
  }
  
  if (quality) {
    transformations.push(`q_${quality}`);
  }
  
  if (format) {
    transformations.push(`f_${format}`);
  }
  
  const transformString = transformations.join(',');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
};

/**
 * Supabase Transform URL 생성 (Pro 플랜 이상)
 */
const generateSupabaseTransformUrl = (
  originalUrl: string,
  options: { width?: number; height?: number; quality?: number }
): string => {
  const { width, height, quality } = options;
  
  try {
    const url = new URL(originalUrl);
    const params = new URLSearchParams();
    
    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    if (quality) params.set('quality', quality.toString());
    
    // Supabase Transform API 사용
    url.searchParams.forEach((value, key) => params.set(key, value));
    
    return `${url.origin}${url.pathname}?${params.toString()}`;
  } catch (error) {
    console.warn('Failed to generate Supabase transform URL:', error);
    return originalUrl;
  }
};

/**
 * 지연 로딩을 위한 플레이스홀더 생성
 */
export const generatePlaceholder = (width: number, height: number): string => {
  // SVG 기반 플레이스홀더 생성
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
        Loading...
      </text>
    </svg>
  `;
  
  // URL 인코딩을 사용하여 안전하게 처리
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * 이미지 로딩 에러 시 대체 이미지 URL
 */
export const getDefaultProductImage = (): string => {
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <g transform="translate(150, 150)">
        <rect x="0" y="20" width="100" height="80" rx="8" fill="#9ca3af"/>
        <circle cx="20" cy="40" r="8" fill="#6b7280"/>
        <polygon points="40,60 60,40 80,60 80,80 40,80" fill="#6b7280"/>
      </g>
      <text x="50%" y="320" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="16">
        No Image
      </text>
    </svg>
  `;
  
  // URL 인코딩을 사용하여 안전하게 처리
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export default {
  compressImage,
  getImageDimensions,
  validateImageFile,
  uploadProductImage,
  getProductImages,
  deleteProductImage,
  setPrimaryImage,
  reorderImages,
  getOptimizedImageUrl,
  generatePlaceholder,
  getDefaultProductImage
};
