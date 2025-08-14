import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import type { Store } from '../../types/common';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import GoogleMap from '../../components/map/GoogleMap';
import { geocodeAddress, getDistanceFromCoordinates } from '../../lib/geocoding/google-geocoding';

const StoreSelection: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapStores, setMapStores] = useState<Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    address: string;
    phone?: string;
    delivery_available?: boolean;
    pickup_available?: boolean;
  }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🚀 useEffect 실행');
    
    // localStorage에서 이전 지점 정보 정리
    localStorage.removeItem('selectedStore');
    console.log('🧹 이전 지점 정보 정리 완료');
    
    fetchStores();
    getUserLocation();

    // 실시간 구독 설정
    const subscription = supabase
      .channel('stores_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stores' }, 
        (payload) => {
          console.log('🔄 지점 데이터 변경 감지:', payload);
          // 즉시 데이터 새로고침
          setTimeout(() => {
            fetchStores();
          }, 100);
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 지점 실시간 구독 해제');
      subscription.unsubscribe();
    };
  }, []);

  const fetchStores = async () => {
    try {
      console.log('🔍 fetchStores 시작...');
      setLoading(true);
      setError(null);
      
      console.log('📡 데이터베이스에서 활성 지점 조회...');
      
      // 실제 데이터베이스에서 활성화된 지점들 조회 (캐시 무시)
      const timestamp = Date.now();
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ 지점 조회 실패:', error);
        setError('지점 정보를 불러오는데 실패했습니다.');
        return;
      }

      if (data && data.length > 0) {
        console.log('✅ 지점 조회 성공:', data.length, '개 지점');
        
        // 데이터베이스 결과를 Store 타입으로 변환
        const storesData: Store[] = data.map(store => {
          const storeData = {
            id: store.id,
            name: store.name,
            address: store.address,
            phone: store.phone,
            business_hours: store.business_hours || {
              monday: { open: '06:00', close: '24:00' },
              tuesday: { open: '06:00', close: '24:00' },
              wednesday: { open: '06:00', close: '24:00' },
              thursday: { open: '06:00', close: '24:00' },
              friday: { open: '06:00', close: '24:00' },
              saturday: { open: '06:00', close: '24:00' },
              sunday: { open: '06:00', close: '24:00' }
            },
            delivery_available: store.delivery_available || false,
            pickup_available: store.pickup_available || false,
            delivery_radius: store.delivery_radius || 3000,
            min_order_amount: store.min_order_amount || 15000,
            delivery_fee: store.delivery_fee || 3000,
            is_active: store.is_active,
            created_at: store.created_at,
            updated_at: store.updated_at
          };
          
          console.log(`📋 지점 정보: ${storeData.name} - 배송: ${storeData.delivery_available}, 픽업: ${storeData.pickup_available}`);
          return storeData;
        });
        
        setStores(storesData);
        
        // 각 지점의 주소를 좌표로 변환
        const storesForMap: typeof mapStores = [];
        
        for (const store of storesData) {
          const geocodingResult = await geocodeAddress(store.address);
          
          if (geocodingResult.success && geocodingResult.coordinates) {
            storesForMap.push({
              id: store.id,
              name: store.name,
              lat: geocodingResult.coordinates.lat,
              lng: geocodingResult.coordinates.lng,
              address: store.address,
              phone: store.phone,
              delivery_available: store.delivery_available,
              pickup_available: store.pickup_available
            });
            console.log(`✅ ${store.name} 좌표 변환 성공:`, geocodingResult.coordinates);
          } else {
            console.warn(`⚠️ ${store.name} 주소 변환 실패: ${geocodingResult.error}`);
            console.warn(`   주소: ${store.address}`);
            // 좌표 변환에 실패한 경우 지도에 표시하지 않음
          }
        }
        
        setMapStores(storesForMap);
      } else {
        console.log('⚠️ 활성화된 지점이 없습니다.');
        setStores([]);
      }
      
            console.log('🏁 fetchStores 완료');
    } catch (error) {
      console.error('❌ fetchStores 예외 발생:', error);
      setError('지점 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // devices에서 위치 정보 가져오기
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          console.log('📍 사용자 위치 업데이트:', newLocation);
        },
        (error) => {
          console.log('위치 정보를 가져올 수 없습니다:', error);
          
          // 사용자에게 친숙한 에러 메시지
          let userMessage = '';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              userMessage = '위치 권한을 허용하면 가까운 지점을 찾을 수 있습니다.';
              break;
            case error.POSITION_UNAVAILABLE:
              userMessage = '위치 정보를 사용할 수 없어 기본 위치로 설정됩니다.';
              break;
            case error.TIMEOUT:
              userMessage = '위치 검색 시간이 초과되었습니다.';
              break;
            default:
              userMessage = '위치 정보를 가져올 수 없습니다.';
          }
          
          console.log('ℹ️ 위치 정보:', userMessage);
          // 기본 위치로 설정 (서울 중심)
          setUserLocation({ lat: 37.5665, lng: 126.9780 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5분
        }
      );
    } else {
      console.log('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      // 기본 위치로 설정
      setUserLocation({ lat: 37.5665, lng: 126.9780 });
    }
  };

  // 거리 계산 함수 (간단한 직선 거리)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
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

  const selectStore = async (store: Store) => {
    try {
      console.log('🏪 지점 선택:', store.name);
      
      // 최신 지점 정보를 데이터베이스에서 다시 조회
      const { data: latestStore, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', store.id)
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
      
      // 최신 정보로 업데이트된 Store 객체 생성
      const updatedStore: Store = {
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
      
      console.log('✅ 최신 지점 정보:', updatedStore);
      
      // 최신 정보를 로컬 스토리지에 저장
      localStorage.setItem('selectedStore', JSON.stringify(updatedStore));
      navigate('/customer/products');
    } catch (error) {
      console.error('❌ 지점 선택 중 오류:', error);
      alert('지점 선택 중 오류가 발생했습니다.');
    }
  };

  const formatBusinessHours = (businessHours: any) => {
    if (typeof businessHours === 'object' && businessHours.monday) {
      return `${businessHours.monday.open} - ${businessHours.monday.close}`;
    }
    return '06:00 - 24:00';
  };

  console.log('🎨 렌더링 시점 - loading:', loading, 'stores:', stores.length, 'error:', error);
  
  if (loading) {
    console.log('🔄 로딩 스피너 표시 중...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={fetchStores}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 지도에서 지점 선택 시 호출되는 함수
  const handleMapStoreSelect = (mapStore: typeof mapStores[0]) => {
    const store = stores.find(s => s.id === mapStore.id);
    if (store) {
      selectStore(store);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 페이지 제목 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">지점 선택</h1>
          <p className="text-gray-600">가까운 편의점을 선택해주세요</p>
          {userLocation && (
            <p className="text-sm text-blue-600 mt-2">
              📍 현재 위치 기준으로 가까운 순서대로 표시됩니다
            </p>
          )}
        </div>
        
        {/* Google Maps */}
        <div className="mb-8">
          <GoogleMap
            width="100%"
            height="500px"
            stores={mapStores}
            userLocation={userLocation}
            onStoreSelect={handleMapStoreSelect}
            zoom={13}
          />
        </div>
        
        {/* 지점 목록 (거리순 정렬) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {stores
            .map((store) => {
              // 지도 데이터에서 해당 지점의 좌표를 찾아 거리 계산
              let distance = null;
              if (userLocation) {
                const mapStore = mapStores.find(ms => ms.id === store.id);
                if (mapStore) {
                  distance = getDistanceFromCoordinates(
                    userLocation.lat, userLocation.lng,
                    mapStore.lat, mapStore.lng
                  );
                }
              }
              return { ...store, distance };
            })
            .sort((a, b) => {
              // 거리순 정렬 (거리 정보가 없는 경우 맨 뒤로)
              if (a.distance === null && b.distance === null) return 0;
              if (a.distance === null) return 1;
              if (b.distance === null) return -1;
              return a.distance - b.distance;
            })
            .map((storeWithDistance) => {
              const store = storeWithDistance;
              const distance = storeWithDistance.distance;

            return (
              <div
                key={store.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-blue-300"
                onClick={() => selectStore(store)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl text-gray-900">{store.name}</h3>
                  {distance && (
                    <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                      {distance.toFixed(1)}km
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{store.address}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm">{store.phone}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{formatBusinessHours(store.business_hours)}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mb-4">
                  {store.delivery_available && (
                    <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                      🚚 배송 가능
                    </span>
                  )}
                  {store.pickup_available && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                      🏪 픽업 가능
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-500 space-y-1">
                  {store.min_order_amount && store.min_order_amount > 0 && (
                    <div>최소 주문금액: {store.min_order_amount.toLocaleString()}원</div>
                  )}
                  {store.delivery_fee && store.delivery_fee > 0 && (
                    <div>배송비: {store.delivery_fee.toLocaleString()}원</div>
                  )}
                  {store.delivery_radius && (
                    <div>배송 반경: {(store.delivery_radius / 1000).toFixed(1)}km</div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">지점 선택</span>
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {stores.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">현재 이용 가능한 지점이 없습니다.</div>
            <button 
              onClick={fetchStores}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              새로고침
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreSelection;