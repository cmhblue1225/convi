// 네이버 지도로 위치 정보 가져오기
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { geocodeAddress, getDistanceFromCoordinates } from '../../lib/geocoding/geocoding';

declare global {
  interface Window {
    naver: any;
  }
}

interface LocationProps {
  width?: string;
  height?: string;
}

interface MapStore {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  address: string;
}

const Location: React.FC<LocationProps> = ({ width = '80%', height = '600px' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [realStores, setRealStores] = useState<MapStore[]>([]);

  const mockGSStores = [
    { id: '1', name: 'GS25 강남역점', lat: 37.4979, lng: 127.0276, address: '서울시 강남구 강남대로 지하396' },
    { id: '2', name: 'GS25 홍대입구점', lat: 37.5563, lng: 126.9240, address: '서울시 마포구 양화로 지하 188' },
    { id: '3', name: 'GS25 명동점', lat: 37.5636, lng: 126.9832, address: '서울시 중구 명동길 14' },
    { id: '4', name: 'GS25 종로점', lat: 37.5703, lng: 126.9816, address: '서울시 종로구 종로 69' },
    { id: '5', name: 'GS25 이태원점', lat: 37.5344, lng: 126.9946, address: '서울시 용산구 이태원로 지하 지하 175' },
    { id: '6', name: 'GS25 신촌점', lat: 37.5595, lng: 126.9425, address: '서울시 서대문구 신촌로 83' },
    { id: '7', name: 'GS25 건대입구점', lat: 37.5403, lng: 127.0698, address: '서울시 광진구 능동로 지하 110' },
    { id: '8', name: 'GS25 잠실점', lat: 37.5133, lng: 127.0982, address: '서울시 송파구 올림픽로 지하 265' }
  ];

  const fetchRealStores = async () => {
    try {
      const { data: storesData, error } = await supabase
        .from('stores')
        .select('id, name, address')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('지점 데이터 조회 실패:', error);
        return;
      }

      if (!storesData || storesData.length === 0) {
        console.log('활성화된 지점이 없습니다.');
        return;
      }

      const storesWithCoordinates: MapStore[] = [];
      
      for (const store of storesData) {
        const geocodingResult = await geocodeAddress(store.address);
        
        if (geocodingResult.success && geocodingResult.coordinates) {
          storesWithCoordinates.push({
            id: store.id,
            name: store.name,
            address: store.address,
            lat: geocodingResult.coordinates.lat,
            lng: geocodingResult.coordinates.lng
          });
          console.log(`✅ ${store.name} 좌표 변환 성공:`, geocodingResult.coordinates);
        } else {
          console.warn(`⚠️ ${store.name} 주소 변환 실패: ${geocodingResult.error}`);
          console.warn(`   주소: ${store.address}`);
          // 좌표 변환에 실패한 경우 해당 지점은 추가하지 않음 (마커 표시 안함)
        }
      }

      setRealStores(storesWithCoordinates);
    } catch (error) {
      console.error('지점 좌표 변환 중 오류:', error);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
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

  const addAllStoreMarkers = (naverMap: any, userLat: number, userLng: number) => {
    // Mock 지점들 추가 (파란색 마커)
    mockGSStores.forEach(store => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(store.lat, store.lng),
        map: naverMap,
        title: store.name
      });

      const distance = calculateDistance(userLat, userLng, store.lat, store.lng);
      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px; font-size: 14px;">
            <strong>${store.name}</strong><br/>
            <span style="color: #666;">${store.address}</span><br/>
            <span style="color: #4285f4; font-size: 12px;">거리: ${distance.toFixed(1)}km</span>
          </div>
        `
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(naverMap, marker);
        }
      });
    });

    // 실제 지점들 추가 (빨간색 마커)
    realStores.forEach(store => {
      if (store.lat !== null && store.lng !== null) {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(store.lat, store.lng),
          map: naverMap,
          title: store.name,
          icon: {
            content: '<div style="background: red; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
            size: new window.naver.maps.Size(24, 24),
            anchor: new window.naver.maps.Point(12, 12)
          }
        });

        const distance = getDistanceFromCoordinates(userLat, userLng, store.lat, store.lng);
        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="padding: 10px; font-size: 14px;">
              <strong style="color: red;">${store.name}</strong><br/>
              <span style="color: #666;">${store.address}</span><br/>
              <span style="color: #e74c3c; font-size: 12px;">거리: ${distance.toFixed(1)}km</span>
              <br/><span style="color: #e74c3c; font-size: 11px;">실제 지점</span>
            </div>
          `
        });

        window.naver.maps.Event.addListener(marker, 'click', () => {
          if (infoWindow.getMap()) {
            infoWindow.close();
          } else {
            infoWindow.open(naverMap, marker);
          }
        });
      }
    });
  };

  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current || !window.naver) return;

      const defaultCenter = new window.naver.maps.LatLng(37.5665, 126.9780);
      
      const naverMap = new window.naver.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13
      });

      setMap(naverMap);
      setIsLoading(false);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const userPosition = new window.naver.maps.LatLng(lat, lng);

            setUserLocation({ lat, lng });

            const userMarker = new window.naver.maps.Marker({
              position: userPosition,
              map: naverMap
            });

            naverMap.setCenter(userPosition);
            addAllStoreMarkers(naverMap, lat, lng);
          },
          (error) => {
            console.warn('위치 정보를 가져올 수 없습니다:', error);
            addAllStoreMarkers(naverMap, 37.5665, 126.9780);
          }
        );
      } else {
        addAllStoreMarkers(naverMap, 37.5665, 126.9780);
      }
    };

    const loadNaverMapsScript = () => {
      if (window.naver) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=mmo6s8b443';
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('네이버 지도 스크립트를 로드할 수 없습니다.');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    fetchRealStores();
    loadNaverMapsScript();

    return () => {
      const scripts = document.querySelectorAll('script[src*="oapi.map.naver.com"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  // 실제 지점 데이터가 로드된 후 지도에 마커 추가
  useEffect(() => {
    if (map && realStores.length > 0 && userLocation) {
      // 기존 마커들 제거하고 다시 추가
      addAllStoreMarkers(map, userLocation.lat, userLocation.lng);
    }
  }, [realStores, map, userLocation]);

  const mapStyle: React.CSSProperties = {
    width,
    height,
    margin: '20px auto',
    display: 'block',
    border: '1px solid #ccc'
  };

  return (
    <div>
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          지도를 로딩 중입니다...
        </div>
      )}
      <div ref={mapRef} style={mapStyle} />
    </div>
  );
};

export default Location;