import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// 매출 요약 데이터 타입
interface SalesSummary {
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  avg_order_value: number;
  pickup_orders: number;
  delivery_orders: number;
}

// 지점별 순위 타입
interface StoreRanking {
  store_id: string;
  store_name: string;
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  rank_position: number;
}

// 상품별 순위 타입
interface ProductRanking {
  product_id: string;
  product_name: string;
  category_name: string;
  total_sold: number;
  total_revenue: number;
  avg_price: number;
  rank_position: number;
}

// 일별 매출 타입
interface DailySalesItem {
  sale_date: string;
  total_orders: number;
  completed_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

// 시간대별 매출 타입
interface HourlySalesItem {
  hour_of_day: number;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

// 결제 방법별 분석 타입
interface PaymentMethodAnalytics {
  payment_method: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  paid_orders: number;
  failed_orders: number;
}

// Excel 워크북 생성 및 스타일 설정
const createWorkbook = () => {
  const workbook = new ExcelJS.Workbook();
  
  // 기본 폰트 설정
  workbook.creator = 'Convi 본사 관리 시스템';
  workbook.lastModifiedBy = 'Convi 본사 관리 시스템';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  return workbook;
};

// 헤더 스타일 설정
const getHeaderStyle = () => ({
  font: { bold: true, color: { argb: 'FFFFFF' } },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }
});

// 데이터 셀 스타일 설정
const getDataStyle = () => ({
  border: {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  },
  alignment: { vertical: 'middle' }
});

// 숫자 셀 스타일 설정
const getNumberStyle = () => ({
  ...getDataStyle(),
  alignment: { horizontal: 'right', vertical: 'middle' },
  numFmt: '#,##0'
});

// 통화 셀 스타일 설정
const getCurrencyStyle = () => ({
  ...getDataStyle(),
  alignment: { horizontal: 'right', vertical: 'middle' },
  numFmt: '#,##0원'
});

// 매출 요약 시트 생성
const createSalesSummarySheet = (workbook: ExcelJS.Workbook, data: SalesSummary, dateRange: { startDate: string; endDate: string }) => {
  const worksheet = workbook.addWorksheet('매출 요약');
  
  // 제목 행
  worksheet.mergeCells('A1:D1');
  worksheet.getCell('A1').value = `매출 분석 보고서 (${dateRange.startDate} ~ ${dateRange.endDate})`;
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };
  
  // 헤더
  const headers = ['지표', '수치', '비율', '비고'];
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(2, index + 1);
    cell.value = header;
    Object.assign(cell, getHeaderStyle());
  });
  
  // 데이터
  const summaryData = [
    ['총 주문 수', data.total_orders, '100%', '전체 주문 건수'],
    ['완료 주문', data.completed_orders, `${((data.completed_orders / data.total_orders) * 100).toFixed(1)}%`, '성공적으로 완료된 주문'],
    ['취소 주문', data.cancelled_orders, `${((data.cancelled_orders / data.total_orders) * 100).toFixed(1)}%`, '고객이 취소한 주문'],
    ['픽업 주문', data.pickup_orders, `${((data.pickup_orders / data.total_orders) * 100).toFixed(1)}%`, '매장에서 픽업하는 주문'],
    ['배송 주문', data.delivery_orders, `${((data.delivery_orders / data.total_orders) * 100).toFixed(1)}%`, '배송되는 주문'],
    ['총 매출', data.total_revenue, '-', '전체 매출액'],
    ['평균 주문 금액', data.avg_order_value, '-', '주문당 평균 금액']
  ];
  
  summaryData.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const cell = worksheet.getCell(rowIndex + 3, colIndex + 1);
      cell.value = value;
      
      if (colIndex === 1 && typeof value === 'number') {
        if (colIndex === 1 && rowIndex === 5) { // 총 매출
          Object.assign(cell, getCurrencyStyle());
        } else if (colIndex === 1 && rowIndex === 6) { // 평균 주문 금액
          Object.assign(cell, getCurrencyStyle());
        } else {
          Object.assign(cell, getNumberStyle());
        }
      } else {
        Object.assign(cell, getDataStyle());
      }
    });
  });
  
  // 열 너비 자동 조정
  worksheet.columns.forEach(column => {
    column.width = Math.max(column.width || 0, 15);
  });
};

// 지점별 순위 시트 생성
const createStoreRankingSheet = (workbook: ExcelJS.Workbook, data: StoreRanking[], dateRange: { startDate: string; endDate: string }) => {
  const worksheet = workbook.addWorksheet('지점별 순위');
  
  // 제목 행
  worksheet.mergeCells('A1:F1');
  worksheet.getCell('A1').value = `지점별 매출 순위 (${dateRange.startDate} ~ ${dateRange.endDate})`;
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };
  
  // 헤더
  const headers = ['순위', '지점명', '총 매출', '총 주문 수', '평균 주문 금액', '지점 ID'];
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(2, index + 1);
    cell.value = header;
    Object.assign(cell, getHeaderStyle());
  });
  
  // 데이터
  data.forEach((store, index) => {
    const rowIndex = index + 3;
    worksheet.getCell(rowIndex, 1).value = store.rank_position;
    worksheet.getCell(rowIndex, 2).value = store.store_name;
    worksheet.getCell(rowIndex, 3).value = store.total_revenue;
    worksheet.getCell(rowIndex, 4).value = store.total_orders;
    worksheet.getCell(rowIndex, 5).value = store.avg_order_value;
    worksheet.getCell(rowIndex, 6).value = store.store_id;
    
    // 스타일 적용
    Object.assign(worksheet.getCell(rowIndex, 1), getNumberStyle());
    Object.assign(worksheet.getCell(rowIndex, 2), getDataStyle());
    Object.assign(worksheet.getCell(rowIndex, 3), getCurrencyStyle());
    Object.assign(worksheet.getCell(rowIndex, 4), getNumberStyle());
    Object.assign(worksheet.getCell(rowIndex, 5), getCurrencyStyle());
    Object.assign(worksheet.getCell(rowIndex, 6), getDataStyle());
  });
  
  // 열 너비 자동 조정
  worksheet.columns.forEach(column => {
    column.width = Math.max(column.width || 0, 15);
  });
};

// 상품별 순위 시트 생성
const createProductRankingSheet = (workbook: ExcelJS.Workbook, data: ProductRanking[], dateRange: { startDate: string; endDate: string }) => {
  const worksheet = workbook.addWorksheet('상품별 순위');
  
  // 제목 행
  worksheet.mergeCells('A1:G1');
  worksheet.getCell('A1').value = `상품별 매출 순위 (${dateRange.startDate} ~ ${dateRange.endDate})`;
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };
  
  // 헤더
  const headers = ['순위', '상품명', '카테고리', '총 판매량', '총 매출', '평균 가격', '상품 ID'];
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(2, index + 1);
    cell.value = header;
    Object.assign(cell, getHeaderStyle());
  });
  
  // 데이터
  data.forEach((product, index) => {
    const rowIndex = index + 3;
    worksheet.getCell(rowIndex, 1).value = product.rank_position;
    worksheet.getCell(rowIndex, 2).value = product.product_name;
    worksheet.getCell(rowIndex, 3).value = product.category_name;
    worksheet.getCell(rowIndex, 4).value = product.total_sold;
    worksheet.getCell(rowIndex, 5).value = product.total_revenue;
    worksheet.getCell(rowIndex, 6).value = product.avg_price;
    worksheet.getCell(rowIndex, 7).value = product.product_id;
    
    // 스타일 적용
    Object.assign(worksheet.getCell(rowIndex, 1), getNumberStyle());
    Object.assign(worksheet.getCell(rowIndex, 2), getDataStyle());
    Object.assign(worksheet.getCell(rowIndex, 3), getDataStyle());
    Object.assign(worksheet.getCell(rowIndex, 4), getNumberStyle());
    Object.assign(worksheet.getCell(rowIndex, 5), getCurrencyStyle());
    Object.assign(worksheet.getCell(rowIndex, 6), getCurrencyStyle());
    Object.assign(worksheet.getCell(rowIndex, 7), getDataStyle());
  });
  
  // 열 너비 자동 조정
  worksheet.columns.forEach(column => {
    column.width = Math.max(column.width || 0, 15);
  });
};

// 일별 매출 시트 생성
const createDailySalesSheet = (workbook: ExcelJS.Workbook, data: DailySalesItem[], dateRange: { startDate: string; endDate: string }) => {
  const worksheet = workbook.addWorksheet('일별 매출');
  
  // 제목 행
  worksheet.mergeCells('A1:E1');
  worksheet.getCell('A1').value = `일별 매출 현황 (${dateRange.startDate} ~ ${dateRange.endDate})`;
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };
  
  // 헤더
  const headers = ['날짜', '총 주문 수', '완료 주문 수', '총 매출', '평균 주문 금액'];
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(2, index + 1);
    cell.value = header;
    Object.assign(cell, getHeaderStyle());
  });
  
  // 데이터
  data.forEach((item, index) => {
    const rowIndex = index + 3;
    worksheet.getCell(rowIndex, 1).value = new Date(item.sale_date);
    worksheet.getCell(rowIndex, 2).value = item.total_orders;
    worksheet.getCell(rowIndex, 3).value = item.completed_orders;
    worksheet.getCell(rowIndex, 4).value = item.total_revenue;
    worksheet.getCell(rowIndex, 5).value = item.avg_order_value;
    
    // 스타일 적용
    worksheet.getCell(rowIndex, 1).numFmt = 'yyyy-mm-dd';
    Object.assign(worksheet.getCell(rowIndex, 1), getDataStyle());
    Object.assign(worksheet.getCell(rowIndex, 2), getNumberStyle());
    Object.assign(worksheet.getCell(rowIndex, 3), getNumberStyle());
    Object.assign(worksheet.getCell(rowIndex, 4), getCurrencyStyle());
    Object.assign(worksheet.getCell(rowIndex, 5), getCurrencyStyle());
  });
  
  // 열 너비 자동 조정
  worksheet.columns.forEach(column => {
    column.width = Math.max(column.width || 0, 15);
  });
};

// 시간대별 매출 시트 생성
const createHourlySalesSheet = (workbook: ExcelJS.Workbook, data: HourlySalesItem[]) => {
  const worksheet = workbook.addWorksheet('시간대별 매출');
  
  // 제목 행
  worksheet.mergeCells('A1:D1');
  worksheet.getCell('A1').value = '시간대별 매출 현황';
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };
  
  // 헤더
  const headers = ['시간대', '총 주문 수', '총 매출', '평균 주문 금액'];
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(2, index + 1);
    cell.value = header;
    Object.assign(cell, getHeaderStyle());
  });
  
  // 데이터
  data.forEach((item, index) => {
    const rowIndex = index + 3;
    worksheet.getCell(rowIndex, 1).value = `${item.hour_of_day}:00`;
    worksheet.getCell(rowIndex, 2).value = item.total_orders;
    worksheet.getCell(rowIndex, 3).value = item.total_revenue;
    worksheet.getCell(rowIndex, 4).value = item.avg_order_value;
    
    // 스타일 적용
    Object.assign(worksheet.getCell(rowIndex, 1), getDataStyle());
    Object.assign(worksheet.getCell(rowIndex, 2), getNumberStyle());
    Object.assign(worksheet.getCell(rowIndex, 3), getCurrencyStyle());
    Object.assign(worksheet.getCell(rowIndex, 4), getCurrencyStyle());
  });
  
  // 열 너비 자동 조정
  worksheet.columns.forEach(column => {
    column.width = Math.max(column.width || 0, 15);
  });
};

// 결제 방법별 분석 시트 생성
const createPaymentMethodSheet = (workbook: ExcelJS.Workbook, data: PaymentMethodAnalytics[]) => {
  const worksheet = workbook.addWorksheet('결제 방법별 분석');
  
  // 제목 행
  worksheet.mergeCells('A1:F1');
  worksheet.getCell('A1').value = '결제 방법별 매출 분석';
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };
  
  // 헤더
  const headers = ['결제 방법', '총 주문 수', '총 매출', '평균 주문 금액', '성공 주문', '실패 주문'];
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(2, index + 1);
    cell.value = header;
    Object.assign(cell, getHeaderStyle());
  });
  
  // 데이터
  data.forEach((method, index) => {
    const rowIndex = index + 3;
    worksheet.getCell(rowIndex, 1).value = method.payment_method;
    worksheet.getCell(rowIndex, 2).value = method.total_orders;
    worksheet.getCell(rowIndex, 3).value = method.total_revenue;
    worksheet.getCell(rowIndex, 4).value = method.avg_order_value;
    worksheet.getCell(rowIndex, 5).value = method.paid_orders;
    worksheet.getCell(rowIndex, 6).value = method.failed_orders;
    
    // 스타일 적용
    Object.assign(worksheet.getCell(rowIndex, 1), getDataStyle());
    Object.assign(worksheet.getCell(rowIndex, 2), getNumberStyle());
    Object.assign(worksheet.getCell(rowIndex, 3), getCurrencyStyle());
    Object.assign(worksheet.getCell(rowIndex, 4), getCurrencyStyle());
    Object.assign(worksheet.getCell(rowIndex, 5), getNumberStyle());
    Object.assign(worksheet.getCell(rowIndex, 6), getNumberStyle());
  });
  
  // 열 너비 자동 조정
  worksheet.columns.forEach(column => {
    column.width = Math.max(column.width || 0, 15);
  });
};

// 메인 Excel 내보내기 함수
export const exportAnalyticsToExcel = async (
  salesSummary: SalesSummary,
  storeRankings: StoreRanking[],
  productRankings: ProductRanking[],
  dailySalesItems: DailySalesItem[],
  hourlySalesItems: HourlySalesItem[],
  paymentMethods: PaymentMethodAnalytics[],
  dateRange: { startDate: string; endDate: string }
) => {
  try {
    const workbook = createWorkbook();
    
    // 각 시트 생성
    createSalesSummarySheet(workbook, salesSummary, dateRange);
    createStoreRankingSheet(workbook, storeRankings, dateRange);
    createProductRankingSheet(workbook, productRankings, dateRange);
    createDailySalesSheet(workbook, dailySalesItems, dateRange);
    createHourlySalesSheet(workbook, hourlySalesItems);
    createPaymentMethodSheet(workbook, paymentMethods);
    
    // Excel 파일 생성
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // 파일명 생성
    const startDate = new Date(dateRange.startDate).toISOString().split('T')[0];
    const endDate = new Date(dateRange.endDate).toISOString().split('T')[0];
    const fileName = `매출분석보고서_${startDate}_${endDate}.xlsx`;
    
    // 파일 다운로드
    saveAs(blob, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Excel 내보내기 실패:', error);
    return { success: false, error: error.message };
  }
};

// PDF 인쇄용 데이터 포맷팅
export const formatDataForPrint = (
  salesSummary: SalesSummary,
  storeRankings: StoreRanking[],
  productRankings: ProductRanking[],
  dailySalesItems: DailySalesItem[],
  hourlySalesItems: HourlySalesItem[],
  paymentMethods: PaymentMethodAnalytics[],
  dateRange: { startDate: string; endDate: string }
) => {
  return {
    title: `매출 분석 보고서 (${dateRange.startDate} ~ ${dateRange.endDate})`,
    generatedAt: new Date().toLocaleString('ko-KR'),
    salesSummary,
    storeRankings: storeRankings.slice(0, 10), // 상위 10개만
    productRankings: productRankings.slice(0, 10), // 상위 10개만
    dailySalesItems,
    hourlySalesItems,
    paymentMethods
  };
};
