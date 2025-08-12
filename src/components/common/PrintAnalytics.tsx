import React, { useRef } from 'react';
import { formatDataForPrint } from '../../utils/analyticsExport';

interface SalesSummary {
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  avg_order_value: number;
  pickup_orders: number;
  delivery_orders: number;
}

interface StoreRanking {
  store_id: string;
  store_name: string;
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  rank_position: number;
}

interface ProductRanking {
  product_id: string;
  product_name: string;
  category_name: string;
  total_sold: number;
  total_revenue: number;
  avg_price: number;
  rank_position: number;
}

interface DailySalesItem {
  sale_date: string;
  total_orders: number;
  completed_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

interface HourlySalesItem {
  hour_of_day: number;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

interface PaymentMethodAnalytics {
  payment_method: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  paid_orders: number;
  failed_orders: number;
}

interface PrintAnalyticsProps {
  salesSummary: SalesSummary;
  storeRankings: StoreRanking[];
  productRankings: ProductRanking[];
  dailySalesItems: DailySalesItem[];
  hourlySalesItems: HourlySalesItem[];
  paymentMethods: PaymentMethodAnalytics[];
  dateRange: { startDate: string; endDate: string };
  onClose: () => void;
}

const PrintAnalytics: React.FC<PrintAnalyticsProps> = ({
  salesSummary,
  storeRankings,
  productRankings,
  dailySalesItems,
  hourlySalesItems,
  paymentMethods,
  dateRange,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>매출 분석 보고서</title>
              <style>
                @media print {
                  body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                  .page-break { page-break-before: always; }
                  .no-break { page-break-inside: avoid; }
                  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; font-weight: bold; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
                  .summary-item { border: 1px solid #ddd; padding: 15px; text-align: center; }
                  .summary-value { font-size: 18px; font-weight: bold; color: #2563eb; }
                  .summary-label { font-size: 14px; color: #666; margin-top: 5px; }
                  .chart-section { margin-bottom: 30px; }
                  .chart-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #1f2937; }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const printData = formatDataForPrint(
    salesSummary,
    storeRankings,
    productRankings,
    dailySalesItems,
    hourlySalesItems,
    paymentMethods,
    dateRange
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">🖨️ 매출 분석 인쇄 미리보기</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              인쇄
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 인쇄용 콘텐츠 */}
        <div ref={printRef} className="print-content">
          {/* 헤더 */}
          <div className="header">
            <h1 className="text-2xl font-bold mb-2">{printData.title}</h1>
            <p className="text-gray-600">생성일시: {printData.generatedAt}</p>
          </div>

          {/* 매출 요약 */}
          <div className="chart-section">
            <div className="chart-title">📊 매출 요약</div>
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-value">{formatCurrency(salesSummary.total_revenue)}</div>
                <div className="summary-label">총 매출</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">{formatNumber(salesSummary.total_orders)}</div>
                <div className="summary-label">총 주문 수</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">{formatNumber(salesSummary.completed_orders)}</div>
                <div className="summary-label">완료 주문</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">{formatCurrency(salesSummary.avg_order_value)}</div>
                <div className="summary-label">평균 주문 금액</div>
              </div>
            </div>
          </div>

          {/* 지점별 순위 */}
          <div className="chart-section">
            <div className="chart-title">🏪 지점별 매출 순위 (상위 10개)</div>
            <table className="no-break">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>지점명</th>
                  <th>총 매출</th>
                  <th>총 주문 수</th>
                  <th>평균 주문 금액</th>
                </tr>
              </thead>
              <tbody>
                {printData.storeRankings.map((store) => (
                  <tr key={store.store_id}>
                    <td>{store.rank_position}</td>
                    <td>{store.store_name}</td>
                    <td>{formatCurrency(store.total_revenue)}</td>
                    <td>{formatNumber(store.total_orders)}</td>
                    <td>{formatCurrency(store.avg_order_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 상품별 순위 */}
          <div className="chart-section">
            <div className="chart-title">📦 상품별 매출 순위 (상위 10개)</div>
            <table className="no-break">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>상품명</th>
                  <th>카테고리</th>
                  <th>총 판매량</th>
                  <th>총 매출</th>
                  <th>평균 가격</th>
                </tr>
              </thead>
              <tbody>
                {printData.productRankings.map((product) => (
                  <tr key={product.product_id}>
                    <td>{product.rank_position}</td>
                    <td>{product.product_name}</td>
                    <td>{product.category_name}</td>
                    <td>{formatNumber(product.total_sold)}</td>
                    <td>{formatCurrency(product.total_revenue)}</td>
                    <td>{formatCurrency(product.avg_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 일별 매출 */}
          <div className="chart-section">
            <div className="chart-title">📅 일별 매출 현황</div>
            <table className="no-break">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>총 주문 수</th>
                  <th>완료 주문 수</th>
                  <th>총 매출</th>
                  <th>평균 주문 금액</th>
                </tr>
              </thead>
              <tbody>
                {printData.dailySalesItems.map((item, index) => (
                  <tr key={index}>
                    <td>{new Date(item.sale_date).toLocaleDateString('ko-KR')}</td>
                    <td>{formatNumber(item.total_orders)}</td>
                    <td>{formatNumber(item.completed_orders)}</td>
                    <td>{formatCurrency(item.total_revenue)}</td>
                    <td>{formatCurrency(item.avg_order_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 시간대별 매출 */}
          <div className="chart-section">
            <div className="chart-title">⏰ 시간대별 매출 현황</div>
            <table className="no-break">
              <thead>
                <tr>
                  <th>시간대</th>
                  <th>총 주문 수</th>
                  <th>총 매출</th>
                  <th>평균 주문 금액</th>
                </tr>
              </thead>
              <tbody>
                {printData.hourlySalesItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.hour_of_day}:00</td>
                    <td>{formatNumber(item.total_orders)}</td>
                    <td>{formatCurrency(item.total_revenue)}</td>
                    <td>{formatCurrency(item.avg_order_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 결제 방법별 분석 */}
          <div className="chart-section">
            <div className="chart-title">💳 결제 방법별 분석</div>
            <table className="no-break">
              <thead>
                <tr>
                  <th>결제 방법</th>
                  <th>총 주문 수</th>
                  <th>총 매출</th>
                  <th>평균 주문 금액</th>
                  <th>성공 주문</th>
                  <th>실패 주문</th>
                </tr>
              </thead>
              <tbody>
                {printData.paymentMethods.map((method, index) => (
                  <tr key={index}>
                    <td>{method.payment_method}</td>
                    <td>{formatNumber(method.total_orders)}</td>
                    <td>{formatCurrency(method.total_revenue)}</td>
                    <td>{formatCurrency(method.avg_order_value)}</td>
                    <td>{formatNumber(method.paid_orders)}</td>
                    <td>{formatNumber(method.failed_orders)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 푸터 */}
          <div className="page-break">
            <div className="text-center text-gray-600 mt-8">
              <p>본 보고서는 Convi 본사 관리 시스템에서 자동 생성되었습니다.</p>
              <p>문의사항: 본사 관리팀</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintAnalytics;
