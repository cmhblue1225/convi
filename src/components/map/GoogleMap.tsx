import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { LoadingSpinner } from '../common/LoadingSpinner';

// Google Maps API 타입 정의
declare global {
  interface Window {
    google: typeof google;
  }
}

interface MapStore {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone?: string;
  delivery_available?: boolean;
  pickup_available?: boolean;
}

interface GoogleMapProps {
  width?: string;
  height?: string;
  stores?: MapStore[];
  userLocation?: { lat: number; lng: number } | null;
  onStoreSelect?: (store: MapStore) => void;
  zoom?: number;
  center?: { lat: number; lng: number };
}

interface MapComponentProps extends Omit<GoogleMapProps, 'stores'> {
  stores: MapStore[];
}

// Google Maps 렌더링 컴포넌트
const MapComponent: React.FC<MapComponentProps> = ({
  width = '100%',
  height = '600px',
  stores,
  userLocation,
  onStoreSelect,
  zoom = 13,
  center
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // 거리 계산 함수
  const calculateDistance = useCallback((
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
  }, []);

  // 현재 위치로 이동하는 함수
  const goToCurrentLocation = useCallback(() => {
    if (!map) return;

    setIsLocating(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // 지도를 현재 위치로 이동 (부드러운 애니메이션)
          map.panTo(newLocation);
          map.setZoom(15); // 조금 더 확대

          setIsLocating(false);
          console.log('📍 현재 위치로 이동:', newLocation);
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          setIsLocating(false);
          
          // 에러 메시지 표시
          let errorMessage = '위치 정보를 가져올 수 없습니다.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다.';
              break;
            case error.TIMEOUT:
              errorMessage = '위치 정보 요청이 시간 초과되었습니다.';
              break;
          }
          
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5분
        }
      );
    } else {
      setIsLocating(false);
      alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
    }
  }, [map]);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const mapCenter = center || userLocation || { lat: 37.5665, lng: 126.9780 }; // 서울 중심

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: 'greedy', // 터치 제스처 개선
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }] // POI 라벨 숨기기
        }
      ]
    });

    const newInfoWindow = new window.google.maps.InfoWindow();

    setMap(newMap);
    setInfoWindow(newInfoWindow);

    console.log('✅ Google Map 초기화 완료');
  }, [center, userLocation, zoom]);

  // 사용자 위치 마커 추가
  useEffect(() => {
    if (!map || !userLocation) return;

    // 현재 위치 마커 (더 눈에 띄는 디자인)
    const userMarker = new window.google.maps.Marker({
      position: userLocation,
      map,
      title: '내 현재 위치',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="#4285F4" stroke="#ffffff" stroke-width="3"/>
            <circle cx="16" cy="16" r="8" fill="#ffffff"/>
            <circle cx="16" cy="16" r="4" fill="#4285F4"/>
            <circle cx="16" cy="16" r="15" fill="none" stroke="#4285F4" stroke-width="2" stroke-dasharray="3,3" opacity="0.7"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 16),
        zIndex: 1000 // 다른 마커보다 위에 표시
      }
    });

    // 현재 위치 주변에 반투명 원 추가 (정확도 표시)
    const accuracyCircle = new window.google.maps.Circle({
      center: userLocation,
      radius: 100, // 100미터 반경
      fillColor: '#4285F4',
      fillOpacity: 0.1,
      strokeColor: '#4285F4',
      strokeWeight: 1,
      strokeOpacity: 0.5,
      map
    });

    // 현재 위치 정보창
    const userInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="font-size: 14px; font-weight: 600; color: #4285F4; margin-bottom: 4px;">
            📍 내 현재 위치
          </div>
          <div style="font-size: 12px; color: #666;">
            위도: ${userLocation.lat.toFixed(6)}<br/>
            경도: ${userLocation.lng.toFixed(6)}
          </div>
        </div>
      `
    });

    // 사용자 위치 마커 클릭 시 정보창 표시
    userMarker.addListener('click', () => {
      userInfoWindow.open(map, userMarker);
    });

    // 사용자 위치로 지도 중심 이동
    map.setCenter(userLocation);

    console.log('✅ 사용자 위치 마커 추가:', userLocation);

    // 클린업 함수 반환
    return () => {
      userMarker.setMap(null);
      accuracyCircle.setMap(null);
    };
  }, [map, userLocation]);

  // 지점 마커 추가/업데이트
  useEffect(() => {
    if (!map || !stores || stores.length === 0) return;

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];

    stores.forEach(store => {
      const marker = new window.google.maps.Marker({
        position: { lat: store.lat, lng: store.lng },
        map,
        title: store.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C20.4183 2 24 5.58172 24 10C24 16 16 30 16 30C16 30 8 16 8 10C8 5.58172 11.5817 2 16 2Z" fill="#EA4335"/>
              <circle cx="16" cy="10" r="4" fill="white"/>
              <path d="M13 9h6v2h-6V9z" fill="#EA4335"/>
              <path d="M15 8v4h2V8h-2z" fill="#EA4335"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32)
        }
      });

      // 마커 클릭 이벤트
      marker.addListener('click', () => {
        if (!infoWindow) return;

        // 거리 계산
        let distanceText = '';
        if (userLocation) {
          const distance = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            store.lat, 
            store.lng
          );
          distanceText = `<div style="color: #4285f4; font-size: 12px; margin-top: 4px;">거리: ${distance.toFixed(1)}km</div>`;
        }

        // 서비스 정보
        const services = [];
        if (store.delivery_available) services.push('🚚 배송');
        if (store.pickup_available) services.push('🏪 픽업');
        const serviceText = services.length > 0 
          ? `<div style="color: #34a853; font-size: 12px; margin-top: 4px;">${services.join(', ')}</div>`
          : '';

        const content = `
          <div style="padding: 12px; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #202124;">${store.name}</h3>
            <div style="color: #5f6368; font-size: 14px; line-height: 1.4;">
              📍 ${store.address}
              ${store.phone ? `<br/>📞 ${store.phone}` : ''}
            </div>
            ${distanceText}
            ${serviceText}
            <button 
              onclick="window.selectStore('${store.id}')"
              style="
                margin-top: 12px; 
                padding: 8px 16px; 
                background: #4285f4; 
                color: white; 
                border: none; 
                border-radius: 6px; 
                font-size: 14px; 
                font-weight: 500;
                cursor: pointer;
                width: 100%;
              "
              onmouseover="this.style.background='#3367d6'"
              onmouseout="this.style.background='#4285f4'"
            >
              이 지점 선택하기
            </button>
          </div>
        `;

        infoWindow.setContent(content);
        infoWindow.open(map, marker);

        // 마커를 지도 중심으로 이동
        map.panTo({ lat: store.lat, lng: store.lng });
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // 전역 함수로 지점 선택 처리
    (window as any).selectStore = (storeId: string) => {
      const selectedStore = stores.find(s => s.id === storeId);
      if (selectedStore && onStoreSelect) {
        onStoreSelect(selectedStore);
      }
    };

    console.log('✅ 지점 마커 추가 완료:', stores.length, '개');

    // 모든 마커가 보이도록 지도 범위 조정
    if (stores.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      
      // 사용자 위치 포함
      if (userLocation) {
        bounds.extend(userLocation);
      }
      
      // 모든 지점 위치 포함
      stores.forEach(store => {
        bounds.extend({ lat: store.lat, lng: store.lng });
      });

      map.fitBounds(bounds);
      
      // 너무 많이 확대되는 것을 방지
      const listener = window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom() && map.getZoom()! > 15) {
          map.setZoom(15);
        }
      });
    }

    return () => {
      // 클린업: 기존 마커 제거
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, stores, userLocation, infoWindow, onStoreSelect, calculateDistance]);

  const mapStyle: React.CSSProperties = {
    width,
    height,
  };

  return (
    <div className="relative">
      <div ref={mapRef} style={mapStyle} className="rounded-lg border border-gray-200" />
      
      {/* 내 위치로 이동 버튼 */}
      {map && (
        <button
          onClick={goToCurrentLocation}
          disabled={isLocating}
          className={`
            absolute top-4 left-4 z-10
            bg-white hover:bg-gray-50 
            border border-gray-300 rounded-lg shadow-lg
            w-12 h-12 flex items-center justify-center
            transition-all duration-200
            ${isLocating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
          `}
          title="내 현재 위치로 이동"
        >
          {isLocating ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg 
              className="w-6 h-6 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

// 로딩 및 에러 처리를 위한 렌더 함수
const renderMap = (status: Status): React.ReactElement => {
  switch (status) {
    case Status.LOADING:
      return (
        <div 
          style={{ 
            height: '600px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}
        >
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Google Maps를 로딩 중입니다...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div 
          style={{ 
            height: '600px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#fee',
            borderRadius: '8px',
            border: '1px solid #fcc'
          }}
        >
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Google Maps 로딩에 실패했습니다
            </div>
            <p className="text-gray-600 text-sm">
              API 키를 확인하거나 네트워크 연결을 확인해주세요.
            </p>
          </div>
        </div>
      );
    default:
      return <div>지도 상태를 확인할 수 없습니다.</div>;
  }
};

// 메인 Google Map 컴포넌트
const GoogleMap: React.FC<GoogleMapProps> = ({ stores = [], ...props }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
      <div 
        style={{ 
          height: props.height || '600px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#fff3cd',
          borderRadius: '8px',
          border: '1px solid #ffeaa7'
        }}
      >
        <div className="text-center">
          <div className="text-yellow-800 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Google Maps API 키가 설정되지 않았습니다
          </div>
          <p className="text-yellow-700 text-sm">
            .env 파일에서 VITE_GOOGLE_MAPS_API_KEY를 설정해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Wrapper
      apiKey={apiKey}
      render={renderMap}
      libraries={['places']} // Places API 라이브러리 포함
    >
      <MapComponent stores={stores} {...props} />
    </Wrapper>
  );
};

export default GoogleMap;