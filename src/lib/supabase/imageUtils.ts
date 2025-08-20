import { supabase } from './client';

// 메뉴구조도 이미지 파일명 매핑
export const MENU_IMAGE_MAP = {
  customer: 'customer-menu.png',
  store: 'store-menu.png', 
  hq: 'hq-menu.png',
  common: 'common-menu.png'
} as const;

export type MenuType = keyof typeof MENU_IMAGE_MAP;

/**
 * 메뉴구조도 이미지 공개 URL 가져오기
 */
export function getMenuImageUrl(menuType: MenuType): string {
  const fileName = MENU_IMAGE_MAP[menuType];
  const { data } = supabase.storage
    .from('menu-structures')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
}

/**
 * 모든 메뉴구조도 이미지 URL 가져오기
 */
export function getAllMenuImageUrls(): Record<MenuType, string> {
  return {
    customer: getMenuImageUrl('customer'),
    store: getMenuImageUrl('store'),
    hq: getMenuImageUrl('hq'),
    common: getMenuImageUrl('common')
  };
}

/**
 * 이미지 로드 상태 확인
 */
export async function checkImageExists(menuType: MenuType): Promise<boolean> {
  try {
    const url = getMenuImageUrl(menuType);
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 이미지 다운로드
 */
export function downloadMenuImage(menuType: MenuType, customFileName?: string): void {
  const url = getMenuImageUrl(menuType);
  const fileName = customFileName || `${menuType}_메뉴구조도.png`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 이미지 미리 로드 (성능 최적화)
 */
export function preloadMenuImages(): void {
  Object.keys(MENU_IMAGE_MAP).forEach(menuType => {
    const img = new Image();
    img.src = getMenuImageUrl(menuType as MenuType);
  });
}

/**
 * 이미지 URL 검증
 */
export function validateImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('supabase.co') && url.includes('menu-structures');
  } catch {
    return false;
  }
}