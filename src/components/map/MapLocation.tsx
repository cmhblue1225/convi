// 네이버 지도로 위치 정보 가져오기
import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    naver: any;
  }
}

interface LocationProps {
  width?: string;
  height?: string;
}

interface GSStore {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

const Location: React.FC<LocationProps> = ({ width = '80%', height = '600px' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const mockGSStores: GSStore[] = [
    { id: '1', name: 'GS25 강남역점', lat: 37.4979, lng: 127.0276, address: '서울시 강남구 강남대로 지하396' },
    { id: '2', name: 'GS25 홍대입구점', lat: 37.5563, lng: 126.9240, address: '서울시 마포구 양화로 지하 188' },
    { id: '3', name: 'GS25 명동점', lat: 37.5636, lng: 126.9832, address: '서울시 중구 명동길 14' },
    { id: '4', name: 'GS25 종로점', lat: 37.5703, lng: 126.9816, address: '서울시 종로구 종로 69' },
    { id: '5', name: 'GS25 이태원점', lat: 37.5344, lng: 126.9946, address: '서울시 용산구 이태원로 지하 지하 175' },
    { id: '6', name: 'GS25 신촌점', lat: 37.5595, lng: 126.9425, address: '서울시 서대문구 신촌로 83' },
    { id: '7', name: 'GS25 건대입구점', lat: 37.5403, lng: 127.0698, address: '서울시 광진구 능동로 지하 110' },
    { id: '8', name: 'GS25 잠실점', lat: 37.5133, lng: 127.0982, address: '서울시 송파구 올림픽로 지하 265' }
  ];

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

  const addGSStoreMarkers = (naverMap: any, userLat: number, userLng: number) => {
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

            new window.naver.maps.Marker({
              position: userPosition,
              map: naverMap
            });

            naverMap.setCenter(userPosition);
            addGSStoreMarkers(naverMap, lat, lng);
          },
          (error) => {
            console.warn('위치 정보를 가져올 수 없습니다:', error);
            addGSStoreMarkers(naverMap, 37.5665, 126.9780);
          }
        );
      } else {
        addGSStoreMarkers(naverMap, 37.5665, 126.9780);
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

    loadNaverMapsScript();

    return () => {
      const scripts = document.querySelectorAll('script[src*="oapi.map.naver.com"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

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