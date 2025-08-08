import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import type { UserCoupon, Point, Coupon } from '../../types/common';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Member {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

interface MemberWithStats extends Member {
  total_points: number;
  coupon_count: number;
  total_orders: number;
  total_spent: number;
}

const MemberManagement: React.FC = () => {
  const [members, setMembers] = useState<MemberWithStats[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberWithStats | null>(null);
  const [memberCoupons, setMemberCoupons] = useState<UserCoupon[]>([]);
  const [memberPoints, setMemberPoints] = useState<Point[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pointsToGive, setPointsToGive] = useState<number>(0);
  const [selectedCouponToGive, setSelectedCouponToGive] = useState<string>('');

  useEffect(() => {
    fetchMembers();
    fetchAvailableCoupons();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      fetchMemberDetails(selectedMember.id);
    }
  }, [selectedMember]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      console.log('🔍 회원 목록 조회 시작...');
      
      // 먼저 전체 profiles 확인
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('*');
      
      console.log('📊 전체 프로필:', allProfiles?.length, allProfiles);
      
      // 회원 정보 조회
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      console.log('👥 고객 프로필:', profiles?.length, profiles);
      if (profileError) {
        console.error('❌ 프로필 조회 오류:', profileError);
        throw profileError;
      }

      // 각 회원의 포인트와 쿠폰 수, 주문 통계 조회
      const membersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          // 포인트 조회
          const { data: points } = await supabase
            .from('points')
            .select('amount, type')
            .eq('user_id', profile.id);

          const totalPoints = (points || []).reduce((sum, point) => {
            if (point.type === 'earned' || point.type === 'bonus') {
              return sum + point.amount;
            } else if (point.type === 'used') {
              return sum - point.amount;
            }
            return sum;
          }, 0);

          // 쿠폰 수 조회
          const { data: coupons } = await supabase
            .from('user_coupons')
            .select('id')
            .eq('user_id', profile.id)
            .eq('is_used', false);

          // 주문 통계 조회
          const { data: orders } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('customer_id', profile.id);

          const totalOrders = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

          return {
            ...profile,
            total_points: totalPoints,
            coupon_count: coupons?.length || 0,
            total_orders: totalOrders,
            total_spent: totalSpent
          };
        })
      );

      console.log('✅ 회원 통계 처리 완료:', membersWithStats.length, membersWithStats);
      setMembers(membersWithStats);
    } catch (error) {
      console.error('❌ 회원 목록 조회 오류:', error);
      alert('회원 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      console.log('🏁 회원 목록 조회 완료');
    }
  };

  const fetchMemberDetails = async (memberId: string) => {
    try {
      // 회원 쿠폰 조회
      const { data: coupons, error: couponError } = await supabase
        .from('user_coupons')
        .select(`
          *,
          coupon:coupons(*)
        `)
        .eq('user_id', memberId)
        .order('created_at', { ascending: false });

      if (couponError) throw couponError;
      setMemberCoupons(coupons || []);

      // 회원 포인트 내역 조회
      const { data: points, error: pointError } = await supabase
        .from('points')
        .select('*')
        .eq('user_id', memberId)
        .order('created_at', { ascending: false });

      if (pointError) throw pointError;
      setMemberPoints(points || []);
    } catch (error) {
      console.error('회원 상세 정보 조회 오류:', error);
    }
  };

  const fetchAvailableCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableCoupons(data || []);
    } catch (error) {
      console.error('쿠폰 조회 오류:', error);
    }
  };

  const givePointsToMember = async () => {
    if (!selectedMember || pointsToGive <= 0) return;

    // Check if selected member is a customer
    if (selectedMember.role !== 'customer') {
      alert('포인트는 고객 계정에만 지급할 수 있습니다.');
      return;
    }

    try {
      setActionLoading(true);
      
      const { error } = await supabase
        .from('points')
        .insert({
          user_id: selectedMember.id,
          amount: pointsToGive,
          type: 'bonus',
          description: '본사에서 지급한 보너스 포인트'
        });

      if (error) throw error;

      alert(`${selectedMember.full_name}님에게 ${pointsToGive}P를 지급했습니다.`);
      setPointsToGive(0);
      fetchMembers();
      fetchMemberDetails(selectedMember.id);
    } catch (error) {
      console.error('포인트 지급 오류:', error);
      alert('포인트 지급에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const giveCouponToMember = async () => {
    if (!selectedMember || !selectedCouponToGive) return;

    // Check if selected member is a customer
    if (selectedMember.role !== 'customer') {
      alert('쿠폰은 고객 계정에만 지급할 수 있습니다.');
      return;
    }

    try {
      setActionLoading(true);
      
      const { error } = await supabase
        .from('user_coupons')
        .insert({
          user_id: selectedMember.id,
          coupon_id: selectedCouponToGive
        });

      if (error) throw error;

      const coupon = availableCoupons.find(c => c.id === selectedCouponToGive);
      alert(`${selectedMember.full_name}님에게 "${coupon?.name}" 쿠폰을 지급했습니다.`);
      setSelectedCouponToGive('');
      fetchMembers();
      fetchMemberDetails(selectedMember.id);
    } catch (error) {
      console.error('쿠폰 지급 오류:', error);
      alert('쿠폰 지급에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.phone && member.phone.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <h3 className="text-lg font-semibold">👥 회원별 쿠폰/포인트 관리</h3>
          <p className="text-purple-100 text-sm">회원에게 쿠폰과 포인트를 개별적으로 지급할 수 있습니다</p>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  console.log('MemberManagement render - loading:', loading, 'members:', members.length);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <h3 className="text-lg font-semibold">👥 회원별 쿠폰/포인트 관리</h3>
        <p className="text-purple-100 text-sm">
          회원에게 쿠폰과 포인트를 개별적으로 지급할 수 있습니다 
          (로딩: {loading ? 'Yes' : 'No'}, 회원수: {members.length})
        </p>
      </div>

      <div className="p-6">
        {/* 검색 */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="회원 이름, 이메일, 전화번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 회원 목록 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">회원 목록 ({filteredMembers.length}명)</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-sm">
                    {searchTerm ? '검색 결과가 없습니다' : '등록된 회원이 없습니다'}
                  </p>
                </div>
              ) : (
                filteredMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMember?.id === member.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-gray-900">{member.full_name}</h5>
                      {member.email && (
                        <p className="text-sm text-gray-600">{member.email}</p>
                      )}
                      {member.phone && (
                        <p className="text-sm text-gray-600">{member.phone}</p>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-blue-600 font-medium">{member.total_points}P</div>
                      <div className="text-green-600">{member.coupon_count}장</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    주문 {member.total_orders}건 • 총 {member.total_spent.toLocaleString()}원
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* 선택된 회원 상세 정보 및 관리 */}
          <div>
            {selectedMember ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{selectedMember.full_name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">보유 포인트:</span>
                      <span className="font-medium text-blue-600 ml-2">{selectedMember.total_points}P</span>
                    </div>
                    <div>
                      <span className="text-gray-600">보유 쿠폰:</span>
                      <span className="font-medium text-green-600 ml-2">{selectedMember.coupon_count}장</span>
                    </div>
                    <div>
                      <span className="text-gray-600">총 주문:</span>
                      <span className="font-medium ml-2">{selectedMember.total_orders}건</span>
                    </div>
                    <div>
                      <span className="text-gray-600">총 구매액:</span>
                      <span className="font-medium ml-2">{selectedMember.total_spent.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>

                {/* 포인트 지급 */}
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-3">💰 포인트 지급</h5>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={pointsToGive}
                      onChange={(e) => setPointsToGive(Number(e.target.value))}
                      placeholder="지급할 포인트"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={givePointsToMember}
                      disabled={actionLoading || pointsToGive <= 0}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      지급
                    </button>
                  </div>
                </div>

                {/* 쿠폰 지급 */}
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-3">🎫 쿠폰 지급</h5>
                  <div className="flex gap-2">
                    <select
                      value={selectedCouponToGive}
                      onChange={(e) => setSelectedCouponToGive(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">쿠폰을 선택하세요</option>
                      {availableCoupons.map((coupon) => (
                        <option key={coupon.id} value={coupon.id}>
                          {coupon.name} ({coupon.discount_type === 'percentage' 
                            ? `${coupon.discount_value}%` 
                            : `${coupon.discount_value.toLocaleString()}원`})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={giveCouponToMember}
                      disabled={actionLoading || !selectedCouponToGive}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                      지급
                    </button>
                  </div>
                </div>

                {/* 보유 쿠폰 목록 */}
                {memberCoupons.length > 0 && (
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3">보유 쿠폰</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {memberCoupons.map((userCoupon) => (
                        <div key={userCoupon.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{userCoupon.coupon.name}</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              userCoupon.is_used ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-600'
                            }`}>
                              {userCoupon.is_used ? '사용됨' : '사용가능'}
                            </span>
                          </div>
                          <div className="text-gray-600">
                            {userCoupon.coupon.discount_type === 'percentage' 
                              ? `${userCoupon.coupon.discount_value}%` 
                              : `${userCoupon.coupon.discount_value.toLocaleString()}원`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 포인트 내역 */}
                {memberPoints.length > 0 && (
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3">포인트 내역</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {memberPoints.slice(0, 10).map((point) => (
                        <div key={point.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                          <div>
                            <span>{point.description || '포인트'}</span>
                            <div className="text-xs text-gray-500">
                              {new Date(point.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className={`font-medium ${
                            point.type === 'earned' || point.type === 'bonus' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {point.type === 'earned' || point.type === 'bonus' ? '+' : '-'}
                            {point.amount.toLocaleString()}P
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p>회원을 선택해주세요</p>
                <p className="text-sm">선택한 회원의 쿠폰과 포인트를 관리할 수 있습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberManagement;
