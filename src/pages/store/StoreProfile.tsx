import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/common/authStore';
import { supabase } from '../../lib/supabase/client';
import PasswordChangeModal from '../../components/common/PasswordChangeModal';
import {
  UserIcon,
  KeyIcon,
  BellIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  PencilIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface StoreInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  business_hours: any;
  delivery_available: boolean;
  pickup_available: boolean;
}

const StoreProfile: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadStoreData();
    }
  }, [user]);

  const loadStoreData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // 점주의 지점 정보 로드
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (storeData) {
        setStoreInfo(storeData);
      }
    } catch (error) {
      console.error('지점 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">프로필 관리</h1>
          <p className="mt-2 text-gray-600">계정 정보와 지점 설정을 관리하세요</p>
        </div>

        <div className="space-y-6">
          {/* 개인정보 섹션 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              개인정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <div className="flex items-center">
                  <span className="text-gray-900">{profile?.first_name} {profile?.last_name}</span>
                  <PencilIcon className="w-4 h-4 ml-2 text-gray-400 cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <div className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-900">{user?.email}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                <div className="flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-900">{profile?.phone || '연락처 없음'}</span>
                  <PencilIcon className="w-4 h-4 ml-2 text-gray-400 cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  점주
                </span>
              </div>
            </div>
          </div>

          {/* 지점 정보 섹션 */}
          {storeInfo && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BuildingStorefrontIcon className="w-5 h-5 mr-2" />
                지점 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">지점명</label>
                  <div className="flex items-center">
                    <span className="text-gray-900">{storeInfo.name}</span>
                    <PencilIcon className="w-4 h-4 ml-2 text-gray-400 cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">지점 전화번호</label>
                  <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-900">{storeInfo.phone}</span>
                    <PencilIcon className="w-4 h-4 ml-2 text-gray-400 cursor-pointer" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">지점 주소</label>
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-900">{storeInfo.address}</span>
                    <PencilIcon className="w-4 h-4 ml-2 text-gray-400 cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">배송 서비스</label>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                    storeInfo.delivery_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {storeInfo.delivery_available ? '이용 가능' : '이용 불가'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">픽업 서비스</label>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                    storeInfo.pickup_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {storeInfo.pickup_available ? '이용 가능' : '이용 불가'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 보안 설정 섹션 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <KeyIcon className="w-5 h-5 mr-2" />
              보안 설정
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">비밀번호 변경</p>
                  <p className="text-sm text-gray-500">계정 보안을 위해 정기적으로 변경하세요</p>
                </div>
                <button 
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  변경
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">2단계 인증</p>
                  <p className="text-sm text-gray-500">계정 보안을 강화하세요</p>
                </div>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  설정
                </button>
              </div>
            </div>
          </div>

          {/* 알림 설정 섹션 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BellIcon className="w-5 h-5 mr-2" />
              알림 설정
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>새 주문 알림</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span>재고 부족 알림</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span>공급 요청 승인 알림</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span>이메일 수신 동의</span>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span>SMS 수신 동의</span>
                <input type="checkbox" className="toggle" />
              </div>
            </div>
          </div>

          {/* 개인정보 및 데이터 관리 섹션 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2" />
              개인정보 및 데이터 관리
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">개인정보 다운로드</p>
                  <p className="text-sm text-gray-500">내 개인정보를 다운로드할 수 있습니다</p>
                </div>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  다운로드
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">계정 삭제</p>
                  <p className="text-sm text-gray-500">계정을 영구적으로 삭제합니다</p>
                </div>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          console.log('비밀번호 변경 완료');
        }}
      />
    </div>
  );
};

export default StoreProfile;