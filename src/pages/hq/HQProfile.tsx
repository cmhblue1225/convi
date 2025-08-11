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
  BuildingOfficeIcon,
  PencilIcon,
  ShieldCheckIcon,
  CogIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface SystemStats {
  totalStores: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

const HQProfile: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalStores: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadSystemData();
    }
  }, [user]);

  const loadSystemData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // 시스템 통계 로드
      const [storesResult, usersResult, ordersResult] = await Promise.all([
        supabase.from('stores').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('orders').select('id, total_amount', { count: 'exact' })
      ]);

      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      setSystemStats({
        totalStores: storesResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalRevenue
      });
    } catch (error) {
      console.error('시스템 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 프로필</h1>
          <p className="mt-2 text-gray-600">시스템 관리자 계정 정보와 설정을 관리하세요</p>
        </div>

        <div className="space-y-6">
          {/* 시스템 현황 섹션 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              시스템 현황
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">총 지점 수</p>
                    <p className="text-2xl font-bold text-blue-900">{systemStats.totalStores}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <UserIcon className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">총 사용자 수</p>
                    <p className="text-2xl font-bold text-green-900">{systemStats.totalUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ChartBarIcon className="w-8 h-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">총 주문 수</p>
                    <p className="text-2xl font-bold text-purple-900">{systemStats.totalOrders}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CogIcon className="w-8 h-8 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-600">총 매출</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {systemStats.totalRevenue.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 개인정보 섹션 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              관리자 정보
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
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  본사 관리자
                </span>
              </div>
            </div>
          </div>

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
                  <p className="text-sm text-gray-500">관리자 계정 보안을 위해 정기적으로 변경하세요</p>
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
                  <p className="text-sm text-gray-500">관리자 계정 보안을 강화하세요</p>
                </div>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  설정
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">접속 기록</p>
                  <p className="text-sm text-gray-500">최근 로그인 기록을 확인하세요</p>
                </div>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  확인
                </button>
              </div>
            </div>
          </div>

          {/* 시스템 설정 섹션 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CogIcon className="w-5 h-5 mr-2" />
              시스템 설정
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">시스템 백업</p>
                  <p className="text-sm text-gray-500">데이터베이스 백업을 생성합니다</p>
                </div>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  백업 생성
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">시스템 로그</p>
                  <p className="text-sm text-gray-500">시스템 활동 로그를 확인합니다</p>
                </div>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  로그 확인
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">사용자 관리</p>
                  <p className="text-sm text-gray-500">전체 사용자 계정을 관리합니다</p>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  관리
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
                <span>시스템 오류 알림</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span>신규 지점 등록 알림</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span>공급 요청 알림</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span>일일 리포트 알림</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span>이메일 수신 동의</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
            </div>
          </div>

          {/* 개인정보 및 데이터 관리 섹션 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2" />
              데이터 관리
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">시스템 데이터 내보내기</p>
                  <p className="text-sm text-gray-500">전체 시스템 데이터를 내보냅니다</p>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  내보내기
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">데이터 정리</p>
                  <p className="text-sm text-gray-500">오래된 데이터를 정리합니다</p>
                </div>
                <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                  정리
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
          console.log('관리자 비밀번호 변경 완료');
        }}
      />
    </div>
  );
};

export default HQProfile;