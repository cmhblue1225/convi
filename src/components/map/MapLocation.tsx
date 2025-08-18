// 네이버 지도로 위치 정보 가져오기
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { geocodeAddress, getDistanceFromCoordinates } from '../../lib/geocoding/geocoding';

// 전역 플래그로 중복 호출 완전 차단
let isStoreDataLoading = false;
let storeDataCache: any[] = [];

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
  const isDataLoaded = useRef(false);
  const markersRef = useRef<any[]>([]);
  const navigate = useNavigate();

  const fetchRealStores = useCallback(async () => {
    // 전역 플래그로 중복 호출 차단
    if (isStoreDataLoading) {
      console.log('🔄 이미 지점 데이터 로딩 중 - 중복 호출 차단');
      return;
    }
    
    // 캐시된 데이터가 있으면 사용
    if (storeDataCache.length > 0) {
      console.log('💾 캐시된 지점 데이터 사용:', storeDataCache.length, '개 지점');
      setRealStores(storeDataCache);
      return;
    }
    
    isStoreDataLoading = true;
    
    try {
      console.log('📍 지점 데이터 로드 시작...');
      const { data: storesData, error } = await supabase
        .from('stores')
        .select('id, name, address')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('지점 데이터 조회 실패:', error);
        isStoreDataLoading = false;
        return;
      }

      if (!storesData || storesData.length === 0) {
        console.log('활성화된 지점이 없습니다.');
        isStoreDataLoading = false;
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

      // 캐시에 저장
      storeDataCache = storesWithCoordinates;
      setRealStores(storesWithCoordinates);
      console.log('📍 지점 데이터 로드 완료:', storesWithCoordinates.length, '개 지점');
      
    } catch (error) {
      console.error('지점 좌표 변환 중 오류:', error);
    } finally {
      isStoreDataLoading = false;
    }
  }, []);

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

  const selectStore = async (storeId: string) => {
    try {
      const { data: latestStore, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();
      
      if (error) {
        console.error('❌ 최신 지점 정보 조회 실패:', error);
        alert('지점 정보를 불러오는데 실패했습니다.');
        return;
      }
      
      if (!latestStore.is_active) {
        alert('이 지점은 현재 운영 중단 상태입니다.');
        return;
      }
      
      const updatedStore = {
        id: latestStore.id,
        name: latestStore.name,
        address: latestStore.address,
        phone: latestStore.phone,
        business_hours: latestStore.business_hours || {
          monday: { open: '06:00', close: '24:00' },
          tuesday: { open: '06:00', close: '24:00' },
          wednesday: { open: '06:00', close: '24:00' },
          thursday: { open: '06:00', close: '24:00' },
          friday: { open: '06:00', close: '24:00' },
          saturday: { open: '06:00', close: '24:00' },
          sunday: { open: '06:00', close: '24:00' }
        },
        delivery_available: latestStore.delivery_available || false,
        pickup_available: latestStore.pickup_available || false,
        delivery_radius: latestStore.delivery_radius || 3000,
        min_order_amount: latestStore.min_order_amount || 15000,
        delivery_fee: latestStore.delivery_fee || 3000,
        is_active: latestStore.is_active,
        created_at: latestStore.created_at,
        updated_at: latestStore.updated_at
      };
      
      localStorage.setItem('selectedStore', JSON.stringify(updatedStore));
      navigate('/customer/products');
    } catch (error) {
      console.error('❌ 지점 선택 중 오류:', error);
      alert('지점 선택 중 오류가 발생했습니다.');
    }
  };

  const addAllStoreMarkers = (naverMap: any, userLat: number, userLng: number) => {
    // 네이버 지도 API가 완전히 로드되었는지 확인
    if (!window.naver || !window.naver.maps || !window.naver.maps.Marker) {
      console.error('네이버 지도 API가 아직 로드되지 않았습니다.');
      return;
    }

    // 기존 마커들 제거
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // 실제 지점들 추가
    realStores.forEach(store => {
      if (store.lat !== null && store.lng !== null) {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(store.lat, store.lng),
          map: naverMap,
          title: store.name,
        });

        // 마커를 참조 배열에 추가
        markersRef.current.push(marker);

        const distance = getDistanceFromCoordinates(userLat, userLng, store.lat, store.lng);
        
        if (!window.naver?.maps?.InfoWindow || !window.naver?.maps?.Event) {
          console.error('네이버 지도 InfoWindow 또는 Event API가 없습니다.');
          return;
        }
        
        const contentId = `store-info-${store.id}`;
        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div id="${contentId}" style="padding: 10px; font-size: 14px; cursor: pointer; user-select: none; min-width: 200px;">
              <div style="border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 8px;">
                <strong style="color: #333; font-size: 16px;">${store.name}</strong>
              </div>
              <div style="margin-bottom: 6px;">
                <span style="color: #666; font-size: 13px;">${store.address}</span>
              </div>
              <div style="margin-bottom: 10px;">
                <span style="color: #4285f4; font-size: 12px; font-weight: 500;">거리: ${distance.toFixed(1)}km</span>
              </div>
              <div style="text-align: center; padding: 8px; background-color: #f8f9fa; border-radius: 4px; border: 1px solid #dee2e6;">
                <span style="color: #495057; font-size: 13px; font-weight: 500;">📍 이 지점 선택하기</span>
              </div>
            </div>
          `
        });

        window.naver.maps.Event.addListener(marker, 'click', () => {
          if (infoWindow.getMap()) {
            infoWindow.close();
          } else {
            infoWindow.open(naverMap, marker);
            
            setTimeout(() => {
              const contentElement = document.getElementById(contentId);
              if (contentElement) {
                contentElement.addEventListener('click', (e) => {
                  e.stopPropagation();
                  selectStore(store.id);
                });
              }
            }, 100);
          }
        });
      }
    });
  };

  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current || !window.naver || !window.naver.maps || !window.naver.maps.Map) {
        console.error('네이버 지도 API가 완전히 로드되지 않았습니다.');
        return;
      }

      const defaultCenter = new window.naver.maps.LatLng(37.5665, 126.9780);
      
      const naverMap = new window.naver.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13
      });

      setMap(naverMap);
      setIsLoading(false);

      const createUserMarker = (lat: number, lng: number) => {
        if (!window.naver?.maps?.LatLng || !window.naver?.maps?.Marker) {
          console.error('네이버 지도 API 객체가 없습니다.');
          return;
        }
        
        const userPosition = new window.naver.maps.LatLng(lat, lng);
        setUserLocation({ lat, lng });

        const userMarker = new window.naver.maps.Marker({
          position: userPosition,
          map: naverMap,
          icon: {
            content: [
              '<div style="position: relative;">',
              '<div style="width: 20px; height: 20px; background-color: #22c55e; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              '</div>'
            ].join(''),
            size: new window.naver.maps.Size(26, 26),
            anchor: new window.naver.maps.Point(13, 13)
          }
        });

        const userInfoWindow = new window.naver.maps.InfoWindow({
          content: '<div style="padding: 8px; font-size: 14px; font-weight: bold; color: #22c55e;">내 위치</div>',
          backgroundColor: 'white',
          borderColor: '#22c55e',
          borderWidth: 2,
          anchorSize: new window.naver.maps.Size(10, 10),
          anchorSkew: true,
          anchorColor: 'white',
          pixelOffset: new window.naver.maps.Point(0, -10)
        });

        userInfoWindow.open(naverMap, userMarker);
        naverMap.setCenter(userPosition);
      };

      if (navigator.geolocation) {
        console.log('위치 정보 요청 중...');
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            console.log(`위치 찾기 성공: 위도 ${lat}, 경도 ${lng}, 정확도 ${accuracy}m`);
            createUserMarker(lat, lng);
          },
          (error) => {
            console.warn('위치 정보 가져오기 실패:', error.message);
            
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                console.log('두 번째 시도로 위치 찾기 성공');
                createUserMarker(lat, lng);
              },
              (error2) => {
                console.error('위치 정보를 가져올 수 없습니다:', error2.message);
                console.log('기본 위치(서울시청) 사용');
                setUserLocation({ lat: 37.5665, lng: 126.9780 });
              },
              {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 0
              }
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 60000
          }
        );
      } else {
        console.log('Geolocation이 지원되지 않습니다. 기본 위치 사용');
        setUserLocation({ lat: 37.5665, lng: 126.9780 });
      }
    };

    const loadNaverMapsScript = () => {
      if (window.naver?.maps?.Map) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=mmo6s8b443';
      script.onload = () => {
        // 스크립트 로드 후 약간의 지연을 두고 API 객체 완전 로드 확인
        setTimeout(() => {
          if (window.naver?.maps?.Map) {
            initializeMap();
          } else {
            console.error('네이버 지도 API 객체가 완전히 로드되지 않았습니다.');
            setIsLoading(false);
          }
        }, 100);
      };
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
  }, [fetchRealStores]);

  // 실제 지점 데이터가 로드된 후 지도에 마커 추가 (한 번만)
  useEffect(() => {
    if (map && realStores.length > 0 && userLocation) {
      console.log('📍 마커 추가 시작 - 지점 수:', realStores.length);
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