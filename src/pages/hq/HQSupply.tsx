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
      
      // 제목 - 더 깔끔하게
      worksheet.mergeCells('B2:J2');
      worksheet.getCell('B2').value = '본사 물류 요청 관리';
      worksheet.getCell('B2').font = { name: '맑은 고딕', size: 18, bold: true };
      worksheet.getCell('B2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };
      worksheet.getCell('B2').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(2).height = 30; // 제목 행 높이 증가

      // 기본 정보 - 더 깔끔한 레이아웃
      worksheet.getCell('B4').value = '요청번호';
      worksheet.getCell('C4').value = request.request_number;
      worksheet.getCell('E4').value = '요청일자';
      worksheet.getCell('F4').value = request.created_at ? new Date(request.created_at).toLocaleDateString('ko-KR') : '-';

      worksheet.getCell('B5').value = '지점명';
      worksheet.getCell('C5').value = storeName;
      worksheet.getCell('E5').value = '지점연락처';
      worksheet.getCell('F5').value = storePhone;

      worksheet.getCell('B6').value = '지점주소';
      worksheet.getCell('C6').value = storeAddress;
      worksheet.getCell('E6').value = '희망배송일';
      worksheet.getCell('F6').value = request.expected_delivery_date ? new Date(request.expected_delivery_date).toLocaleDateString('ko-KR') : '-';

      worksheet.getCell('B7').value = '상태';
      worksheet.getCell('C7').value = getStatusText(request.status);
      worksheet.getCell('E7').value = '우선순위';
      worksheet.getCell('F7').value = getPriorityText(request.priority);

      worksheet.getCell('B8').value = '총 요청금액';
      worksheet.getCell('C8').value = request.total_amount || 0;
      worksheet.getCell('C8').numFmt = '#,##0'; // 숫자 형식 적용
      worksheet.getCell('E8').value = '승인금액';
      worksheet.getCell('F8').value = request.approved_amount || 0;
      worksheet.getCell('F8').numFmt = '#,##0'; // 숫자 형식 적용

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

      // 헤더 스타일 - 더 깔끔하게
      for (let col = 2; col <= 10; col++) {
        const cell = worksheet.getCell(10, col);
        cell.font = { name: '맑은 고딕', size: 10, bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF0066CC' } },
          left: { style: 'thin', color: { argb: 'FF0066CC' } },
          bottom: { style: 'thin', color: { argb: 'FF0066CC' } },
          right: { style: 'thin', color: { argb: 'FF0066CC' } }
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
          worksheet.getCell(row, 5).numFmt = '#,##0'; // 요청수량 숫자 형식
          worksheet.getCell(row, 6).value = item.approved_quantity || 0;
          worksheet.getCell(row, 6).numFmt = '#,##0'; // 승인수량 숫자 형식
          worksheet.getCell(row, 7).value = item.unit_cost || 0;
          worksheet.getCell(row, 7).numFmt = '#,##0'; // 단가 숫자 형식
          worksheet.getCell(row, 8).value = item.total_cost || 0;
          worksheet.getCell(row, 8).numFmt = '#,##0'; // 총액 숫자 형식
          worksheet.getCell(row, 9).value = item.current_stock;
          worksheet.getCell(row, 9).numFmt = '#,##0'; // 현재재고 숫자 형식
          worksheet.getCell(row, 10).value = item.reason || '-';

          // 상품명과 요청사유 셀에 줄바꿈 및 자동 맞춤 설정
          const productNameCell = worksheet.getCell(row, 3);
          const reasonCell = worksheet.getCell(row, 10);
          
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

          // 데이터 행 스타일 - 더 깔끔하게
          for (let col = 2; col <= 10; col++) {
            const cell = worksheet.getCell(row, col);
            cell.font = { name: '맑은 고딕', size: 9 };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
              left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
              bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
              right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
            };
            
            // 숫자 데이터는 우측 정렬, 텍스트는 좌측 정렬
            if (col === 2 || col === 5 || col === 6 || col === 7 || col === 8 || col === 9) {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }
          }
        });
      }

      // ====== 요약 정보 ======
      
      const summaryRow = 12 + (request.items?.length || 0);
      
      worksheet.getCell(`B${summaryRow}`).value = '합계';
      worksheet.getCell(`B${summaryRow}`).font = { name: '맑은 고딕', size: 10, bold: true };
      worksheet.getCell(`B${summaryRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } };
      
      worksheet.getCell(`E${summaryRow}`).value = request.items?.reduce((sum, item) => sum + item.requested_quantity, 0) || 0;
      worksheet.getCell(`E${summaryRow}`).numFmt = '#,##0'; // 요청수량 합계 숫자 형식
      worksheet.getCell(`F${summaryRow}`).value = request.items?.reduce((sum, item) => sum + (item.approved_quantity || 0), 0) || 0;
      worksheet.getCell(`F${summaryRow}`).numFmt = '#,##0'; // 승인수량 합계 숫자 형식
      worksheet.getCell(`H${summaryRow}`).value = request.total_amount || 0;
      worksheet.getCell(`H${summaryRow}`).numFmt = '#,##0'; // 총액 합계 숫자 형식

      // 합계 행 스타일 - 더 깔끔하게
      for (let col = 2; col <= 10; col++) {
        const cell = worksheet.getCell(summaryRow, col);
        cell.font = { name: '맑은 고딕', size: 10, bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2F2' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCC6666' } },
          left: { style: 'thin', color: { argb: 'FFCC6666' } },
          bottom: { style: 'thin', color: { argb: 'FFCC6666' } },
          right: { style: 'thin', color: { argb: 'FFCC6666' } }
        };
        cell.alignment = { vertical: 'middle', horizontal: col === 2 ? 'center' : 'center' };
      }

      // ====== 메모 및 승인 정보 ======
      
      const memoRow = summaryRow + 2;
      
      worksheet.getCell(`B${memoRow}`).value = '요청사유';
      worksheet.getCell(`C${memoRow}`).value = request.notes || '없음';
      worksheet.mergeCells(`C${memoRow}:G${memoRow}`);

      worksheet.getCell(`B${memoRow + 1}`).value = '거절사유';
      worksheet.getCell(`C${memoRow + 1}`).value = request.rejection_reason || '해당없음';
      worksheet.mergeCells(`C${memoRow + 1}:G${memoRow + 1}`);

      // 승인자 정보 및 서명 추가
      if (approverSignature && request.approved_by) {
        // 서명이 있는 경우
        await addSignatureToExcel(worksheet, {
          approverName: request.approved_by,
          approvalDate: request.approved_at ? new Date(request.approved_at).toLocaleString() : '미승인',
          signatureImage: approverSignature
        }, memoRow + 2);
      } else {
        // 서명이 없는 경우 기본 승인자 정보만
        addApproverInfoToExcel(
          worksheet,
          request.approved_by || '미승인',
          request.approved_at ? new Date(request.approved_at).toLocaleString() : '미승인',
          memoRow + 2
        );
      }

      // ====== 스타일 적용 ======
      
      // 기본 정보 스타일 - 더 깔끔하게
      for (let row = 4; row <= 8; row++) {
        for (let col = 2; col <= 7; col++) {
          const cell = worksheet.getCell(row, col);
          if (col === 2 || col === 5) {
            cell.font = { name: '맑은 고딕', size: 10, bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else {
            cell.font = { name: '맑은 고딕', size: 10 };
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
          };
        }
      }

      // 메모 및 승인 정보 스타일 - 더 깔끔하게
      const maxRow = approverSignature && request.approved_by ? memoRow + 3 : memoRow + 2;
      for (let row = memoRow; row <= maxRow; row++) {
        for (let col = 2; col <= 7; col++) {
          const cell = worksheet.getCell(row, col);
          if (col === 2) {
            cell.font = { name: '맑은 고딕', size: 10, bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else {
            cell.font = { name: '맑은 고딕', size: 10 };
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
          };
        }
      }

      // 열 너비 설정 - 인쇄 시 잘리지 않도록 최적화
      worksheet.getColumn(1).width = 2;  // A열 (빈 열)
      worksheet.getColumn(2).width = 8;  // B열 (라벨)
      worksheet.getColumn(3).width = 35; // C열 (상품명) - 넓게 설정
      worksheet.getColumn(4).width = 10; // D열 (단위)
      worksheet.getColumn(5).width = 12; // E열 (요청수량)
      worksheet.getColumn(6).width = 12; // F열 (승인수량)
      worksheet.getColumn(7).width = 15; // G열 (단가)
      worksheet.getColumn(8).width = 15; // H열 (총액)
      worksheet.getColumn(9).width = 12; // I열 (현재재고)
      worksheet.getColumn(10).width = 30; // J열 (요청사유) - 넓게 설정

      // 행 높이 설정 - 상품명과 요청사유가 잘리지 않도록
      for (let row = 11; row <= 10 + (request.items?.length || 0); row++) {
        worksheet.getRow(row).height = 25; // 기본 행 높이 증가
      }

      // ====== 인쇄 설정 ======
      
      // 페이지 설정
      worksheet.pageSetup.fitToPage = true;
      worksheet.pageSetup.fitToWidth = 1; // 페이지 너비에 맞춤
      worksheet.pageSetup.fitToHeight = 0; // 높이는 자동 조정
      worksheet.pageSetup.orientation = 'portrait'; // 세로 방향
      worksheet.pageSetup.margins = {
        top: 0.5,
        left: 0.5,
        bottom: 0.5,
        right: 0.5,
        header: 0.3,
        footer: 0.3
      };

      // 인쇄 영역 설정
      const lastRow = approverSignature && request.approved_by ? memoRow + 3 : memoRow + 2;
      worksheet.pageSetup.printArea = `A1:J${lastRow}`;

      // 자동 맞춤 설정
      worksheet.properties.defaultRowHeight = 20;
      worksheet.properties.defaultColWidth = 12;

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