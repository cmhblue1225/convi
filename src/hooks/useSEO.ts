import { useEffect } from 'react';
import { updatePageTitle, updateMetaDescription } from '../utils/accessibility';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
}

/**
 * SEO 데이터를 관리하는 커스텀 훅
 */
export function useSEO(seoData: SEOData) {
  useEffect(() => {
    // 페이지 타이틀 업데이트
    if (seoData.title) {
      updatePageTitle(seoData.title);
    }

    // 메타 설명 업데이트
    if (seoData.description) {
      updateMetaDescription(seoData.description);
    }

    // 키워드 메타 태그 업데이트
    if (seoData.keywords) {
      updateMetaTag('keywords', seoData.keywords);
    }

    // Open Graph 메타 태그들
    if (seoData.ogTitle) {
      updateMetaProperty('og:title', seoData.ogTitle);
    }
    if (seoData.ogDescription) {
      updateMetaProperty('og:description', seoData.ogDescription);
    }
    if (seoData.ogImage) {
      updateMetaProperty('og:image', seoData.ogImage);
    }
    if (seoData.ogUrl) {
      updateMetaProperty('og:url', seoData.ogUrl);
    }

    // Twitter 메타 태그들
    if (seoData.twitterTitle) {
      updateMetaProperty('twitter:title', seoData.twitterTitle);
    }
    if (seoData.twitterDescription) {
      updateMetaProperty('twitter:description', seoData.twitterDescription);
    }
    if (seoData.twitterImage) {
      updateMetaProperty('twitter:image', seoData.twitterImage);
    }

    // Canonical URL
    if (seoData.canonicalUrl) {
      updateCanonicalUrl(seoData.canonicalUrl);
    }
  }, [seoData]);
}

/**
 * 메타 태그 업데이트 헬퍼 함수
 */
function updateMetaTag(name: string, content: string) {
  let metaTag = document.querySelector(`meta[name="${name}"]`);
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('name', name);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
}

/**
 * Open Graph/Twitter 메타 프로퍼티 업데이트
 */
function updateMetaProperty(property: string, content: string) {
  let metaTag = document.querySelector(`meta[property="${property}"]`);
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('property', property);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
}

/**
 * Canonical URL 업데이트
 */
function updateCanonicalUrl(url: string) {
  let linkTag = document.querySelector('link[rel="canonical"]');
  
  if (!linkTag) {
    linkTag = document.createElement('link');
    linkTag.setAttribute('rel', 'canonical');
    document.head.appendChild(linkTag);
  }
  
  linkTag.setAttribute('href', url);
}

/**
 * 구조화된 데이터 (JSON-LD) 추가
 */
export function addStructuredData(data: object) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  
  // 기존 구조화된 데이터 제거
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    document.head.removeChild(existingScript);
  }
  
  document.head.appendChild(script);
}

/**
 * 페이지별 기본 SEO 설정
 */
export const pageSEOConfigs = {
  home: {
    title: '편의점 솔루션',
    description: '편의점 종합 관리 솔루션 - 고객, 점주, 본사를 위한 통합 플랫폼. 주문 관리, 재고 관리, 매출 분석을 한번에!',
    keywords: '편의점, 관리 솔루션, 주문 관리, 재고 관리, 매출 분석, POS'
  },
  login: {
    title: '로그인',
    description: '편의점 솔루션에 로그인하여 서비스를 이용해보세요.',
    keywords: '로그인, 편의점 솔루션, ConviStore'
  },
  register: {
    title: '회원가입',
    description: '편의점 솔루션에 가입하여 체계적인 매장 관리를 시작하세요.',
    keywords: '회원가입, 편의점 솔루션, 매장 관리'
  },
  customerDashboard: {
    title: '고객 대시보드',
    description: '주변 편의점에서 상품을 주문하고 픽업 서비스를 이용해보세요.',
    keywords: '편의점 주문, 픽업 서비스, 상품 주문'
  },
  storeDashboard: {
    title: '점주 대시보드',
    description: '편의점 매장의 주문, 재고, 매출을 효율적으로 관리하세요.',
    keywords: '매장 관리, 주문 관리, 재고 관리, 매출 분석'
  },
  hqDashboard: {
    title: '본사 대시보드',
    description: '전체 지점의 운영 현황과 매출을 통합 관리하세요.',
    keywords: '본사 관리, 지점 관리, 통합 대시보드, 매출 분석'
  },
  products: {
    title: '상품 목록',
    description: '다양한 편의점 상품을 둘러보고 주문해보세요.',
    keywords: '편의점 상품, 상품 주문, 온라인 쇼핑'
  },
  orders: {
    title: '주문 내역',
    description: '나의 주문 내역을 확인하고 주문 상태를 추적해보세요.',
    keywords: '주문 내역, 주문 추적, 주문 상태'
  },
  profile: {
    title: '내 정보',
    description: '개인정보와 설정을 관리하세요.',
    keywords: '개인정보, 프로필, 설정 관리'
  }
} as const;