import React, { useEffect } from 'react';
import { useCartStore } from '../../stores/cartStore';

const ReorderHistory: React.FC = () => {
  const { reorderHistory, getReorderHistory, cleanupReorderHistory } = useCartStore();
  const history = getReorderHistory().filter(item => item.orderNumber !== 'unknown'); // unknown 항목 제외
  
  // 컴포넌트 마운트 시 자동으로 invalid 데이터 정리
  useEffect(() => {
    const invalidItems = reorderHistory.filter(item => item.orderNumber === 'unknown');
    if (invalidItems.length > 0) {
      console.log(`🧹 ${invalidItems.length}개의 잘못된 재주문 히스토리 정리`);
      cleanupReorderHistory();
    }
  }, [reorderHistory, cleanupReorderHistory]);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        최근 재주문 내역
      </h2>
      
      <div className="space-y-3">
        {history.slice(-3).reverse().map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                주문번호: {item.orderNumber}
              </div>
              <div className="text-sm text-gray-600">
                {item.itemCount}개 상품 • {new Date(item.reorderDate).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-green-600">
                {item.totalAmount.toLocaleString()}원
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {history.length > 3 && (
        <div className="text-center mt-3">
          <span className="text-sm text-gray-500">
            총 {history.length}건의 재주문 내역이 있습니다
          </span>
        </div>
      )}
    </div>
  );
};

export default ReorderHistory;
