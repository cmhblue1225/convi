import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  PlusIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/common/authStore';
import { supabase } from '../../lib/supabase/client';
import type { RefundRequest, RefundStatus } from '../../types/common';

const CustomerRefunds: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchRefunds();
    }
  }, [user]);

  // 환불 요청 목록 조회
  const fetchRefunds = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Supabase 함수를 사용하여 환불 요청 조회
      const { data, error } = await supabase.rpc('get_customer_refunds', {
        p_customer_id: user.id
      });

      if (error) throw error;
      
      setRefunds(data || []);
    } catch (error) {
      console.error('환불 요청 조회 실패:', error);
      alert('환불 요청을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: RefundStatus) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: RefundStatus) => {
    switch (status) {
      case 'pending': return '검토 대기중';
      case 'under_review': return '검토중';
      case 'approved': return '승인됨';
      case 'rejected': return '거절됨';
      case 'processing': return '처리중';
      case 'completed': return '완료됨';
      case 'cancelled': return '취소됨';
      default: return status;
    }
  };

  const getStatusColor = (status: RefundStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetail = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setShowDetailModal(true);
  };

  const handleCreateRefund = () => {
    navigate('/customer/refunds/create');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">환불 관리</h1>
              <p className="mt-2 text-gray-600">환불 요청 현황을 확인하고 관리하세요</p>
            </div>
            <button
              onClick={handleCreateRefund}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              환불 요청하기
            </button>
          </div>
        </div>

        {/* 환불 요청 목록 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {refunds.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">환불 요청이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">첫 번째 환불 요청을 만들어보세요.</p>
              <div className="mt-6">
                <button
                  onClick={handleCreateRefund}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  환불 요청하기
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {refunds.map((refund) => (
                <li key={refund.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(refund.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            주문번호: {refund.order_id.slice(0, 8)}...
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>
                            {getStatusText(refund.status)}
                          </span>
                          {refund.is_urgent && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              긴급
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>요청 금액: {refund.requested_refund_amount.toLocaleString()}원</span>
                          <span>요청일: {formatDate(refund.created_at)}</span>
                          <span>상점: {refund.store_id}</span>
                        </div>
                        {refund.reason && (
                          <p className="mt-1 text-sm text-gray-600 truncate">
                            사유: {refund.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetail(refund)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        상세보기
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 상세 모달 */}
      {showDetailModal && selectedRefund && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">환불 요청 상세</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">상태</label>
                    <div className="mt-1 flex items-center space-x-2">
                      {getStatusIcon(selectedRefund.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRefund.status)}`}>
                        {getStatusText(selectedRefund.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">우선순위</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRefund.priority}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">요청 사유</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRefund.reason}</p>
                </div>

                {selectedRefund.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">상세 설명</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRefund.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">요청 금액</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRefund.requested_refund_amount.toLocaleString()}원</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">승인 금액</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedRefund.approved_refund_amount 
                        ? `${selectedRefund.approved_refund_amount.toLocaleString()}원`
                        : '미정'
                      }
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">요청일</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRefund.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">처리일</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedRefund.processed_at 
                        ? formatDate(selectedRefund.processed_at)
                        : '미처리'
                      }
                    </p>
                  </div>
                </div>

                {selectedRefund.admin_notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">관리자 메모</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRefund.admin_notes}</p>
                  </div>
                )}

                {selectedRefund.refund_deadline && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">환불 마감일</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRefund.refund_deadline)}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRefunds;
