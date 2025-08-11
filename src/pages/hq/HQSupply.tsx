import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../stores/common/authStore';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface SupplyRequest {
  id: string;
  request_number: string;
  store_id: string | null;
  requested_by: string | null;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  total_amount: number | null;
  approved_amount: number | null;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  rejection_reason: string | null;
  created_at: string | null;
  store?: {
    name: string;
    address: string;
  };
  items?: SupplyRequestItem[];
}

interface SupplyRequestItem {
  id: string;
  supply_request_id: string;
  product_id: string;
  product_name: string;
  requested_quantity: number;
  approved_quantity: number;
  unit_cost: number;
  total_cost: number;
  reason: string;
  current_stock: number;
  product?: {
    name: string;
    unit: string;
  };
}

const HQSupply: React.FC = () => {
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SupplyRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { user } = useAuthStore();

  // 실시간 구독 설정
  useEffect(() => {
    fetchSupplyRequests();

    // 실시간 구독
    const subscription = supabase
      .channel('supply_requests_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'supply_requests' }, 
        (payload) => {
          console.log('🔄 물류 요청 데이터 변경 감지:', payload);
          fetchSupplyRequests(); // 데이터 새로고침
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'supply_request_items' }, 
        (payload) => {
          console.log('🔄 물류 요청 아이템 데이터 변경 감지:', payload);
          fetchSupplyRequests(); // 데이터 새로고침
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filterStatus]);

  const fetchSupplyRequests = async () => {
    try {
      setLoading(true);
      console.log('🔍 물류 요청 조회 시작...');
      
      let query = supabase
        .from('supply_requests')
        .select(`
          *,
          store:stores(name, address),
          items:supply_request_items(
            *,
            product:products(name, unit)
          )
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ 물류 요청 조회 실패:', error);
        console.error('❌ 오류 상세:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return;
      }

      console.log('📊 조회된 물류 요청 수:', data?.length || 0);
      console.log('📋 물류 요청 데이터:', data);
      
      // 각 요청의 상세 정보 로깅
      if (data && data.length > 0) {
        data.forEach((request, index) => {
          console.log(`📋 요청 ${index + 1}:`, {
            id: request.id,
            request_number: request.request_number,
            status: request.status,
            store_name: request.store?.name,
            items_count: request.items?.length || 0
          });
        });
      }

      // 데이터 타입 변환 및 안전성 검증
      const validatedData = (data || []).map((item: any) => ({
        ...item,
        status: item.status || 'draft',
        priority: item.priority || 'normal',
        total_amount: item.total_amount || 0,
        approved_amount: item.approved_amount || 0,
        created_at: item.created_at || new Date().toISOString(),
        store_id: item.store_id || '',
        requested_by: item.requested_by || '',
        expected_delivery_date: item.expected_delivery_date || '',
        actual_delivery_date: item.actual_delivery_date || '',
        approved_by: item.approved_by || '',
        approved_at: item.approved_at || '',
        notes: item.notes || '',
        rejection_reason: item.rejection_reason || ''
      })) as SupplyRequest[];

      setSupplyRequests(validatedData);
    } catch (error) {
      console.error('❌ 물류 요청 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (request: SupplyRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleApprove = (request: SupplyRequest) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  const handleReject = (request: SupplyRequest) => {
    setSelectedRequest(request);
    setShowRejectionModal(true);
  };

  const handleShip = (request: SupplyRequest) => {
    setSelectedRequest(request);
    setShowShipmentModal(true);
  };

  const approveRequest = async (formData: FormData) => {
    if (!selectedRequest) return;

    try {
      console.log('✅ 물류 요청 승인 시작:', selectedRequest.request_number);
      
      const approvedAmount = parseFloat(formData.get('approved_amount') as string);
      const notes = formData.get('notes') as string;

      // 승인된 수량으로 아이템 업데이트
      const approvedItems = [];
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('approved_quantity_') && value) {
          const itemId = key.replace('approved_quantity_', '');
          const quantity = parseInt(value as string);
          if (quantity > 0) {
            approvedItems.push({ id: itemId, approved_quantity: quantity });
          }
        }
      }

      // 아이템 승인 수량 업데이트
      for (const item of approvedItems) {
        const { error: itemError } = await supabase
          .from('supply_request_items')
          .update({ approved_quantity: item.approved_quantity })
          .eq('id', item.id);

        if (itemError) {
          console.error('❌ 아이템 승인 수량 업데이트 실패:', itemError);
          throw itemError;
        }
      }

      // 물류 요청 상태 업데이트
      const { error: requestError } = await supabase
        .from('supply_requests')
        .update({
          status: 'approved',
          approved_amount: approvedAmount,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          notes: notes || selectedRequest.notes
        })
        .eq('id', selectedRequest.id);

      if (requestError) {
        console.error('❌ 물류 요청 승인 실패:', requestError);
        throw requestError;
      }

      console.log('✅ 물류 요청 승인 완료');
      setShowApprovalModal(false);
      fetchSupplyRequests();
    } catch (error) {
      console.error('❌ 물류 요청 승인 중 오류:', error);
      alert('물류 요청 승인 중 오류가 발생했습니다.');
    }
  };

  const rejectRequest = async (formData: FormData) => {
    if (!selectedRequest) return;

    try {
      console.log('❌ 물류 요청 거절 시작:', selectedRequest.request_number);
      
      const rejectionReason = formData.get('rejection_reason') as string;

      const { error } = await supabase
        .from('supply_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (error) {
        console.error('❌ 물류 요청 거절 실패:', error);
        throw error;
      }

      console.log('✅ 물류 요청 거절 완료');
      setShowRejectionModal(false);
      fetchSupplyRequests();
    } catch (error) {
      console.error('❌ 물류 요청 거절 중 오류:', error);
      alert('물류 요청 거절 중 오류가 발생했습니다.');
    }
  };

  const createShipment = async (formData: FormData) => {
    if (!selectedRequest) return;

    try {
      console.log('🚚 배송 시작:', selectedRequest.request_number);
      
      const { error } = await supabase
        .from('supply_requests')
        .update({
          status: 'shipped',
          notes: formData.get('shipment_notes') as string || selectedRequest.notes
        })
        .eq('id', selectedRequest.id);

      if (error) {
        console.error('❌ 배송 상태 업데이트 실패:', error);
        throw error;
      }

      console.log('✅ 배송 시작 완료');
      setShowShipmentModal(false);
      fetchSupplyRequests();
    } catch (error) {
      console.error('❌ 배송 시작 중 오류:', error);
      alert('배송 시작 중 오류가 발생했습니다.');
    }
  };

  const completeDelivery = async (request: SupplyRequest) => {
    try {
      console.log('📦 배송 완료 처리 시작:', request.request_number);
      console.log('📋 요청 상세 정보:', {
        id: request.id,
        store_id: request.store_id,
        items_count: request.items?.length || 0
      });
      
      // 물류 요청 상태를 'delivered'로 업데이트
      // 데이터베이스 트리거가 자동으로 재고를 업데이트합니다
      const { error: requestError } = await supabase
        .from('supply_requests')
        .update({
          status: 'delivered',
          actual_delivery_date: new Date().toISOString()
        })
        .eq('id', request.id);

      if (requestError) {
        console.error('❌ 물류 요청 배송 완료 업데이트 실패:', requestError);
        throw requestError;
      }

      console.log('✅ 배송 완료 처리 완료 - 재고가 자동으로 업데이트되었습니다');
      alert('배송 완료 처리되었습니다. 지점 재고가 자동으로 업데이트되었습니다.');
      fetchSupplyRequests();
    } catch (error) {
      console.error('❌ 배송 완료 처리 중 오류:', error);
      alert('배송 완료 처리 중 오류가 발생했습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '임시저장';
      case 'submitted': return '요청됨';
      case 'approved': return '승인됨';
      case 'rejected': return '거절됨';
      case 'shipped': return '배송중';
      case 'delivered': return '배송완료';
      case 'cancelled': return '취소됨';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return '낮음';
      case 'normal': return '보통';
      case 'high': return '높음';
      case 'urgent': return '긴급';
      default: return priority;
    }
  };

  // 엑셀 다운로드 함수 - 본사용 물류 요청 관리 형식
  const downloadExcel = async (request: SupplyRequest) => {
    try {
      // 워크북 생성
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('물류요청관리');
      
      // 지점 정보 조회
      if (!request.store_id) {
        alert('지점 정보가 없습니다.');
        return;
      }
      
      const { data: storeData } = await supabase
        .from('stores')
        .select('name, address, phone')
        .eq('id', request.store_id)
        .single();

      const storeName = storeData?.name || '알 수 없는 지점';
      const storeAddress = storeData?.address || '주소 없음';
      const storePhone = storeData?.phone || '연락처 없음';

      // ====== 헤더 정보 ======
      
      // 제목
      worksheet.mergeCells('B2:H2');
      worksheet.getCell('B2').value = '본사 물류 요청 관리';
      worksheet.getCell('B2').font = { name: '맑은 고딕', size: 16, bold: true };
      worksheet.getCell('B2').alignment = { vertical: 'middle', horizontal: 'center' };

      // 기본 정보
      worksheet.getCell('B4').value = '요청번호';
      worksheet.getCell('C4').value = request.request_number;
      worksheet.getCell('E4').value = '요청일자';
      worksheet.getCell('F4').value = request.created_at ? new Date(request.created_at).toLocaleDateString() : '-';

      worksheet.getCell('B5').value = '지점명';
      worksheet.getCell('C5').value = storeName;
      worksheet.getCell('E5').value = '지점연락처';
      worksheet.getCell('F5').value = storePhone;

      worksheet.getCell('B6').value = '지점주소';
      worksheet.getCell('C6').value = storeAddress;
      worksheet.getCell('E6').value = '희망배송일';
      worksheet.getCell('F6').value = request.expected_delivery_date ? new Date(request.expected_delivery_date).toLocaleDateString() : '-';

      worksheet.getCell('B7').value = '상태';
      worksheet.getCell('C7').value = getStatusText(request.status);
      worksheet.getCell('E7').value = '우선순위';
      worksheet.getCell('F7').value = getPriorityText(request.priority);

      worksheet.getCell('B8').value = '총 요청금액';
      worksheet.getCell('C8').value = request.total_amount || 0;
      worksheet.getCell('E8').value = '승인금액';
      worksheet.getCell('F8').value = request.approved_amount || 0;

      // 셀 병합
      worksheet.mergeCells('C4:D4');
      worksheet.mergeCells('F4:G4');
      worksheet.mergeCells('C5:D5');
      worksheet.mergeCells('F5:G5');
      worksheet.mergeCells('C6:D6');
      worksheet.mergeCells('F6:G6');
      worksheet.mergeCells('C7:D7');
      worksheet.mergeCells('F7:G7');
      worksheet.mergeCells('C8:D8');
      worksheet.mergeCells('F8:G8');

      // ====== 상품 목록 ======
      
      // 상품 목록 헤더
      worksheet.getCell('B10').value = '순번';
      worksheet.getCell('C10').value = '상품명';
      worksheet.getCell('D10').value = '단위';
      worksheet.getCell('E10').value = '요청수량';
      worksheet.getCell('F10').value = '승인수량';
      worksheet.getCell('G10').value = '단가';
      worksheet.getCell('H10').value = '총액';
      worksheet.getCell('I10').value = '현재재고';
      worksheet.getCell('J10').value = '요청사유';

      // 헤더 스타일
      for (let col = 2; col <= 10; col++) {
        const cell = worksheet.getCell(10, col);
        cell.font = { name: '맑은 고딕', size: 10, bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8FF' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      // 상품 데이터 입력
      if (request.items && request.items.length > 0) {
        request.items.forEach((item, index) => {
          const row = 11 + index;
          
          worksheet.getCell(row, 2).value = index + 1;
          worksheet.getCell(row, 3).value = item.product_name;
          worksheet.getCell(row, 4).value = item.product?.unit || '-';
          worksheet.getCell(row, 5).value = item.requested_quantity;
          worksheet.getCell(row, 6).value = item.approved_quantity || 0;
          worksheet.getCell(row, 7).value = item.unit_cost || 0;
          worksheet.getCell(row, 8).value = item.total_cost || 0;
          worksheet.getCell(row, 9).value = item.current_stock;
          worksheet.getCell(row, 10).value = item.reason;

          // 데이터 행 스타일
          for (let col = 2; col <= 10; col++) {
            const cell = worksheet.getCell(row, col);
            cell.font = { name: '맑은 고딕', size: 9 };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        });
      }

      // ====== 요약 정보 ======
      
      const summaryRow = 12 + (request.items?.length || 0);
      
      worksheet.getCell(`B${summaryRow}`).value = '합계';
      worksheet.getCell(`B${summaryRow}`).font = { name: '맑은 고딕', size: 10, bold: true };
      worksheet.getCell(`B${summaryRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } };
      
      worksheet.getCell(`E${summaryRow}`).value = request.items?.reduce((sum, item) => sum + item.requested_quantity, 0) || 0;
      worksheet.getCell(`F${summaryRow}`).value = request.items?.reduce((sum, item) => sum + (item.approved_quantity || 0), 0) || 0;
      worksheet.getCell(`H${summaryRow}`).value = request.total_amount || 0;

      // 합계 행 스타일
      for (let col = 2; col <= 10; col++) {
        const cell = worksheet.getCell(summaryRow, col);
        cell.font = { name: '맑은 고딕', size: 10, bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      // ====== 메모 및 승인 정보 ======
      
      const memoRow = summaryRow + 2;
      
      worksheet.getCell(`B${memoRow}`).value = '요청사유';
      worksheet.getCell(`C${memoRow}`).value = request.notes || '없음';
      worksheet.mergeCells(`C${memoRow}:G${memoRow}`);

      worksheet.getCell(`B${memoRow + 1}`).value = '거절사유';
      worksheet.getCell(`C${memoRow + 1}`).value = request.rejection_reason || '해당없음';
      worksheet.mergeCells(`C${memoRow + 1}:G${memoRow + 1}`);

      worksheet.getCell(`B${memoRow + 2}`).value = '승인자';
      worksheet.getCell(`C${memoRow + 2}`).value = request.approved_by || '미승인';
      worksheet.getCell(`E${memoRow + 2}`).value = '승인일시';
      worksheet.getCell(`F${memoRow + 2}`).value = request.approved_at ? new Date(request.approved_at).toLocaleString() : '미승인';

      // ====== 스타일 적용 ======
      
      // 기본 정보 스타일
      for (let row = 4; row <= 8; row++) {
        for (let col = 2; col <= 7; col++) {
          const cell = worksheet.getCell(row, col);
          if (col === 2 || col === 5) {
            cell.font = { name: '맑은 고딕', size: 10, bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
          } else {
            cell.font = { name: '맑은 고딕', size: 10 };
          }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          cell.alignment = { vertical: 'middle', horizontal: col === 2 || col === 5 ? 'center' : 'left' };
        }
      }

      // 메모 및 승인 정보 스타일
      for (let row = memoRow; row <= memoRow + 2; row++) {
        for (let col = 2; col <= 7; col++) {
          const cell = worksheet.getCell(row, col);
          if (col === 2 || col === 5) {
            cell.font = { name: '맑은 고딕', size: 10, bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
          } else {
            cell.font = { name: '맑은 고딕', size: 10 };
          }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          cell.alignment = { vertical: 'middle', horizontal: col === 2 || col === 5 ? 'center' : 'left' };
        }
      }

      // 열 너비 설정
      worksheet.getColumn(1).width = 2;
      worksheet.getColumn(2).width = 12;
      worksheet.getColumn(3).width = 25;
      worksheet.getColumn(4).width = 8;
      worksheet.getColumn(5).width = 10;
      worksheet.getColumn(6).width = 10;
      worksheet.getColumn(7).width = 12;
      worksheet.getColumn(8).width = 12;
      worksheet.getColumn(9).width = 10;
      worksheet.getColumn(10).width = 20;

      // ====== 파일 저장 ======
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `본사_물류요청관리_${request.request_number}_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
    } catch (error) {
      console.error('❌ 엑셀 다운로드 중 오류:', error);
      alert('엑셀 파일 생성 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">물류 관리</h1>
        <p className="text-gray-600">지점에서 요청한 물류를 관리하고 처리합니다.</p>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex gap-4">
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[140px]"
          >
            <option value="all">전체 상태</option>
            <option value="submitted">요청됨</option>
            <option value="approved">승인됨</option>
            <option value="shipped">배송중</option>
            <option value="delivered">배송완료</option>
            <option value="rejected">거절됨</option>
          </select>
          {/* 드롭다운 화살표 아이콘 */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* 물류 요청 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  요청번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  지점
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  우선순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  요청일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supplyRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    처리할 물류 요청이 없습니다.
                  </td>
                </tr>
              ) : (
                supplyRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.request_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.store?.name || '알 수 없는 지점'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                        {getPriorityText(request.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.total_amount?.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.created_at ? new Date(request.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          상세보기
                        </button>
                        
                        <button
                          onClick={() => downloadExcel(request)}
                          className="text-green-600 hover:text-green-900"
                          title="엑셀로 다운로드"
                        >
                          📊 엑셀
                        </button>
                        
                        {request.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleApprove(request)}
                              className="text-green-600 hover:text-green-900"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => handleReject(request)}
                              className="text-red-600 hover:text-red-900"
                            >
                              거절
                            </button>
                          </>
                        )}
                        
                        {request.status === 'approved' && (
                          <button
                            onClick={() => handleShip(request)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            배송시작
                          </button>
                        )}
                        
                        {request.status === 'shipped' && (
                          <button
                            onClick={() => completeDelivery(request)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            배송완료
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세보기 모달 */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">물류 요청 상세</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadExcel(selectedRequest)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center space-x-2"
                >
                  <span>📊</span>
                  <span>엑셀로 다운로드</span>
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">요청번호</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.request_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">지점</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.store?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">상태</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                  {getStatusText(selectedRequest.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">우선순위</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                  {getPriorityText(selectedRequest.priority)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">총액</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.total_amount?.toLocaleString()}원</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">요청일</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>

            {selectedRequest.notes && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">요청 사유</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.notes}</p>
              </div>
            )}

            {selectedRequest.items && selectedRequest.items.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">요청 상품</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">상품명</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">요청수량</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">승인수량</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">단가</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">총액</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">사유</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedRequest.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.product_name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.requested_quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.approved_quantity || 0}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.unit_cost?.toLocaleString()}원</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.total_cost?.toLocaleString()}원</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 승인 모달 */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">물류 요청 승인</h2>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); approveRequest(new FormData(e.currentTarget)); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">승인 수량</label>
                {selectedRequest.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 mb-2">
                    <span className="text-sm text-gray-900 flex-1">{item.product_name}</span>
                    <span className="text-sm text-gray-500">요청: {item.requested_quantity}</span>
                    <input
                      type="number"
                      name={`approved_quantity_${item.id}`}
                      min="0"
                      max={item.requested_quantity}
                      defaultValue={item.approved_quantity || 0}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                ))}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">승인 총액</label>
                <input
                  type="number"
                  name="approved_amount"
                  defaultValue={selectedRequest.total_amount || 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="승인 관련 메모를 입력하세요"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  승인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 거절 모달 */}
      {showRejectionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">물류 요청 거절</h2>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); rejectRequest(new FormData(e.currentTarget)); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">거절 사유</label>
                <textarea
                  name="rejection_reason"
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="거절 사유를 입력하세요"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectionModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  거절
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 배송 시작 모달 */}
      {showShipmentModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">배송 시작</h2>
              <button
                onClick={() => setShowShipmentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); createShipment(new FormData(e.currentTarget)); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">배송 메모</label>
                <textarea
                  name="shipment_notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="배송 관련 메모를 입력하세요"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowShipmentModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  배송 시작
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HQSupply; 