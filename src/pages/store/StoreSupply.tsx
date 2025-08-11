import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../stores/common/authStore';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface StoreProduct {
  id: string;
  store_id: string;
  product_id: string;
  price: number;
  stock_quantity: number;
  safety_stock: number;
  max_stock: number;
  is_available: boolean;
  product: {
    name: string;
    unit: string;
    base_price: number;
  };
}

interface SupplyRequest {
  id: string;
  request_number: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  total_amount: number;
  approved_amount: number;
  expected_delivery_date: string;
  actual_delivery_date: string;
  notes: string;
  rejection_reason: string;
  created_at: string;
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
}

const StoreSupply = () => {
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SupplyRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<string>('all');
  const { user } = useAuthStore();

  // 실시간 구독 설정
  useEffect(() => {
    fetchData();

    // 실시간 구독
    const subscription = supabase
      .channel('store_supply_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'store_products' }, 
        (payload) => {
          console.log('🔄 재고 데이터 변경 감지:', payload);
          fetchData(); // 데이터 새로고침
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'supply_requests' }, 
        (payload) => {
          console.log('🔄 물류 요청 데이터 변경 감지:', payload);
          fetchData(); // 데이터 새로고침
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 현재 사용자의 지점 ID 조회
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (storeError || !storeData) {
        console.error('❌ 지점 정보 조회 실패:', storeError);
        return;
      }

      const storeId = storeData.id;

      // 재고 현황 조회 - LEFT JOIN을 사용하여 재고가 없는 상품도 포함
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          unit,
          base_price,
          is_active,
          store_products!left(
            id,
            price,
            stock_quantity,
            safety_stock,
            max_stock,
            is_available
          )
        `)
        .eq('is_active', true)
        .eq('store_products.store_id', storeId)
        .order('name', { ascending: true });

      if (productsError) {
        console.error('❌ 재고 현황 조회 실패:', productsError);
      } else {
        // 데이터 구조 변환
        const transformedData = (productsData || []).map((product: any) => {
          const storeProduct = product.store_products?.[0];
          return {
            id: storeProduct?.id || `temp_${product.id}`,
            store_id: storeId,
            product_id: product.id,
            price: storeProduct?.price || product.base_price,
            stock_quantity: storeProduct?.stock_quantity || 0,
            safety_stock: storeProduct?.safety_stock || 10,
            max_stock: storeProduct?.max_stock || 100,
            is_available: storeProduct?.is_available ?? true,
            product: {
              name: product.name,
              unit: product.unit,
              base_price: product.base_price
            }
          };
        });
        setStoreProducts(transformedData);
      }

      // 물류 요청 조회
      let query = supabase
        .from('supply_requests')
        .select(`
          *,
          items:supply_request_items(*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data: requestsData, error: requestsError } = await query;

      if (requestsError) {
        console.error('❌ 물류 요청 조회 실패:', requestsError);
      } else {
        setSupplyRequests(requestsData || []);
      }
    } catch (error) {
      console.error('❌ 데이터 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = () => {
    setShowCreateModal(true);
  };

  const handleViewDetail = (request: SupplyRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const createSupplyRequest = async (formData: FormData) => {
    try {
      console.log('🚀 물류 요청 생성 시작');
      
      // 현재 사용자의 지점 ID 조회
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id, name')
        .eq('owner_id', user?.id)
        .single();

      if (storeError || !storeData) {
        console.error('❌ 지점 정보 조회 실패:', storeError);
        alert('지점 정보를 찾을 수 없습니다.');
        return;
      }

      console.log('🏪 지점 정보:', storeData);

      const storeId = storeData.id;
      const requestNumber = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const notes = formData.get('notes') as string;
      const priority = formData.get('priority') as string;
      const expectedDelivery = formData.get('expected_delivery') as string;

      console.log('📋 요청 정보:', {
        requestNumber,
        storeId,
        requestedBy: user?.id,
        priority,
        expectedDelivery,
        notes
      });

      // 물류 요청 생성
      const { data: requestData, error: requestError } = await supabase
        .from('supply_requests')
        .insert({
          request_number: requestNumber,
          store_id: storeId,
          requested_by: user?.id,
          status: 'submitted',
          priority: priority || 'normal',
          expected_delivery_date: expectedDelivery,
          notes: notes,
          total_amount: 0 // 초기값, 나중에 업데이트
        })
        .select()
        .single();

      if (requestError) {
        console.error('❌ 물류 요청 생성 실패:', requestError);
        console.error('❌ 오류 상세:', {
          message: requestError.message,
          details: requestError.details,
          hint: requestError.hint,
          code: requestError.code
        });
        alert('물류 요청 생성에 실패했습니다.');
        return;
      }

      console.log('✅ 물류 요청 생성 완료:', requestData);

      // 요청 아이템들 추가
      const items = [];
      let totalAmount = 0;

      for (const [key, value] of formData.entries()) {
        if (key.startsWith('quantity_') && value && parseInt(value as string) > 0) {
          const productId = key.replace('quantity_', '');
          const quantity = parseInt(value as string);
          const reason = formData.get(`reason_${productId}`) as string;

          // 상품 정보 조회
          const { data: productData } = await supabase
            .from('products')
            .select('name, base_price')
            .eq('id', productId)
            .single();

          if (productData) {
            const itemCost = productData.base_price * quantity;
            totalAmount += itemCost;

            // 현재 재고 확인
            const currentStock = storeProducts.find(sp => sp.product_id === productId)?.stock_quantity || 0;

            items.push({
              supply_request_id: requestData.id,
              product_id: productId,
              product_name: productData.name,
              requested_quantity: quantity,
              approved_quantity: 0,
              unit_cost: productData.base_price,
              total_cost: itemCost,
              reason: reason || '재고 보충',
              current_stock: currentStock
            });

            // 재고가 없는 상품의 경우 store_products 레코드 생성
            if (currentStock === 0) {
              const existingProduct = storeProducts.find(sp => sp.product_id === productId);
              if (!existingProduct || existingProduct.id.startsWith('temp_')) {
                await supabase
                  .from('store_products')
                  .insert({
                    store_id: storeId,
                    product_id: productId,
                    price: productData.base_price,
                    stock_quantity: 0,
                    safety_stock: 10,
                    max_stock: 100,
                    is_available: true
                  });
              }
            }
          }
        }
      }

      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from('supply_request_items')
          .insert(items);

        if (itemsError) {
          console.error('❌ 요청 아이템 생성 실패:', itemsError);
          alert('요청 아이템 생성에 실패했습니다.');
          return;
        }

        // 총액 업데이트
        await supabase
          .from('supply_requests')
          .update({ total_amount: totalAmount })
          .eq('id', requestData.id);
      }

      console.log('✅ 물류 요청 생성 완료');
      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      console.error('❌ 물류 요청 생성 중 오류:', error);
      alert('물류 요청 생성 중 오류가 발생했습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
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

  const getStockStatus = (current: number, safety: number) => {
    if (current <= 0) return { color: 'bg-red-100 text-red-800', text: '품절' };
    if (current <= safety) return { color: 'bg-orange-100 text-orange-800', text: '부족' };
    return { color: 'bg-green-100 text-green-800', text: '충분' };
  };

  const filteredProducts = storeProducts.filter(product => {
    if (filterStock === 'all') return true;
    if (filterStock === 'low' && product.stock_quantity <= product.safety_stock) return true;
    if (filterStock === 'out' && product.stock_quantity <= 0) return true;
    return false;
  });

  // 엑셀 다운로드 함수 - 거래명세서 형식
  const downloadExcel = async (request: SupplyRequest) => {
    try {
      // 워크북 생성
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('물류요청서');
      
      // 현재 사용자의 지점 정보 조회
      const { data: storeData } = await supabase
        .from('stores')
        .select('name, address, phone')
        .eq('owner_id', user?.id)
        .single();

      const storeName = storeData?.name || '지점명';
      const storeAddress = storeData?.address || '주소';
      const storePhone = storeData?.phone || '연락처';

      // ====== 첫 번째(공급받는자 보관용) 물류요청서 ======
      
      // 셀 병합
      worksheet.mergeCells('B2:G2');
      worksheet.mergeCells('B3:J4');
      worksheet.mergeCells('K3:M3');
      worksheet.mergeCells('N3:Q3');
      worksheet.mergeCells('R3:S3');
      worksheet.mergeCells('T3:AC3');
      worksheet.mergeCells('K4:N4');
      worksheet.mergeCells('O4:AC4');
      worksheet.mergeCells('B5:E5');
      worksheet.mergeCells('F5:O5');
      worksheet.mergeCells('P5:S5');
      worksheet.mergeCells('T5:AC5');
      worksheet.mergeCells('B6:C6');
      worksheet.mergeCells('D6:H6');
      worksheet.mergeCells('I6:J6');
      worksheet.mergeCells('K6:N6');
      worksheet.mergeCells('P6:Q6');
      worksheet.mergeCells('R6:U6');
      worksheet.mergeCells('V6:W6');
      worksheet.mergeCells('X6:AB6');
      worksheet.mergeCells('B7:C7');
      worksheet.mergeCells('D7:O7');
      worksheet.mergeCells('P7:Q7');
      worksheet.mergeCells('R7:AC7');
      worksheet.mergeCells('B8:C8');
      worksheet.mergeCells('D8:H8');
      worksheet.mergeCells('I8:J8');
      worksheet.mergeCells('K8:O8');
      worksheet.mergeCells('P8:Q8');
      worksheet.mergeCells('R8:U8');
      worksheet.mergeCells('V8:W8');
      worksheet.mergeCells('X8:AC8');
      worksheet.mergeCells('B9:C9');
      worksheet.mergeCells('D9:H9');
      worksheet.mergeCells('I9:J9');
      worksheet.mergeCells('K9:L9');
      worksheet.mergeCells('M9:O9');
      worksheet.mergeCells('P9:T9');
      worksheet.mergeCells('U9:Y9');
      worksheet.mergeCells('Z9:AC9');

      // 헤더 정보 입력
      worksheet.getCell('B2').value = '<공급받는자 보관용>';
      worksheet.getCell('B3').value = '물류요청서';
      worksheet.getCell('K3').value = '일자';
      worksheet.getCell('N3').value = new Date(request.created_at).toLocaleDateString();
      worksheet.getCell('R3').value = 'No.';
      worksheet.getCell('K4').value = '지점 연락처';
      worksheet.getCell('O4').value = storePhone;

      worksheet.getCell('B5').value = '지점';
      worksheet.getCell('P5').value = '본사';

      worksheet.getCell('B6').value = '상호';
      worksheet.getCell('D6').value = storeName;
      worksheet.getCell('I6').value = '담당자';
      worksheet.getCell('K6').value = user?.email || '사용자';
      worksheet.getCell('O6').value = '(인)';
      worksheet.getCell('P6').value = '상호';
      worksheet.getCell('R6').value = '본사';
      worksheet.getCell('V6').value = '담당자';
      worksheet.getCell('X6').value = '본사담당자';
      worksheet.getCell('AC6').value = '(인)';

      worksheet.getCell('B7').value = '주소';
      worksheet.getCell('D7').value = storeAddress;
      worksheet.getCell('P7').value = '주소';
      worksheet.getCell('R7').value = '본사주소';

      worksheet.getCell('B8').value = '업태';
      worksheet.getCell('D8').value = '소매';
      worksheet.getCell('I8').value = '종목';
      worksheet.getCell('K8').value = '소매';
      worksheet.getCell('P8').value = '비고';
      worksheet.getCell('R8').value = '요청자';
      worksheet.getCell('X8').value = user?.email || '사용자';

      worksheet.getCell('B9').value = '월일';
      worksheet.getCell('D9').value = '품명/규격';
      worksheet.getCell('I9').value = '단위';
      worksheet.getCell('K9').value = '요청수량';
      worksheet.getCell('N9').value = '단가';
      worksheet.getCell('P9').value = '공급가액';
      worksheet.getCell('U9').value = '현재재고';
      worksheet.getCell('Z9').value = '요청사유';

      // 품목 데이터 입력
      if (request.items && request.items.length > 0) {
        for (let i = 0; i < request.items.length && i < 10; i++) {
          const item = request.items[i];
          const row = 10 + i;
          
          worksheet.getCell(`B${row}`).value = new Date(request.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
          worksheet.getCell(`D${row}`).value = item.product_name;
          worksheet.getCell(`I${row}`).value = '-';
          worksheet.getCell(`K${row}`).value = item.requested_quantity > 0 ? item.requested_quantity : '';
          worksheet.getCell(`M${row}`).value = item.unit_cost > 0 ? item.unit_cost : '';
          worksheet.getCell(`P${row}`).value = item.total_cost > 0 ? item.total_cost : '';
          worksheet.getCell(`U${row}`).value = item.current_stock;
          worksheet.getCell(`Z${row}`).value = item.reason;

          // 품목 행 셀 병합
          worksheet.mergeCells(`B${row}:C${row}`);
          worksheet.mergeCells(`D${row}:H${row}`);
          worksheet.mergeCells(`I${row}:J${row}`);
          worksheet.mergeCells(`K${row}:L${row}`);
          worksheet.mergeCells(`M${row}:O${row}`);
          worksheet.mergeCells(`P${row}:T${row}`);
          worksheet.mergeCells(`U${row}:Y${row}`);
          worksheet.mergeCells(`Z${row}:AC${row}`);
        }
      }

      // 합계 행
      const totalAmount = request.items?.reduce((sum, item) => sum + (item.total_cost || 0), 0) || 0;
      worksheet.getCell('B20').value = '합계';
      worksheet.getCell('D20').value = `${totalAmount.toLocaleString()} (총 요청금액)`;
      worksheet.getCell('S20').value = '우선순위';
      worksheet.getCell('V20').value = request.priority;
      worksheet.getCell('B21').value = '메모';
      worksheet.getCell('D21').value = request.notes || '추가 요청사항 없음';
      worksheet.getCell('S21').value = '희망배송일';
      worksheet.getCell('V21').value = request.expected_delivery_date ? new Date(request.expected_delivery_date).toLocaleDateString() : '-';

      worksheet.getCell('B22').value = '-------------------------------------------------------------------------------------------------------------------------------------------------------------';

      // 합계 행 셀 병합
      worksheet.mergeCells('B20:C20');
      worksheet.mergeCells('D20:R20');
      worksheet.mergeCells('S20:U20');
      worksheet.mergeCells('V20:AC20');
      worksheet.mergeCells('B21:C21');
      worksheet.mergeCells('D21:R21');
      worksheet.mergeCells('S21:U21');
      worksheet.mergeCells('V21:AC21');
      worksheet.mergeCells('B22:AC22');

      // ====== 두 번째(공급자 보관용) 물류요청서 복사 ======
      
      // 1. 셀 병합 (행 번호 +21씩 증가)
      const mergeList = [
        ['B2:G2'], ['B3:J4'], ['K3:M3'], ['N3:Q3'], ['R3:S3'], ['T3:AC3'],
        ['K4:N4'], ['O4:AC4'], ['B5:E5'], ['F5:O5'], ['P5:S5'], ['T5:AC5'],
        ['B6:C6'], ['D6:H6'], ['I6:J6'], ['K6:N6'], ['P6:Q6'], ['R6:U6'], ['V6:W6'], ['X6:AB6'],
        ['B7:C7'], ['D7:O7'], ['P7:Q7'], ['R7:AC7'],
        ['B8:C8'], ['D8:H8'], ['I8:J8'], ['K8:O8'], ['P8:Q8'], ['R8:U8'], ['V8:W8'], ['X8:AC8'],
        ['B9:C9'], ['D9:H9'], ['I9:J9'], ['K9:L9'], ['M9:O9'], ['P9:T9'], ['U9:Y9'], ['Z9:AC9'],
        ['B20:C20'], ['D20:R20'], ['S20:U20'], ['V20:AC20'],
        ['B21:C21'], ['D21:R21'], ['S21:U21'], ['V21:AC21'],
        ['B22:AC22']
      ];

      for (const [range] of mergeList) {
        const [start, end] = range.split(':');
        const startColMatch = start.match(/[A-Z]+/);
        const startRowMatch = start.match(/[0-9]+/);
        const endColMatch = end.match(/[A-Z]+/);
        const endRowMatch = end.match(/[0-9]+/);
        
        if (startColMatch && startRowMatch && endColMatch && endRowMatch) {
          const startCol = startColMatch[0];
          const startRow = parseInt(startRowMatch[0]);
          const endCol = endColMatch[0];
          const endRow = parseInt(endRowMatch[0]);
          worksheet.mergeCells(`${startCol}${startRow + 21}:${endCol}${endRow + 21}`);
        }
      }

      // 품목 행 셀 병합 복사
      for (let row = 10; row <= 19; row++) {
        worksheet.mergeCells(`B${row+21}:C${row+21}`);
        worksheet.mergeCells(`D${row+21}:H${row+21}`);
        worksheet.mergeCells(`I${row+21}:J${row+21}`);
        worksheet.mergeCells(`K${row+21}:L${row+21}`);
        worksheet.mergeCells(`M${row+21}:O${row+21}`);
        worksheet.mergeCells(`P${row+21}:T${row+21}`);
        worksheet.mergeCells(`U${row+21}:Y${row+21}`);
        worksheet.mergeCells(`Z${row+21}:AC${row+21}`);
      }

      // 2. 값+스타일 복사 (B2:AC21 -> B23:AC41)
      for (let row = 2; row <= 21; row++) {
        for (let col = 2; col <= 29; col++) {
          const sourceCell = worksheet.getCell(row, col);
          const destCell = worksheet.getCell(row + 21, col);
          destCell.value = sourceCell.value;
        }
      }

      // 3. 공급자 보관용 표시
      worksheet.getCell('B23').value = '<공급자 보관용>';

      // ====== 스타일 적용 ======
      
      // 폰트/정렬
      for (let row = 2; row <= 42; row++) {
        for (let col = 2; col <= 29; col++) {
          const cell = worksheet.getCell(row, col);
          cell.font = { name: '맑은 고딕', size: 8 };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      }

      // 제목 폰트 크기
      worksheet.getCell('B3').font = { name: '맑은 고딕', size: 18, bold: true };
      worksheet.getCell('B24').font = { name: '맑은 고딕', size: 18, bold: true };

      // 열너비, 행높이
      for (let i = 1; i <= worksheet.columnCount; i++) {
        worksheet.getColumn(i).width = 2.5;
      }
      for (let i = 1; i <= worksheet.rowCount; i++) {
        worksheet.getRow(i).height = 15;
      }

      // 기본 테두리 적용
      for (let row = 2; row <= 42; row++) {
        for (let col = 2; col <= 29; col++) {
          const cell = worksheet.getCell(row, col);
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        }
      }



      // 첫 번째 행 숨김 처리
      worksheet.getRow(1).height = 0.1;

      // ====== 파일 저장 ======
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `물류요청서_거래명세서_${request.request_number}_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
    } catch (error) {
      console.error('❌ 엑셀 다운로드 중 오류:', error);
      alert('엑셀 파일 생성 중 오류가 발생했습니다.');
    }
  };

  // 컬럼명을 숫자로 변환하는 함수
  const colNameToNumber = (colName: string) => {
    let num = 0;
    for (let i = 0; i < colName.length; i++) {
      num = num * 26 + (colName.charCodeAt(i) - 64);
    }
    return num;
  };

  

  // 인쇄 기능 추가
  const printDocument = (request: SupplyRequest) => {
    try {
      // 인쇄용 창 생성
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
        return;
      }
      
      // 현재 사용자의 지점 정보 조회
      supabase
        .from('stores')
        .select('name, address, phone')
        .eq('owner_id', user?.id)
        .single()
        .then(({ data: storeData }) => {
          const storeName = storeData?.name || '지점명';
          const storeAddress = storeData?.address || '주소';
          const storePhone = storeData?.phone || '연락처';

          // 인쇄용 HTML 생성
          const printHTML = generatePrintHTML(request, storeName, storeAddress, storePhone);

          // 인쇄 창에 HTML 작성 및 인쇄
          printWindow.document.write(printHTML);
          printWindow.document.close();
          
          // 이미지 로딩 대기 후 인쇄
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        });
      
    } catch (error) {
      console.error('❌ 인쇄 중 오류:', error);
      alert('인쇄 중 오류가 발생했습니다.');
    }
  };

  // 인쇄용 HTML 생성 함수
  const generatePrintHTML = (request: SupplyRequest, storeName: string, storeAddress: string, storePhone: string) => {
    let itemRows = '';
    if (request.items && request.items.length > 0) {
      request.items.forEach((item, index) => {
        itemRows += `
          <tr>
            <td>${index + 1}</td>
            <td>${item.product_name}</td>
            <td>-</td>
            <td>-</td>
            <td>${item.requested_quantity}</td>
            <td>${item.unit_cost?.toLocaleString()}</td>
            <td>${item.total_cost?.toLocaleString()}</td>
            <td>${item.current_stock}</td>
            <td>-</td>
            <td>${item.reason}</td>
            <td></td>
          </tr>
        `;
      });
    }

    const totalAmount = request.items?.reduce((sum, item) => sum + (item.total_cost || 0), 0) || 0;

    return `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>물류요청서</title>
        <style>
          @page { 
            size: A4 landscape; 
            margin: 10mm; 
          }
          body { 
            font-family: '맑은 고딕', Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            font-size: 9px; 
            line-height: 1.2;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-bottom: 2px; 
          }
          th, td { 
            border: 1px solid #000; 
            padding: 2px 3px; 
            text-align: center; 
            font-size: 8px; 
            word-wrap: break-word; 
            vertical-align: middle;
          }
          th { 
            background: #f1f1f1; 
            font-weight: bold; 
          }
          .title { 
            font-size: 18px; 
            font-weight: bold; 
            text-align: center; 
            padding: 8px 0; 
            border: 2px solid #000;
          }
          .header-row th { 
            background: #e6e6e6; 
            font-weight: bold; 
            font-size: 9px;
          }
          .info-row td { 
            text-align: left; 
            padding: 3px 5px;
          }
          .total-row { 
            background: #f0f8ff; 
            font-weight: bold; 
          }
          .note-row td { 
            text-align: left; 
            padding: 5px;
          }
          .signature-row th { 
            background: #f9f9f9; 
            font-size: 8px;
          }
          .item-table th:nth-child(1), .item-table td:nth-child(1) { width: 4%; }
          .item-table th:nth-child(2), .item-table td:nth-child(2) { width: 15%; }
          .item-table th:nth-child(3), .item-table td:nth-child(3) { width: 10%; }
          .item-table th:nth-child(4), .item-table td:nth-child(4) { width: 6%; }
          .item-table th:nth-child(5), .item-table td:nth-child(5) { width: 8%; }
          .item-table th:nth-child(6), .item-table td:nth-child(6) { width: 8%; }
          .item-table th:nth-child(7), .item-table td:nth-child(7) { width: 10%; }
          .item-table th:nth-child(8), .item-table td:nth-child(8) { width: 8%; }
          .item-table th:nth-child(9), .item-table td:nth-child(9) { width: 8%; }
          .item-table th:nth-child(10), .item-table td:nth-child(10) { width: 15%; }
          .item-table th:nth-child(11), .item-table td:nth-child(11) { width: 18%; }
        </style>
      </head>
      <body>
        <div class="title">물류요청서</div>
        
        <table>
          <tr>
            <th>요청일자</th>
            <td>${new Date(request.created_at).toLocaleDateString()}</td>
            <th>요청번호</th>
            <td>${request.request_number}</td>
            <th>요청자</th>
            <td>${user?.email || '사용자'}</td>
            <th>희망배송일</th>
            <td>${request.expected_delivery_date ? new Date(request.expected_delivery_date).toLocaleDateString() : '-'}</td>
          </tr>
          <tr>
            <th>지점명</th>
            <td colspan="7" class="info-row">${storeName}</td>
          </tr>
        </table>

        <table class="item-table">
          <tr class="header-row">
            <th>순번</th><th>품명</th><th>규격</th><th>단위</th><th>요청수량</th><th>단가</th><th>금액</th><th>현재재고</th><th>안전재고</th><th>요청사유</th><th>비고</th>
          </tr>
          ${itemRows}
          <tr class="total-row">
            <td colspan="6" style="text-align:right;font-weight:bold;">합계</td>
            <td style="font-weight:bold;">${totalAmount.toLocaleString()}</td>
            <td colspan="4"></td>
          </tr>
        </table>

        <table>
          <tr class="note-row">
            <th>비고</th>
            <td colspan="10">${request.notes || '추가 요청사항 없음'}</td>
          </tr>
        </table>

        <table>
          <tr>
            <th>지점 주소</th>
            <td colspan="3">${storeAddress}</td>
            <th>지점 연락처</th>
            <td colspan="5">${storePhone}</td>
          </tr>
        </table>

        <table>
          <tr class="signature-row">
            <th>요청자</th>
            <td colspan="2">지점장</td>
            <th>검토자</th>
            <td colspan="2">본사 담당자</td>
            <th>승인자</th>
            <td colspan="2">본사 책임자</td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

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
        <h1 className="text-2xl font-bold text-gray-900">물류 관리</h1>
        <p className="text-gray-600">재고 현황을 확인하고 본사에 물류를 요청합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">전체 상품</div>
          <div className="text-2xl font-bold text-gray-900">{storeProducts.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">재고 부족</div>
          <div className="text-2xl font-bold text-orange-600">
            {storeProducts.filter(p => p.stock_quantity <= p.safety_stock).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">품절</div>
          <div className="text-2xl font-bold text-red-600">
            {storeProducts.filter(p => p.stock_quantity <= 0).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">대기중 요청</div>
          <div className="text-2xl font-bold text-blue-600">
            {supplyRequests.filter(r => r.status === 'submitted').length}
          </div>
        </div>
      </div>

      {/* 재고 현황 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">재고 현황</h2>
          <div className="flex space-x-2">
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">전체</option>
              <option value="low">재고 부족</option>
              <option value="out">품절</option>
            </select>
            <button
              onClick={handleCreateRequest}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              물류 요청
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상품명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  현재재고
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  안전재고
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  판매가
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  단위
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock_quantity, product.safety_stock);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stock_quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.safety_stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.price.toLocaleString()}원</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.product.unit}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 물류 요청 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">물류 요청 목록</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-xs rounded ${
                filterStatus === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterStatus('submitted')}
              className={`px-3 py-1 text-xs rounded ${
                filterStatus === 'submitted' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              대기중
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1 text-xs rounded ${
                filterStatus === 'approved' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              승인됨
            </button>
            <button
              onClick={() => setFilterStatus('shipped')}
              className={`px-3 py-1 text-xs rounded ${
                filterStatus === 'shipped' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              배송중
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  요청번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  우선순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  요청일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supplyRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{request.request_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.total_amount?.toLocaleString()}원
                    </div>
                    {request.approved_amount && (
                      <div className="text-xs text-gray-500">
                        승인: {request.approved_amount.toLocaleString()}원
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetail(request)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        상세
                      </button>
                      <button
                        onClick={() => downloadExcel(request)}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        title="엑셀로 다운로드"
                      >
                        📊 엑셀
                      </button>
                      <button
                        onClick={() => printDocument(request)}
                        className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                        title="인쇄"
                      >
                        🖨️ 인쇄
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 물류 요청 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">물류 요청 생성</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                createSupplyRequest(new FormData(e.currentTarget));
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">우선순위</label>
                      <select
                        name="priority"
                        defaultValue="normal"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      >
                        <option value="low">낮음</option>
                        <option value="normal">보통</option>
                        <option value="high">높음</option>
                        <option value="urgent">긴급</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">희망 배송일</label>
                      <input
                        type="date"
                        name="expected_delivery"
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">요청 상품</label>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">상품명</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">현재재고</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">안전재고</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">요청수량</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">요청사유</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {storeProducts.map((product) => (
                            <tr key={product.id}>
                              <td className="px-3 py-2 text-sm text-gray-900">{product.product.name}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{product.stock_quantity}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{product.safety_stock}</td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  name={`quantity_${product.product_id}`}
                                  min="0"
                                  max="1000"
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  name={`reason_${product.product_id}`}
                                  placeholder="요청 사유"
                                  className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">비고</label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="추가 요청사항이나 특별한 요구사항이 있다면 입력해주세요."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    요청 생성
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 상세 보기 모달 */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">물류 요청 상세</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadExcel(selectedRequest)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center space-x-2"
                  >
                    <span>📊</span>
                    <span>엑셀로 다운로드</span>
                  </button>
                  <button
                    onClick={() => printDocument(selectedRequest)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm flex items-center space-x-2"
                  >
                    <span>🖨️</span>
                    <span>인쇄</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">요청번호</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedRequest.request_number}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">상태</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusText(selectedRequest.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedRequest.items && selectedRequest.items.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">요청 상품</label>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">상품명</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">요청수량</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">승인수량</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">현재재고</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">사유</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedRequest.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-3 py-2 text-sm text-gray-900">{item.product_name}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{item.requested_quantity}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{item.approved_quantity || '-'}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{item.current_stock}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{item.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedRequest.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">비고</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedRequest.notes}</div>
                  </div>
                )}

                {selectedRequest.rejection_reason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">거절 사유</label>
                    <div className="mt-1 text-sm text-red-600">{selectedRequest.rejection_reason}</div>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
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

export default StoreSupply; 