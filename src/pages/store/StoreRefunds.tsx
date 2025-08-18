import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/common/authStore';
import { supabase } from '../../lib/supabase/client';
import { RefundRequest, RefundStatus, RefundPriority } from '../../types/common';
import ReceiptModal from '../../components/store/ReceiptModal';

const StoreRefunds: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<RefundStatus[]>([]);
  const [filterPriority, setFilterPriority] = useState<RefundPriority[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingRefund, setProcessingRefund] = useState<string | null>(null);
  
  // 구매 영수증 모달 상태
  const [showOrderReceiptModal, setShowOrderReceiptModal] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<any>(null);
  const [storeInfo, setStoreInfo] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      fetchRefunds();
    }
  }, [user, filterStatus, filterPriority]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      
      // 점주의 store_id 가져오기
      if (!user?.id) {
        console.error('사용자 정보가 없습니다.');
        return;
      }

      // 점주의 store 정보 조회
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id, name, address, phone')
        .eq('owner_id', user.id)
        .single();

      if (storeError || !storeData) {
        console.error('점주의 store 정보 조회 실패:', storeError);
        setLoading(false);
        return;
      }

      const storeId = storeData.id;
      setStoreInfo(storeData);
      console.log('점주 store_id:', storeId);

      // 간단한 쿼리로 테스트
      let query = supabase
        .from('refund_requests')
        .select('*')
        .eq('store_id', storeId);

      // 상태 필터 적용
      if (filterStatus.length > 0) {
        query = query.in('status', filterStatus);
      }

      // 우선순위 필터 적용
      if (filterPriority.length > 0) {
        query = query.in('priority', filterPriority);
      }

      // 검색어 필터 적용
      if (searchTerm) {
        query = query.or(`reason.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setRefunds(data || []);
    } catch (error) {
      console.error('환불 요청 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: RefundStatus) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'under_review':
        return <ExclamationCircleIcon className="h-5 w-5 text-blue-500" />;
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
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: RefundPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
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

  const handleProcessRefund = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setShowProcessModal(true);
  };

  // 구매 영수증 보기 함수
  const handleViewOrderReceipt = async (refund: RefundRequest) => {
    try {
      // 환불 요청의 원주문 정보 조회
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', refund.order_id)
        .single();

      if (orderError) {
        console.error('주문 정보 조회 실패:', orderError);
        alert('주문 정보를 불러올 수 없습니다.');
        return;
      }

      setSelectedOrderForReceipt(orderData);
      setShowOrderReceiptModal(true);
    } catch (error) {
      console.error('구매 영수증 조회 실패:', error);
      alert('구매 영수증을 불러올 수 없습니다.');
    }
  };

  const handleStatusUpdate = async (newStatus: RefundStatus, notes?: string) => {
    if (!selectedRefund || !user?.id) return;

    try {
      const { error } = await supabase
        .from('refund_requests')
        .update({
          status: newStatus,
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          admin_notes: notes
        })
        .eq('id', selectedRefund.id);

      if (error) throw error;

      // 환불 이력 추가 (타입 에러 방지를 위해 any 사용)
      await supabase
        .from('refund_history' as any)
        .insert([{
          refund_request_id: selectedRefund.id,
          status: newStatus,
          notes: notes || '',
          processed_by: user.id,
          action_type: 'status_change',
          metadata: { previous_status: selectedRefund.status }
        }]);

      setShowProcessModal(false);
      setShowDetailModal(false);
      fetchRefunds();
    } catch (error) {
      console.error('환불 상태 업데이트 실패:', error);
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  // 환불 요청 처리 (승인/거절)
  const processRefund = async (refundId: string, action: 'approve' | 'reject', notes?: string) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('process_refund_request', {
        p_refund_request_id: refundId,
        p_new_status: action === 'approve' ? 'approved' : 'rejected',
        p_processed_by: user.id,
        p_notes: notes || '',
        p_rejection_reason: action === 'reject' ? notes : null
      });

      if (error) throw error;
      
      // 함수가 JSONB를 반환하므로 결과 확인
      if (data?.success) {
        alert(data.message || `환불 요청이 ${action === 'approve' ? '승인' : '거절'}되었습니다.`);
        if (data.inventory_restored) {
          console.log('✅ 재고가 성공적으로 복구되었습니다.');
        }
      } else {
        alert('환불 요청 처리에 실패했습니다.');
      }
      
      fetchRefunds(); // 목록 새로고침
      setProcessingRefund(null);
    } catch (error) {
      console.error('환불 요청 처리 실패:', error);
      alert('환불 요청 처리에 실패했습니다.');
    }
  };

  const filteredRefunds = refunds.filter(refund => {
    if (filterStatus.length > 0 && !filterStatus.includes(refund.status)) return false;
    if (filterPriority.length > 0 && !filterPriority.includes(refund.priority)) return false;
    if (searchTerm && !refund.reason.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !(refund.description && refund.description.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
    return true;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">환불 관리</h1>
          <p className="mt-2 text-gray-600">고객의 환불 요청을 검토하고 처리하세요</p>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <select
                multiple
                value={filterStatus}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value as RefundStatus);
                  setFilterStatus(selected);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">검토 대기중</option>
                <option value="under_review">검토중</option>
                <option value="approved">승인됨</option>
                <option value="rejected">거절됨</option>
                <option value="processing">처리중</option>
                <option value="completed">완료됨</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
              <select
                multiple
                value={filterPriority}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value as RefundPriority);
                  setFilterPriority(selected);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="urgent">긴급</option>
                <option value="high">높음</option>
                <option value="normal">보통</option>
                <option value="low">낮음</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <input
                type="text"
                placeholder="사유 또는 설명으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus([]);
                  setFilterPriority([]);
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>

        {/* 환불 요청 목록 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredRefunds.length === 0 ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">환불 요청이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">필터 조건을 조정해보세요.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredRefunds.map((refund) => (
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(refund.priority)}`}>
                            {refund.priority}
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
                          <span>고객: {refund.customer_id}</span>
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
                      {refund.status === 'pending' && (
                        <button
                          onClick={() => handleProcessRefund(refund)}
                          className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                          처리하기
                        </button>
                      )}
                      {/* 모든 환불 요청에 구매 영수증 보기 버튼 추가 */}
                      <button
                        onClick={() => handleViewOrderReceipt(refund)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        구매 영수증
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedRefund.priority)}`}>
                      {selectedRefund.priority}
                    </span>
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
                {selectedRefund.status === 'pending' && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleProcessRefund(selectedRefund);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    처리하기
                  </button>
                )}
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

      {/* 처리 모달 */}
      {showProcessModal && selectedRefund && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">환불 요청 처리</h3>
                <button
                  onClick={() => setShowProcessModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">처리 결과</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleStatusUpdate('approved', '환불 요청이 승인되었습니다.')}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <CheckIcon className="h-4 w-4 mr-1 inline" />
                      승인
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('rejected', '환불 요청이 거절되었습니다.')}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1 inline" />
                      거절
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('under_review', '환불 요청을 검토 중입니다.')}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ClockIcon className="h-4 w-4 mr-1 inline" />
                      검토중
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">메모 (선택사항)</label>
                  <textarea
                    rows={3}
                    placeholder="처리 결과에 대한 메모를 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    id="process-notes"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowProcessModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 구매 영수증 모달 */}
      <ReceiptModal
        isOpen={showOrderReceiptModal}
        onClose={() => setShowOrderReceiptModal(false)}
        order={selectedOrderForReceipt}
        storeName={storeInfo?.name}
        storeAddress={storeInfo?.address}
        storePhone={storeInfo?.phone}
      />
    </div>
  );
};

export default StoreRefunds;
