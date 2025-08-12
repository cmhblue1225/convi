import React, { useState, useEffect, useCallback } from 'react';
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
  status: string;
  priority: string | null;
  total_amount: number | null;
  approved_amount: number | null;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  notes: string | null;
  rejection_reason: string | null;
  created_at: string | null;
  items?: SupplyRequestItem[];
}

interface SupplyRequestItem {
  id: string;
  supply_request_id: string | null;
  product_id: string | null;
  product_name: string;
  requested_quantity: number;
  approved_quantity: number | null;
  unit_cost: number | null;
  total_cost: number | null;
  reason: string | null;
  current_stock: number | null;
}

const StoreSupply: React.FC = () => {
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SupplyRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modalProducts, setModalProducts] = useState<StoreProduct[]>([]);
  const { user } = useAuthStore();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 현재 사용자의 지점 ID 조회
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user?.id || '')
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
            is_available,
            store_id
          )
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (productsError) {
        console.error('❌ 재고 현황 조회 실패:', productsError);
      } else {
        // 데이터 구조 변환
        const transformedData = (productsData || []).map((product) => {
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
      console.error('❌ 상품 목록 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filterStatus]);

  // 엑셀 다운로드 함수
  const downloadExcel = async (request: SupplyRequest) => {
    try {
      console.log('📊 엑셀 다운로드 시작:', request.request_number);
      
      // 현재 사용자의 지점 정보 조회
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('name, address, phone')
        .eq('owner_id', user?.id || '')
        .single();

      if (storeError || !storeData) {
        console.error('❌ 지점 정보 조회 실패:', storeError);
        alert('지점 정보를 찾을 수 없습니다.');
        return;
      }

      // 워크북 생성
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('물류요청서');

      // 제목 행
      worksheet.getCell('A1').value = '물류 요청서';
      worksheet.getCell('A1').font = { name: '맑은 고딕', size: 16, bold: true };
      worksheet.mergeCells('A1:F1');
      worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

      // 기본 정보 섹션
      const basicInfoStartRow = 3;
      worksheet.getCell(`A${basicInfoStartRow}`).value = '요청번호';
      worksheet.getCell(`B${basicInfoStartRow}`).value = request.request_number;
      worksheet.getCell(`A${basicInfoStartRow + 1}`).value = '요청일시';
      worksheet.getCell(`B${basicInfoStartRow + 1}`).value = request.created_at ? new Date(request.created_at).toLocaleDateString('ko-KR') : '-';
      worksheet.getCell(`A${basicInfoStartRow + 2}`).value = '상태';
      worksheet.getCell(`B${basicInfoStartRow + 2}`).value = getStatusText(request.status);
      worksheet.getCell(`A${basicInfoStartRow + 3}`).value = '우선순위';
      worksheet.getCell(`B${basicInfoStartRow + 3}`).value = request.priority || '-';
      worksheet.getCell(`A${basicInfoStartRow + 4}`).value = '예상배송일';
      worksheet.getCell(`B${basicInfoStartRow + 4}`).value = request.expected_delivery_date ? new Date(request.expected_delivery_date).toLocaleDateString('ko-KR') : '-';

      // 지점 정보
      worksheet.getCell(`D${basicInfoStartRow}`).value = '지점명';
      worksheet.getCell(`E${basicInfoStartRow}`).value = storeData.name;
      worksheet.getCell(`D${basicInfoStartRow + 1}`).value = '주소';
      worksheet.getCell(`E${basicInfoStartRow + 1}`).value = storeData.address || '-';
      worksheet.getCell(`D${basicInfoStartRow + 2}`).value = '연락처';
      worksheet.getCell(`E${basicInfoStartRow + 2}`).value = storeData.phone || '-';

      // 기본 정보 스타일 적용
      for (let row = basicInfoStartRow; row <= basicInfoStartRow + 4; row++) {
        for (let col = 1; col <= 6; col++) {
          const cell = worksheet.getCell(row, col);
          if (col === 1 || col === 4) {
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
          cell.alignment = { vertical: 'middle', horizontal: col === 1 || col === 4 ? 'center' : 'left' };
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

      // 요청 상품 테이블 헤더
      const itemsStartRow = basicInfoStartRow + 6;
      worksheet.getCell(`A${itemsStartRow}`).value = '상품명';
      worksheet.getCell(`B${itemsStartRow}`).value = '요청수량';
      worksheet.getCell(`C${itemsStartRow}`).value = '단위';
      worksheet.getCell(`D${itemsStartRow}`).value = '승인수량';
      worksheet.getCell(`E${itemsStartRow}`).value = '현재재고';
      worksheet.getCell(`F${itemsStartRow}`).value = '요청사유';

      // 요청 상품 테이블 헤더 스타일
      for (let col = 1; col <= 6; col++) {
        const cell = worksheet.getCell(itemsStartRow, col);
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

      // 요청 상품 데이터 추가
      if (request.items && request.items.length > 0) {
        request.items.forEach((item, index) => {
          const row = itemsStartRow + 1 + index;
          worksheet.getCell(`A${row}`).value = item.product_name;
          worksheet.getCell(`B${row}`).value = item.requested_quantity;
          worksheet.getCell(`C${row}`).value = '개'; // 기본 단위
          worksheet.getCell(`D${row}`).value = item.approved_quantity || '-';
          worksheet.getCell(`E${row}`).value = item.current_stock || 0;
          worksheet.getCell(`F${row}`).value = item.reason || '-';

          // 데이터 행 스타일
          for (let col = 1; col <= 6; col++) {
            const cell = worksheet.getCell(row, col);
            cell.font = { name: '맑은 고딕', size: 10 };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } }
            };
            cell.alignment = { vertical: 'middle', horizontal: col === 2 || col === 4 || col === 5 ? 'center' : 'left' };
          }
        });
      }

      // 요약 정보
      const summaryStartRow = itemsStartRow + (request.items?.length || 0) + 2;
      worksheet.getCell(`A${summaryStartRow}`).value = '총 요청 금액';
      worksheet.getCell(`B${summaryStartRow}`).value = request.total_amount || 0;
      worksheet.getCell(`A${summaryStartRow + 1}`).value = '승인 금액';
      worksheet.getCell(`B${summaryStartRow + 1}`).value = request.approved_amount || 0;

      // 요약 정보 스타일
      for (let row = summaryStartRow; row <= summaryStartRow + 1; row++) {
        for (let col = 1; col <= 2; col++) {
          const cell = worksheet.getCell(row, col);
          if (col === 1) {
            cell.font = { name: '맑은 고딕', size: 10, bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } };
          } else {
            cell.font = { name: '맑은 고딕', size: 10, bold: true };
          }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
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
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
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
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          if (col === 6) {
            cell.border.right = { style: 'thin', color: { argb: 'FF000000' } };
          }
          cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'center' : 'left' };
        }
      }

      // 열 너비 조정
      worksheet.getColumn('A').width = 15;
      worksheet.getColumn('B').width = 20;
      worksheet.getColumn('C').width = 10;
      worksheet.getColumn('D').width = 15;
      worksheet.getColumn('E').width = 15;
      worksheet.getColumn('F').width = 25;

      // 파일 저장
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `물류요청서_${request.request_number}_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);

      console.log('✅ 엑셀 다운로드 완료:', fileName);
    } catch (error) {
      console.error('❌ 엑셀 다운로드 실패:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 실시간 구독 설정
  useEffect(() => {
    fetchData();

    // 실시간 구독
    const subscription = supabase
      .channel('store_supply_changes')
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
  }, [fetchData]);

  const handleViewDetail = (request: SupplyRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCreateRequest = async () => {
    setModalProducts(storeProducts);
    setShowCreateModal(true);
  };

  const createSupplyRequest = async (formData: FormData) => {
    try {
      console.log('🚀 물류 요청 생성 시작');
      
      // 현재 사용자의 지점 ID 조회
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id, name')
        .eq('owner_id', user?.id || '')
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
            const { data: stockData } = await supabase
              .from('store_products')
              .select('stock_quantity')
              .eq('store_id', storeId)
              .eq('product_id', productId)
              .single();
            
            const currentStock = stockData?.stock_quantity || 0;

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
              const { data: existingProduct } = await supabase
                .from('store_products')
                .select('id')
                .eq('store_id', storeId)
                .eq('product_id', productId)
                .single();
              
              if (!existingProduct) {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">전체 요청</div>
          <div className="text-2xl font-bold text-gray-900">{supplyRequests.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">대기중 요청</div>
          <div className="text-2xl font-bold text-blue-600">
            {supplyRequests.filter(r => r.status === 'submitted').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">배송중</div>
          <div className="text-2xl font-bold text-purple-600">
            {supplyRequests.filter(r => r.status === 'shipped').length}
          </div>
        </div>
      </div>

      {/* 물류 요청 생성 버튼 */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleCreateRequest}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          물류 요청
        </button>
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
                      {request.priority || 'normal'}
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
                    {request.created_at ? new Date(request.created_at).toLocaleDateString() : '-'}
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
                          {modalProducts.map((product) => (
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">물류 요청 상세</h3>
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
                              <td className="px-3 py-2 text-sm text-gray-900">{item.current_stock || 0}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{item.reason || '-'}</td>
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
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => downloadExcel(selectedRequest)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  📊 엑셀로 다운로드
                </button>
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