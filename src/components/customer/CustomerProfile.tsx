import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import type { UserProfile, UserCoupon, Point } from '../../types/common';
import { useAuthStore } from '../../stores/common/authStore';

const CustomerProfile: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserCoupons();
      fetchPoints();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('프로필 조회 오류:', error);
    }
  };

  const fetchUserCoupons = async () => {
    try {
      console.log('🎫 사용자 쿠폰 조회 시작:', user?.id);
      const { data, error } = await supabase
        .from('user_coupons')
        .select(`
          *,
          coupon:coupons(*)
        `)
        .eq('user_id', user?.id)
        .eq('is_used', false);

      if (error) throw error;
      console.log('🎫 조회된 쿠폰 데이터:', data);
      setUserCoupons(data || []);
    } catch (error) {
      console.error('쿠폰 조회 오류:', error);
    }
  };

  const fetchPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPoints(data || []);

      // 총 포인트 계산
      const total = (data || []).reduce((sum, point) => {
        if (point.type === 'earned' || point.type === 'bonus') {
          return sum + point.amount;
        } else if (point.type === 'used' || point.type === 'expired') {
          return sum - point.amount;
        }
        return sum;
      }, 0);
      setTotalPoints(total);
    } catch (error) {
      console.error('포인트 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getCouponStatus = (coupon: UserCoupon) => {
    if (coupon.is_used) return '사용됨';
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return '만료됨';
    }
    return '사용 가능';
  };

  const getPointTypeText = (type: string) => {
    switch (type) {
      case 'earned': return '적립';
      case 'used': return '사용';
      case 'expired': return '만료';
      case 'bonus': return '보너스';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">마이페이지</h1>

        {/* 프로필 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">프로필 정보</h2>
          {profile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">이름</label>
                <p className="mt-1 text-gray-900">{profile.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">이메일</label>
                <p className="mt-1 text-gray-900">{profile.email || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">전화번호</label>
                <p className="mt-1 text-gray-900">{profile.phone || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">가입일</label>
                <p className="mt-1 text-gray-900">{formatDate(profile.created_at)}</p>
              </div>
            </div>
          )}
        </div>

        {/* 포인트 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">포인트</h2>
          <div className="mb-4">
            <div className="text-3xl font-bold text-blue-600">
              {totalPoints.toLocaleString()} P
            </div>
            <p className="text-sm text-gray-600">보유 포인트</p>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-3">포인트 내역</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {points.map((point) => (
                <div key={point.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <span className={`text-sm font-medium ${
                      point.type === 'earned' || point.type === 'bonus' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {point.type === 'earned' || point.type === 'bonus' ? '+' : '-'}
                      {point.amount.toLocaleString()} P
                    </span>
                    <p className="text-xs text-gray-500">{point.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{getPointTypeText(point.type)}</span>
                    <p className="text-xs text-gray-400">{formatDate(point.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 쿠폰 정보 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">보유 쿠폰</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCoupons.map((userCoupon) => {
              // 쿠폰 정보가 없는 경우 처리
              if (!userCoupon.coupon) {
                return (
                  <div key={userCoupon.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">쿠폰 정보 없음</h3>
                      <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">
                        오류
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">쿠폰 정보를 불러올 수 없습니다.</p>
                  </div>
                );
              }

              return (
                <div key={userCoupon.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{userCoupon.coupon.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      getCouponStatus(userCoupon) === '사용 가능' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getCouponStatus(userCoupon)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{userCoupon.coupon.description || '설명이 없습니다'}</p>
                  <div className="text-sm text-gray-500">
                    <p>할인: {userCoupon.coupon.discount_type === 'percentage' 
                      ? `${userCoupon.coupon.discount_value}%` 
                      : `${userCoupon.coupon.discount_value?.toLocaleString() || '0'}원`}</p>
                    <p>최소 주문: {userCoupon.coupon.min_order_amount?.toLocaleString() || '0'}원</p>
                    {userCoupon.expires_at && (
                      <p>만료일: {formatDate(userCoupon.expires_at)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {userCoupons.length === 0 && (
            <p className="text-gray-500 text-center py-8">보유한 쿠폰이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
