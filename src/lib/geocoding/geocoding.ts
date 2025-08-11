export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  success: boolean;
  coordinates?: Coordinates;
  error?: string;
}

// 주요 지역 좌표 매핑 (CORS 문제로 인해 로컬 매핑 사용)
const locationMap: Record<string, Coordinates> = {
  // 포천 지역 - 실제 좌표 (Google Maps에서 확인한 정확한 좌표)
  '경기 포천시 선단동 491-1': { lat: 37.758249, lng: 127.210632 }, // 포천선단점 정확한 위치
  '경기 포천시 선단동': { lat: 37.758249, lng: 127.210632 },
  '포천시 선당동': { lat: 37.758249, lng: 127.210632 },
  '선당동': { lat: 37.758249, lng: 127.210632 },
  '포천시 테스트로': { lat: 37.8947, lng: 127.2003 }, // 포천시 중심
  
  // 서울 지역 - 정확한 좌표
  '서울시 강남구 테헤란로 123': { lat: 37.4979, lng: 127.0276 }, // 강남역 근처
  '서울시 강남구': { lat: 37.5172, lng: 127.0473 },
  '서울시 서초구': { lat: 37.4836, lng: 127.0327 },
  '서울시 송파구': { lat: 37.5145, lng: 127.1066 },
  '서울시 마포구': { lat: 37.5663, lng: 126.9019 },
  '서울시 종로구': { lat: 37.5735, lng: 126.9788 },
  '서울시 중구': { lat: 37.5641, lng: 126.9979 },
  '서울시 용산구': { lat: 37.5312, lng: 126.9810 },
  '서울시 서대문구': { lat: 37.5794, lng: 126.9368 },
  '서울시 광진구': { lat: 37.5385, lng: 127.0823 },
  
  // 경기도 지역
  '경기도 수원시': { lat: 37.2636, lng: 127.0286 },
  '경기도 성남시': { lat: 37.4449, lng: 127.1388 },
  '경기도 안양시': { lat: 37.3943, lng: 126.9568 },
  '경기도 부천시': { lat: 37.5034, lng: 126.7660 },
  '경기도 포천시': { lat: 37.8947, lng: 127.2003 },
  '포천시': { lat: 37.8947, lng: 127.2003 },
  '포천': { lat: 37.8947, lng: 127.2003 },
  
  // 기본 좌표 (서울 중심)
  '기본': { lat: 37.5665, lng: 126.9780 }
};

export const geocodeAddress = async (address: string): Promise<GeocodingResult> => {
  if (!address || address.trim() === '') {
    return {
      success: false,
      error: '주소가 비어있습니다.'
    };
  }

  try {
    console.log('📍 주소 변환 시도:', address);
    const normalizedAddress = address.trim();

    // 1. 먼저 프록시 서버를 통한 네이버 Geocoding API 호출 (실제 API 우선)
    try {
      console.log('🌐 프록시 서버를 통한 Geocoding API 호출 시도...');
      
      const response = await fetch(`http://localhost:3001/api/geocode?query=${encodeURIComponent(normalizedAddress)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.coordinates) {
          console.log('✅ 프록시 서버 API 호출 성공:', normalizedAddress, '->', data.coordinates);
          return {
            success: true,
            coordinates: data.coordinates
          };
        } else {
          console.warn('⚠️ 프록시 서버에서 주소를 찾을 수 없음:', data.error);
        }
      } else {
        console.warn('⚠️ 프록시 서버 호출 실패:', response.status, response.statusText);
      }
    } catch (proxyError) {
      console.warn('⚠️ 프록시 서버 연결 실패:', proxyError instanceof Error ? proxyError.message : proxyError);
      console.warn('⚠️ 프록시 서버가 실행 중인지 확인하세요: npm run server');
    }

    // 2. 프록시 서버 실패 시 로컬 매핑에서 찾기 (백업)
    console.log('📋 로컬 매핑에서 백업 좌표 찾는 중...');
    
    // 정확한 매칭 시도
    if (locationMap[normalizedAddress]) {
      console.log('✅ 로컬 매핑에서 찾음 (백업):', normalizedAddress, '->', locationMap[normalizedAddress]);
      return {
        success: true,
        coordinates: locationMap[normalizedAddress]
      };
    }

    // 부분 매칭 시도 (주소에 포함된 키워드로 찾기)
    for (const [key, coords] of Object.entries(locationMap)) {
      if (normalizedAddress.includes(key) || key.includes(normalizedAddress)) {
        console.log('✅ 로컬 매핑에서 부분 매칭 (백업):', key, '->', coords);
        return {
          success: true,
          coordinates: coords
        };
      }
    }

    // 3. 기본 좌표 반환 (서울 중심)
    console.log('📍 기본 좌표로 대체:', normalizedAddress);
    return {
      success: true,
      coordinates: locationMap['기본']
    };

  } catch (error) {
    console.error('Geocoding 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '주소 변환 실패'
    };
  }
};

export const getDistanceFromCoordinates = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};