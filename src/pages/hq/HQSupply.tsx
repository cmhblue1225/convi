import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../stores/common/authStore';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import SignaturePad from '../../components/common/SignaturePad';
import { addSignatureToExcel, addApproverInfoToExcel } from '../../utils/excelSignature';

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
  const [approverSignature, setApproverSignature] = useState<string>('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
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

  // 서명 처리 함수들
  const handleSignatureSave = (signature: string) => {
    setApproverSignature(signature);
    setShowSignatureModal(false);
  };

  const handleSignatureClear = () => {
    setApproverSignature('');
  };

  const openSignatureModal = () => {
    setShowSignatureModal(true);
  };

  // 엑셀 다운로드 함수 - StoreSupply.tsx와 완전히 동일한 형식
  const downloadExcel = async (request: SupplyRequest) => {
    try {
      console.log('📊 엑셀 다운로드 시작:', request.request_number);
      
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

      if (!storeData) {
        alert('지점 정보를 찾을 수 없습니다.');
        return;
      }

      // 워크북 생성
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('본사물류요청서');

      // 제목 행 - 깔끔하고 전문적인 디자인
      worksheet.getCell('A1').value = '본사 물류 요청서';
      worksheet.getCell('A1').font = { name: '맑은 고딕', size: 20, bold: true, color: { argb: 'FF1F4E79' } };
      worksheet.mergeCells('A1:F1');
      worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8FF' } };
      worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      
      // 제목 행 테두리 추가
      worksheet.getCell('A1').border = {
        top: { style: 'thick', color: { argb: 'FF1F4E79' } },
        left: { style: 'thick', color: { argb: 'FF1F4E79' } },
        bottom: { style: 'thick', color: { argb: 'FF1F4E79' } },
        right: { style: 'thick', color: { argb: 'FF1F4E79' } }
      };

      // 기본 정보 섹션
      const basicInfoStartRow = 3;
      worksheet.getCell(`A${basicInfoStartRow}`).value = '요청번호';
      worksheet.getCell(`B${basicInfoStartRow}`).value = request.request_number;
      worksheet.getCell(`A${basicInfoStartRow + 1}`).value = '요청일시';
      worksheet.getCell(`B${basicInfoStartRow + 1}`).value = request.created_at ? new Date(request.created_at).toLocaleDateString('ko-KR') : '-';
      worksheet.getCell(`A${basicInfoStartRow + 2}`).value = '상태';
      worksheet.getCell(`B${basicInfoStartRow + 2}`).value = getStatusText(request.status);
      worksheet.getCell(`A${basicInfoStartRow + 3}`).value = '우선순위';
      worksheet.getCell(`B${basicInfoStartRow + 3}`).value = getPriorityText(request.priority);
      worksheet.getCell(`A${basicInfoStartRow + 4}`).value = '예상배송일';
      worksheet.getCell(`B${basicInfoStartRow + 4}`).value = request.expected_delivery_date ? new Date(request.expected_delivery_date).toLocaleDateString('ko-KR') : '-';

      // 지점 정보
      worksheet.getCell(`D${basicInfoStartRow}`).value = '지점명';
      worksheet.getCell(`E${basicInfoStartRow}`).value = storeData.name;
      worksheet.getCell(`D${basicInfoStartRow + 1}`).value = '주소';
      worksheet.getCell(`E${basicInfoStartRow + 1}`).value = storeData.address || '-';
      worksheet.getCell(`D${basicInfoStartRow + 2}`).value = '연락처';
      worksheet.getCell(`E${basicInfoStartRow + 2}`).value = storeData.phone || '-';

      // 총액 정보 - E6, E7에 위치
      worksheet.getCell(`D${basicInfoStartRow + 3}`).value = '총 요청금액';
      worksheet.getCell(`E${basicInfoStartRow + 3}`).value = request.total_amount || 0;
      worksheet.getCell(`D${basicInfoStartRow + 4}`).value = '승인금액';
      worksheet.getCell(`E${basicInfoStartRow + 4}`).value = request.approved_amount || 0;



      // 기본 정보 스타일 적용 - 깔끔하고 전문적인 디자인
      for (let row = basicInfoStartRow; row <= basicInfoStartRow + 4; row++) {
        for (let col = 1; col <= 6; col++) {
          const cell = worksheet.getCell(row, col);
          if (col === 1 || col === 4) {
            cell.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FF1F4E79' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else {
            cell.font = { name: '맑은 고딕', size: 10, color: { argb: 'FF2F2F2F' } };
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF1F4E79' } },
            left: { style: 'thin', color: { argb: 'FF1F4E79' } },
            bottom: { style: 'thin', color: { argb: 'FF1F4E79' } },
            right: { style: 'thin', color: { argb: 'FF1F4E79' } }
          };
        }
      }

      // 셀 병합
      worksheet.mergeCells(`B${basicInfoStartRow}:C${basicInfoStartRow}`);
      worksheet.mergeCells(`B${basicInfoStartRow + 1}:C${basicInfoStartRow + 1}`);
      worksheet.mergeCells(`B${basicInfoStartRow + 2}:C${basicInfoStartRow + 2}`);
      worksheet.mergeCells(`B${basicInfoStartRow + 3}:C${basicInfoStartRow + 3}`);
      worksheet.mergeCells(`B${basicInfoStartRow + 4}:C${basicInfoStartRow + 4}`);
      worksheet.mergeCells(`E${basicInfoStartRow}:F${basicInfoStartRow}`);
      worksheet.mergeCells(`E${basicInfoStartRow + 1}:F${basicInfoStartRow + 1}`);
      worksheet.mergeCells(`E${basicInfoStartRow + 2}:F${basicInfoStartRow + 2}`);

      // 기본 정보 섹션 외곽 테두리 추가 (깔끔한 디자인)
      // 왼쪽 외곽 테두리 (A열)
      for (let row = basicInfoStartRow; row <= basicInfoStartRow + 4; row++) {
        const cell = worksheet.getCell(row, 1);
        cell.border = {
          ...cell.border,
          left: { style: 'thick', color: { argb: 'FF1F4E79' } }
        };
      }
      
      // 오른쪽 외곽 테두리 (F열)
      for (let row = basicInfoStartRow; row <= basicInfoStartRow + 4; row++) {
        const cell = worksheet.getCell(row, 6);
        cell.border = {
          ...cell.border,
          right: { style: 'thick', color: { argb: 'FF1F4E79' } }
        };
      }
      
      // 상단 외곽 테두리 (첫 번째 행)
      for (let col = 1; col <= 6; col++) {
        const cell = worksheet.getCell(basicInfoStartRow, col);
        cell.border = {
          ...cell.border,
          top: { style: 'thick', color: { argb: 'FF1F4E79' } }
        };
      }
      
      // 하단 외곽 테두리 (마지막 행)
      for (let col = 1; col <= 6; col++) {
        const cell = worksheet.getCell(basicInfoStartRow + 4, col);
        cell.border = {
          ...cell.border,
          bottom: { style: 'thick', color: { argb: 'FF1F4E79' } }
        };
      }

      // 요청 상품 테이블 헤더
      const itemsStartRow = basicInfoStartRow + 6;
      worksheet.getCell(`A${itemsStartRow}`).value = '상품명';
      worksheet.getCell(`B${itemsStartRow}`).value = '요청수량';
      worksheet.getCell(`C${itemsStartRow}`).value = '단위';
      worksheet.getCell(`D${itemsStartRow}`).value = '승인수량';
      worksheet.getCell(`E${itemsStartRow}`).value = '현재재고';
      worksheet.getCell(`F${itemsStartRow}`).value = '요청사유';

      // 요청 상품 테이블 헤더 스타일 - 강한 테두리로 깔끔하게
      for (let col = 1; col <= 6; col++) {
        const cell = worksheet.getCell(itemsStartRow, col);
        cell.font = { name: '맑은 고딕', size: 11, bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF0066CC' } },
          left: { style: 'medium', color: { argb: 'FF0066CC' } },
          bottom: { style: 'medium', color: { argb: 'FF0066CC' } },
          right: { style: 'medium', color: { argb: 'FF0066CC' } }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      // 요청 상품 데이터 추가
      if (request.items && request.items.length > 0) {
        request.items.forEach((item, index) => {
          const row = itemsStartRow + 1 + index;
          
          worksheet.getCell(row, 1).value = item.product_name;
          worksheet.getCell(row, 2).value = item.requested_quantity;
          worksheet.getCell(row, 2).numFmt = '#,##0'; // 요청수량 숫자 형식
          worksheet.getCell(row, 3).value = '개'; // 기본 단위
          worksheet.getCell(row, 4).value = item.approved_quantity || '-';
          worksheet.getCell(row, 5).value = item.current_stock || 0;
          worksheet.getCell(row, 5).numFmt = '#,##0'; // 현재재고 숫자 형식
          worksheet.getCell(row, 6).value = item.reason || '-';

          // 상품명과 요청사유 셀에 줄바꿈 및 자동 맞춤 설정
          const productNameCell = worksheet.getCell(row, 1);
          const reasonCell = worksheet.getCell(row, 6);
          
          productNameCell.alignment = { 
            vertical: 'middle', 
            horizontal: 'left',
            wrapText: true // 텍스트 줄바꿈 활성화
          };
          
          reasonCell.alignment = { 
            vertical: 'middle', 
            horizontal: 'left',
            wrapText: true // 텍스트 줄바꿈 활성화
          };

          // 데이터 행 스타일 - 강한 테두리로 깔끔하게
          for (let col = 1; col <= 6; col++) {
            const cell = worksheet.getCell(row, col);
            cell.font = { name: '맑은 고딕', size: 10 };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF0066CC' } },
              left: { style: 'thin', color: { argb: 'FF0066CC' } },
              bottom: { style: 'thin', color: { argb: 'FF0066CC' } },
              right: { style: 'thin', color: { argb: 'FF0066CC' } }
            };
            
            // 숫자 데이터와 단위, 요청사유는 중앙 정렬, 상품명은 좌측 정렬
            if (col === 2 || col === 3 || col === 4 || col === 5 || col === 6) {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }
          }
        });
        
        // 상품 목록 테이블 외곽 테두리 추가 (깔끔한 디자인)
        const lastItemRow = itemsStartRow + request.items.length;
        
        // 왼쪽 외곽 테두리 (A열)
        for (let row = itemsStartRow; row <= lastItemRow; row++) {
          const cell = worksheet.getCell(row, 1);
          cell.border = {
            ...cell.border,
            left: { style: 'thick', color: { argb: 'FF0066CC' } }
          };
        }
        
        // 오른쪽 외곽 테두리 (F열)
        for (let row = itemsStartRow; row <= lastItemRow; row++) {
          const cell = worksheet.getCell(row, 6);
          cell.border = {
            ...cell.border,
            right: { style: 'thick', color: { argb: 'FF0066CC' } }
          };
        }
        
        // 상단 외곽 테두리 (헤더 행)
        for (let col = 1; col <= 6; col++) {
          const cell = worksheet.getCell(itemsStartRow, col);
          cell.border = {
            ...cell.border,
            top: { style: 'thick', color: { argb: 'FF0066CC' } }
          };
        }
        
        // 하단 외곽 테두리 (마지막 데이터 행)
        for (let col = 1; col <= 6; col++) {
          const cell = worksheet.getCell(lastItemRow, col);
          cell.border = {
            ...cell.border,
            bottom: { style: 'thick', color: { argb: 'FF0066CC' } }
          };
        }
      }

      // 요약 정보 - 총액 정보는 기본 정보 섹션에 이미 포함됨
      const summaryStartRow = itemsStartRow + (request.items?.length || 0) + 2;
      worksheet.getCell(`A${summaryStartRow}`).value = '총 요청수량';
      worksheet.getCell(`B${summaryStartRow}`).value = request.items?.reduce((sum, item) => sum + (item.requested_quantity || 0), 0) || 0;
      worksheet.getCell(`B${summaryStartRow}`).numFmt = '#,##0';
      worksheet.getCell(`A${summaryStartRow + 1}`).value = '총 승인수량';
      worksheet.getCell(`B${summaryStartRow + 1}`).value = request.items?.reduce((sum, item) => sum + (item.approved_quantity || 0), 0) || 0;
      worksheet.getCell(`B${summaryStartRow + 1}`).numFmt = '#,##0';

      // 요약 정보 스타일 - 강한 테두리로 깔끔하게
      for (let row = summaryStartRow; row <= summaryStartRow + 1; row++) {
        for (let col = 1; col <= 2; col++) {
          const cell = worksheet.getCell(row, col);
          if (col === 1) {
            cell.font = { name: '맑은 고딕', size: 11, bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2F2' } };
          } else {
            cell.font = { name: '맑은 고딕', size: 11, bold: true };
          }
          cell.border = {
            top: { style: 'medium', color: { argb: 'FFCC6666' } },
            left: { style: 'medium', color: { argb: 'FFCC6666' } },
            bottom: { style: 'medium', color: { argb: 'FFCC6666' } },
            right: { style: 'medium', color: { argb: 'FFCC6666' } }
          };
          cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'center' : 'right' };
        }
      }

      // 셀 병합
      worksheet.mergeCells(`B${summaryStartRow}:F${summaryStartRow}`);
      worksheet.mergeCells(`B${summaryStartRow + 1}:F${summaryStartRow + 1}`);

      // 비고 및 거절사유
      const memoStartRow = summaryStartRow + 3;
      if (request.notes) {
        worksheet.getCell(`A${memoStartRow}`).value = '비고';
        worksheet.getCell(`B${memoStartRow}`).value = request.notes;
        worksheet.mergeCells(`B${memoStartRow}:F${memoStartRow}`);
        
        // 비고 스타일
        worksheet.getCell(`A${memoStartRow}`).font = { name: '맑은 고딕', size: 10, bold: true };
        worksheet.getCell(`A${memoStartRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
        worksheet.getCell(`B${memoStartRow}`).font = { name: '맑은 고딕', size: 10 };
        
        for (let col = 1; col <= 6; col++) {
          const cell = worksheet.getCell(memoStartRow, col);
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
          };
          cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'center' : 'left' };
        }
      }

      if (request.rejection_reason) {
        const rejectionRow = memoStartRow + (request.notes ? 1 : 0);
        worksheet.getCell(`A${rejectionRow}`).value = '거절사유';
        worksheet.getCell(`B${rejectionRow}`).value = request.rejection_reason;
        worksheet.mergeCells(`B${rejectionRow}:F${rejectionRow}`);
        
        // 거절사유 스타일
        worksheet.getCell(`A${rejectionRow}`).font = { name: '맑은 고딕', size: 10, bold: true };
        worksheet.getCell(`A${rejectionRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } };
        worksheet.getCell(`B${rejectionRow}`).font = { name: '맑은 고딕', size: 10 };
        
        for (let col = 1; col <= 6; col++) {
          const cell = worksheet.getCell(rejectionRow, col);
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
          };
          if (col === 6) {
            cell.border.right = { style: 'thin', color: { argb: 'FFCCCCCC' } };
          }
          cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'center' : 'left' };
        }
      }

      // ====== 서명 정보 ======
      const signatureStartRow = request.rejection_reason ? memoStartRow + (request.notes ? 2 : 1) : memoStartRow + (request.notes ? 1 : 0);
      
      // 승인자 정보 - 같은 행에 가로 배치
      worksheet.getCell(`A${signatureStartRow + 1}`).value = '승인자';
      worksheet.getCell(`B${signatureStartRow + 1}`).value = user?.email || '미승인';
      worksheet.getCell(`C${signatureStartRow + 1}`).value = '승인시간';
      worksheet.getCell(`D${signatureStartRow + 1}`).value = new Date().toLocaleString('ko-KR');
      worksheet.getCell(`E${signatureStartRow + 1}`).value = '서명';
      worksheet.getCell(`F${signatureStartRow + 1}`).value = ''; // 서명 영역

      // 승인자 정보 스타일 - 한 행에 맞춤
      for (let col = 1; col <= 6; col++) {
        const cell = worksheet.getCell(signatureStartRow + 1, col);
        if (col === 1 || col === 3 || col === 5) {
          // 라벨 셀 (승인자, 승인시간, 서명)
          cell.font = { name: '맑은 고딕', size: 10, bold: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (col === 2 || col === 4) {
          // 데이터 셀 (이메일, 시간)
          cell.font = { name: '맑은 고딕', size: 10 };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else if (col === 6) {
          // 서명 영역 셀 - 배경색 제거하고 깔끔하게
          cell.font = { name: '맑은 고딕', size: 10 };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          // 서명 영역 테두리를 더 굵게 하여 경계 명확화
          cell.border = {
            top: { style: 'medium', color: { argb: 'FFDAA520' } },     // 위쪽 테두리 굵게
            left: { style: 'medium', color: { argb: 'FFDAA520' } },    // 왼쪽 테두리 굵게
            bottom: { style: 'medium', color: { argb: 'FFDAA520' } },  // 아래쪽 테두리 굵게
            right: { style: 'medium', color: { argb: 'FFDAA520' } }    // 오른쪽 테두리 굵게
          };
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
      }

      // 서명 이미지 추가 (있는 경우) - 인쇄 미리보기 최적화
      if (approverSignature) {
        try {
          const base64Data = approverSignature.split(',')[1];
          if (!base64Data || base64Data.length > 1000000) {
            throw new Error('서명 이미지 데이터가 너무 큽니다');
          }
          const imageId = worksheet.workbook.addImage({
            base64: base64Data,
            extension: 'png',
          });
          worksheet.addImage(imageId, {
            tl: { col: 5.2, row: signatureStartRow + 0.95 }, // F열 시작점 (F열 너비 30에 맞춤)
            br: { col: 6.8, row: signatureStartRow + 1.05 }  // F열 끝점 (F열 너비 30에 맞춤)
          } as any);
          worksheet.getRow(signatureStartRow + 1).height = 100;
          console.log('✅ 서명 이미지 추가 성공');
        } catch (imageError) {
          console.warn('서명 이미지 추가 실패:', imageError);
          worksheet.getCell(`F${signatureStartRow + 1}`).value = '서명 없음';
          worksheet.getCell(`F${signatureStartRow + 1}`).font = { name: '맑은 고딕', size: 12, italic: true, color: { argb: 'FF7F8C8D' } };
          worksheet.getCell(`F${signatureStartRow + 1}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
          worksheet.getCell(`F${signatureStartRow + 1}`).alignment = { vertical: 'middle', horizontal: 'center' };
        }
      } else {
        worksheet.getCell(`F${signatureStartRow + 1}`).value = '서명 없음';
        worksheet.getCell(`F${signatureStartRow + 1}`).font = { name: '맑은 고딕', size: 12, italic: true, color: { argb: 'FF7F8C8D' } };
        worksheet.getCell(`F${signatureStartRow + 1}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
        worksheet.getCell(`F${signatureStartRow + 1}`).alignment = { vertical: 'middle', horizontal: 'center' };
      }

      // 열 너비 조정 - 새로운 레이아웃에 맞춤
      worksheet.getColumn('A').width = 20;  // A열 (승인자 라벨)
      worksheet.getColumn('B').width = 30;  // B열 (승인자 이메일)
      worksheet.getColumn('C').width = 20;  // C열 (승인시간 라벨)
      worksheet.getColumn('D').width = 30;  // D열 (승인시간 데이터)
      worksheet.getColumn('E').width = 20;  // E열 (서명 라벨)
      worksheet.getColumn('F').width = 30;  // F열 (서명 영역)

      // ====== A4 페이지 꽉 채우기 위한 동적 행 높이 계산 ======
      
      // A4 페이지 기준 계산 (297mm × 210mm, 여백 제외)
      const a4Height = 297; // mm
      const a4Width = 210; // mm
      const marginTop = 12.7; // 0.5인치 = 12.7mm
      const marginBottom = 12.7;
      const marginLeft = 7.6; // 0.3인치 = 7.6mm
      const marginRight = 7.6;
      
      // 실제 사용 가능한 높이 (mm)
      const usableHeight = a4Height - marginTop - marginBottom;
      
      // 현재 총 행 수 계산 - 한 행에 맞춤
      const totalRows = basicInfoStartRow + 4 + // 기본정보 5행
                        1 + // 상품목록 헤더 1행
                        (request.items?.length || 0) + // 상품 데이터 행들
                        2 + // 요약 정보 2행
                        (request.notes ? 1 : 0) + // 비고 (있는 경우)
                        (request.rejection_reason ? 1 : 0) + // 거절사유 (있는 경우)
                        1; // 서명 정보 1행 (한 행에 배치)
      
      // A4 페이지에 맞는 최적 행 높이 계산 (mm)
      const optimalRowHeight = usableHeight / totalRows;
      
      // mm를 Excel 행 높이로 변환 (대략 1mm = 2.83 Excel 행 높이)
      const excelRowHeight = Math.max(optimalRowHeight * 2.83, 20); // 최소 20px 보장
      
      console.log(`📏 A4 페이지 최적화: 총 ${totalRows}행, 행당 ${excelRowHeight.toFixed(1)}px`);
      
      // 모든 행에 동적 높이 적용
      for (let row = 1; row <= totalRows; row++) {
        if (row === 1) {
          // 제목 행은 더 크게
          worksheet.getRow(row).height = excelRowHeight * 1.5;
        } else if (row >= basicInfoStartRow && row <= basicInfoStartRow + 4) {
          // 기본정보 행들
          worksheet.getRow(row).height = excelRowHeight;
        } else if (row === itemsStartRow) {
          // 상품목록 헤더
          worksheet.getRow(row).height = excelRowHeight * 1.2;
        } else if (row > itemsStartRow && row <= itemsStartRow + (request.items?.length || 0)) {
          // 상품 데이터 행들
          worksheet.getRow(row).height = excelRowHeight;
        } else if (row >= summaryStartRow && row <= summaryStartRow + 1) {
          // 요약 정보 행들
          worksheet.getRow(row).height = excelRowHeight * 1.1;
        } else if (row >= memoStartRow) {
          // 비고, 거절사유, 서명 행들
          if (row === signatureStartRow + 3 && approverSignature) {
            // 서명 이미지가 있는 경우 더 크게
            worksheet.getRow(row).height = Math.max(excelRowHeight * 1.5, 60);
          } else {
            worksheet.getRow(row).height = excelRowHeight;
          }
        }
      }

      // ====== 인쇄 설정 ======

      // 인쇄 영역 설정 - 서명 정보 포함 (한 행에 맞춤)
      const lastRow = signatureStartRow + 1; // 서명 정보가 한 행에 배치됨
      worksheet.pageSetup.printArea = `A1:F${lastRow}`;
      
      // 인쇄 미리보기 최적화를 위한 핵심 설정
      worksheet.pageSetup.fitToPage = true;
      worksheet.pageSetup.fitToWidth = 1; // 페이지 너비에 맞춤
      worksheet.pageSetup.fitToHeight = 0; // 페이지 높이 자동 조정 (내용에 따라 유동적)
      worksheet.pageSetup.orientation = 'portrait'; // 세로 방향
      
      // 여백 설정 - 인쇄 안정성을 위해 최소 여백 사용
      worksheet.pageSetup.margins = {
        top: 0.3,    // 상단 여백 (0.3인치)
        left: 0.3,   // 좌측 여백 (0.3인치)
        bottom: 0.3, // 하단 여백 (0.3인치)
        right: 0.3,  // 우측 여백 (0.3인치)
        header: 0.3, // 헤더 여백 (0.3인치)
        footer: 0.3  // 푸터 여백 (0.3인치)
      };

      // ====== 파일 저장 ======
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `본사_물류요청서_${request.request_number}_${new Date().toISOString().split('T')[0]}.xlsx`;
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
                        
                        <button
                          onClick={openSignatureModal}
                          className="text-blue-600 hover:text-blue-900"
                          title="서명 추가"
                        >
                          ✍️ 서명
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
                  onClick={openSignatureModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center space-x-2"
                >
                  <span>✍️</span>
                  <span>서명 추가</span>
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

      {/* 서명 모달 */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">승인자 서명</h2>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
              C:\Users\20201\Desktop\vsc0\convi\src\pages\store\StoreSupply.tsx 파일에 포함될 승인자 서명을 작성해주세요.
              </p>
              <p className="text-sm text-gray-500">
                서명이 완료되면 엑셀 다운로드 시 승인자 정보와 함께 서명이 포함됩니다.
              </p>
            </div>

            <div className="flex justify-center">
              <SignaturePad
                onSave={handleSignatureSave}
                onClear={handleSignatureClear}
                width={400}
                height={200}
                penColor="#000000"
                backgroundColor="#ffffff"
              />
            </div>

            {approverSignature && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm text-green-700">
                    서명이 저장되었습니다. 이제 엑셀 다운로드 시 서명이 포함됩니다.
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HQSupply; 