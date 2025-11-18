export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  success: boolean;
  coordinates?: Coordinates;
  error?: string;
  formattedAddress?: string;
  addressComponents?: {
    country?: string;
    adminArea1?: string; // 시/도
    adminArea2?: string; // 시/군/구
    locality?: string;   // 동/면
    streetNumber?: string;
    route?: string;
  };
}

// 메모리 캐시 (세션 동안 유지)
const geocodingCache = new Map<string, GeocodingResult>();

// 캐시 만료 시간 (30분)
const CACHE_DURATION = 30 * 60 * 1000;
const cacheTimestamps = new Map<string, number>();

/**
 * Google Geocoding API를 사용하여 주소를 좌표로 변환
 */
export const geocodeAddress = async (address: string): Promise<GeocodingResult> => {
  if (!address || address.trim() === '') {
    return {
      success: false,
      error: '주소가 비어있습니다.'
    };
  }

  const normalizedAddress = address.trim();
  const cacheKey = normalizedAddress.toLowerCase();

  // 캐시 확인
  const cachedResult = geocodingCache.get(cacheKey);
  const cacheTime = cacheTimestamps.get(cacheKey);
  
  if (cachedResult && cacheTime && (Date.now() - cacheTime) < CACHE_DURATION) {
    console.log('💾 캐시된 Geocoding 결과 사용:', normalizedAddress, '->', cachedResult.coordinates);
    return cachedResult;
  }

  try {
    console.log('🌐 Google Geocoding API 호출:', normalizedAddress);

    const apiKey = import.meta.env.VITE_GOOGLE_GEOCODING_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_GOOGLE_GEOCODING_API_KEY_HERE' || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      console.warn('⚠️ Google Geocoding API 키가 설정되지 않음');
      return getFallbackCoordinates(normalizedAddress);
    }

    // Google Geocoding API 호출
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(normalizedAddress)}&key=${apiKey}&language=ko&region=kr`
    );

    if (!response.ok) {
      console.error('❌ Google Geocoding API 응답 오류:', response.status, response.statusText);
      return getFallbackCoordinates(normalizedAddress);
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;
      
      // 주소 구성 요소 파싱
      const addressComponents = parseAddressComponents(result.address_components);
      
      const geocodingResult: GeocodingResult = {
        success: true,
        coordinates: {
          lat: location.lat,
          lng: location.lng
        },
        formattedAddress: result.formatted_address,
        addressComponents
      };

      // 캐시에 저장
      geocodingCache.set(cacheKey, geocodingResult);
      cacheTimestamps.set(cacheKey, Date.now());

      console.log('✅ Google Geocoding API 성공:', normalizedAddress, '->', geocodingResult.coordinates);
      return geocodingResult;
    } else {
      console.warn('⚠️ Google Geocoding API 결과 없음:', data.status, data.error_message);
      return getFallbackCoordinates(normalizedAddress);
    }

  } catch (error) {
    console.error('❌ Google Geocoding API 호출 실패:', error);
    return getFallbackCoordinates(normalizedAddress);
  }
};

/**
 * 여러 주소를 일괄 변환 (병렬 처리)
 */
export const geocodeAddresses = async (addresses: string[]): Promise<Record<string, GeocodingResult>> => {
  console.log('📍 일괄 주소 변환 시작:', addresses.length, '개');
  
  const results: Record<string, GeocodingResult> = {};
  
  // 병렬 처리로 성능 향상 (단, API 제한을 고려하여 배치 크기 제한)
  const batchSize = 5;
  const batches = [];
  
  for (let i = 0; i < addresses.length; i += batchSize) {
    batches.push(addresses.slice(i, i + batchSize));
  }
  
  for (const batch of batches) {
    const batchPromises = batch.map(async (address) => {
      const result = await geocodeAddress(address);
      return { address, result };
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(({ address, result }) => {
      results[address] = result;
    });
    
    // API 제한을 고려하여 배치 간 짧은 지연
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('✅ 일괄 주소 변환 완료:', Object.keys(results).length, '개');
  return results;
};

/**
 * 주소 구성 요소 파싱
 */
const parseAddressComponents = (components: any[]): GeocodingResult['addressComponents'] => {
  const parsed: GeocodingResult['addressComponents'] = {};
  
  components.forEach(component => {
    const types = component.types;
    
    if (types.includes('country')) {
      parsed.country = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      parsed.adminArea1 = component.long_name; // 시/도
    } else if (types.includes('administrative_area_level_2')) {
      parsed.adminArea2 = component.long_name; // 시/군/구
    } else if (types.includes('locality') || types.includes('sublocality_level_1')) {
      parsed.locality = component.long_name; // 동/면
    } else if (types.includes('street_number')) {
      parsed.streetNumber = component.long_name;
    } else if (types.includes('route')) {
      parsed.route = component.long_name;
    }
  });
  
  return parsed;
};

/**
 * 백업 좌표 시스템 (Google API 실패 시)
 */
const getFallbackCoordinates = (address: string): GeocodingResult => {
  console.log('📋 백업 좌표 시스템 사용:', address);
  
  // 한국 주요 지역 좌표 매핑
  const fallbackMap: Record<string, Coordinates> = {
    // 서울 지역
    '서울': { lat: 37.5665, lng: 126.9780 },
    '서울시': { lat: 37.5665, lng: 126.9780 },
    '서울특별시': { lat: 37.5665, lng: 126.9780 },
    '강남구': { lat: 37.5172, lng: 127.0473 },
    '서초구': { lat: 37.4836, lng: 127.0327 },
    '송파구': { lat: 37.5145, lng: 127.1066 },
    '마포구': { lat: 37.5663, lng: 126.9019 },
    '종로구': { lat: 37.5735, lng: 126.9788 },
    '중구': { lat: 37.5641, lng: 126.9979 },
    
    // 경기도 지역
    '경기': { lat: 37.4138, lng: 127.5183 },
    '경기도': { lat: 37.4138, lng: 127.5183 },
    '수원': { lat: 37.2636, lng: 127.0286 },
    '수원시': { lat: 37.2636, lng: 127.0286 },
    '성남': { lat: 37.4449, lng: 127.1388 },
    '성남시': { lat: 37.4449, lng: 127.1388 },
    '안양': { lat: 37.3943, lng: 126.9568 },
    '안양시': { lat: 37.3943, lng: 126.9568 },
    '부천': { lat: 37.5034, lng: 126.7660 },
    '부천시': { lat: 37.5034, lng: 126.7660 },
    '포천': { lat: 37.8947, lng: 127.2003 },
    '포천시': { lat: 37.8947, lng: 127.2003 },
    
    // 포천 세부 지역
    '선단동': { lat: 37.758249, lng: 127.210632 },
    '포천시 선단동': { lat: 37.758249, lng: 127.210632 },
    '경기 포천시 선단동': { lat: 37.758249, lng: 127.210632 },
    
    // 인천 지역
    '인천': { lat: 37.4563, lng: 126.7052 },
    '인천시': { lat: 37.4563, lng: 126.7052 },
    '인천광역시': { lat: 37.4563, lng: 126.7052 },
    
    // 대전 지역
    '대전': { lat: 36.3504, lng: 127.3845 },
    '대전시': { lat: 36.3504, lng: 127.3845 },
    '대전광역시': { lat: 36.3504, lng: 127.3845 },
    
    // 대구 지역
    '대구': { lat: 35.8714, lng: 128.6014 },
    '대구시': { lat: 35.8714, lng: 128.6014 },
    '대구광역시': { lat: 35.8714, lng: 128.6014 },
    
    // 부산 지역
    '부산': { lat: 35.1796, lng: 129.0756 },
    '부산시': { lat: 35.1796, lng: 129.0756 },
    '부산광역시': { lat: 35.1796, lng: 129.0756 },
    
    // 광주 지역
    '광주': { lat: 35.1595, lng: 126.8526 },
    '광주시': { lat: 35.1595, lng: 126.8526 },
    '광주광역시': { lat: 35.1595, lng: 126.8526 },
    
    // 울산 지역
    '울산': { lat: 35.5384, lng: 129.3114 },
    '울산시': { lat: 35.5384, lng: 129.3114 },
    '울산광역시': { lat: 35.5384, lng: 129.3114 },
  };
  
  const normalizedAddress = address.toLowerCase().trim();
  
  // 정확한 매칭 시도
  for (const [key, coords] of Object.entries(fallbackMap)) {
    if (normalizedAddress.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedAddress)) {
      console.log('✅ 백업 좌표 매칭:', key, '->', coords);
      return {
        success: true,
        coordinates: coords,
        formattedAddress: address
      };
    }
  }
  
  // 기본 좌표 (서울 중심)
  console.log('📍 기본 좌표 사용 (서울 중심)');
  return {
    success: true,
    coordinates: { lat: 37.5665, lng: 126.9780 },
    formattedAddress: address
  };
};

/**
 * 두 좌표 간 거리 계산 (km)
 */
export const getDistanceFromCoordinates = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * 역 지오코딩: 좌표를 주소로 변환
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<GeocodingResult> => {
  try {
    console.log('🔄 역 지오코딩 시작:', { lat, lng });

    const apiKey = import.meta.env.VITE_GOOGLE_GEOCODING_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_GOOGLE_GEOCODING_API_KEY_HERE' || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      console.warn('⚠️ Google Geocoding API 키가 설정되지 않음');
      return {
        success: false,
        error: 'API 키가 설정되지 않았습니다.'
      };
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ko&region=kr`
    );

    if (!response.ok) {
      console.error('❌ 역 지오코딩 API 응답 오류:', response.status, response.statusText);
      return {
        success: false,
        error: '역 지오코딩 API 호출 실패'
      };
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const addressComponents = parseAddressComponents(result.address_components);
      
      console.log('✅ 역 지오코딩 성공:', result.formatted_address);
      
      return {
        success: true,
        coordinates: { lat, lng },
        formattedAddress: result.formatted_address,
        addressComponents
      };
    } else {
      console.warn('⚠️ 역 지오코딩 결과 없음:', data.status);
      return {
        success: false,
        error: '주소를 찾을 수 없습니다.'
      };
    }

  } catch (error) {
    console.error('❌ 역 지오코딩 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '역 지오코딩 실패'
    };
  }
};

/**
 * 캐시 정리 (메모리 관리)
 */
export const clearGeocodingCache = (): void => {
  geocodingCache.clear();
  cacheTimestamps.clear();
  console.log('🧹 Geocoding 캐시 정리 완료');
};

/**
 * 캐시 상태 조회
 */
export const getCacheStats = (): { size: number; keys: string[] } => {
  return {
    size: geocodingCache.size,
    keys: Array.from(geocodingCache.keys())
  };
};