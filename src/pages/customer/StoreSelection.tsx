import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import type { Store } from '../../types/common';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const StoreSelection: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🚀 useEffect 실행');
    fetchStores();
    getUserLocation();
  }, []);

  const fetchStores = async () => {
    try {
      console.log('🔍 fetchStores 시작...');
      setLoading(true);
      setError(null);
      
      console.log('📡 데이터베이스에서 활성 지점 조회...');
      
      // 실제 데이터베이스에서 활성화된 지점들 조회
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
        const storesData: Store[] = data.map(store => ({
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
          delivery_available: store.delivery_available || true,
          pickup_available: store.pickup_available || true,
          delivery_radius: store.delivery_radius || 3000,
          min_order_amount: store.min_order_amount || 15000,
          delivery_fee: store.delivery_fee || 3000,
          is_active: store.is_active,
          created_at: store.created_at,
          updated_at: store.updated_at
        }));
        
        setStores(storesData);
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

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('위치 정보를 가져올 수 없습니다:', error);
        }
      );
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

  const selectStore = (store: Store) => {
    // 선택한 지점을 로컬 스토리지에 저장
    localStorage.setItem('selectedStore', JSON.stringify(store));
    navigate('/customer/products');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">지점 선택</h1>
          <p className="text-gray-600">가까운 편의점을 선택해주세요</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {stores.map((store) => {
            // 위치 정보가 있을 경우 거리 계산 (임시로 서울 중심 좌표 사용)
            let distance = null;
            if (userLocation) {
              // 임시 좌표 (실제로는 store.location에서 파싱해야 함)
              const storeCoords = {
                lat: store.name.includes('강남') ? 37.4979 : 
                     store.name.includes('홍대') ? 37.5563 : 37.5133,
                lng: store.name.includes('강남') ? 127.0276 : 
                     store.name.includes('홍대') ? 126.9240 : 127.0982
              };
              distance = calculateDistance(
                userLocation.lat, userLocation.lng,
                storeCoords.lat, storeCoords.lng
              );
            }

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