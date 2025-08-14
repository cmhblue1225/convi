import React, { forwardRef } from 'react';

interface RefundReceiptProps {
  refund: any;
  order: any;
  storeInfo: any;
}

const RefundReceipt = forwardRef<HTMLDivElement, RefundReceiptProps>(({
  refund,
  order,
  storeInfo
}, ref) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return amount?.toLocaleString() || '0';
  };

  return (
    <div ref={ref} className="bg-white p-6 max-w-md mx-auto font-mono text-sm leading-relaxed print:shadow-none print:border print:border-gray-300">
      {/* 환불 영수증 헤더 */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
        <h1 className="text-xl font-bold text-gray-800 mb-2">환불 영수증</h1>
        <p className="text-gray-600 text-sm">REFUND RECEIPT</p>
      </div>

      {/* 매장 정보 */}
      <div className="mb-4">
        <div className="font-bold text-gray-800">{storeInfo?.name || '매장명'}</div>
        <div className="text-gray-600 text-xs">{storeInfo?.address || '매장 주소'}</div>
        <div className="text-gray-600 text-xs">전화: {storeInfo?.phone || '전화번호'}</div>
      </div>

      {/* 환불 정보 */}
      <div className="border-b border-gray-300 pb-3 mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">환불 번호:</span>
          <span className="font-bold">{refund?.id?.slice(0, 8) || 'N/A'}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">원주문 번호:</span>
          <span className="font-bold">{order?.orderNumber || 'N/A'}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">환불 요청일:</span>
          <span className="font-bold">{formatDate(refund?.created_at)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">처리 완료일:</span>
          <span className="font-bold">{formatDate(refund?.processed_at)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">환불 사유:</span>
          <span className="font-bold">{refund?.reason || 'N/A'}</span>
        </div>
      </div>

      {/* 환불 금액 정보 */}
      <div className="border-b border-gray-300 pb-3 mb-3">
        <div className="text-center mb-2">
          <span className="text-lg font-bold text-red-600">환불 금액</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">원주문 금액:</span>
          <span className="font-bold">{formatCurrency(order?.totalAmount)}원</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">환불 요청 금액:</span>
          <span className="font-bold text-red-600">{formatCurrency(refund?.requested_refund_amount)}원</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">처리 상태:</span>
          <span className={`font-bold ${
            refund?.status === 'approved' ? 'text-green-600' : 
            refund?.status === 'rejected' ? 'text-red-600' : 'text-blue-600'
          }`}>
            {refund?.status === 'approved' ? '승인됨' : 
             refund?.status === 'rejected' ? '거절됨' : '검토중'}
          </span>
        </div>
      </div>

      {/* 처리 정보 */}
      {refund?.admin_notes && (
        <div className="border-b border-gray-300 pb-3 mb-3">
          <div className="text-gray-600 mb-1">처리 사유:</div>
          <div className="text-sm font-bold">{refund.admin_notes}</div>
        </div>
      )}

      {/* 환불된 상품 목록 */}
      <div className="mb-4">
        <div className="text-gray-600 mb-2">환불된 상품:</div>
        {order?.items?.map((item: any, index: number) => (
          <div key={index} className="flex justify-between text-sm mb-1">
            <span>{item.product_name} x{item.quantity}</span>
            <span>{formatCurrency(item.price * item.quantity)}원</span>
          </div>
        ))}
      </div>

      {/* 하단 정보 */}
      <div className="text-center text-xs text-gray-500 mt-6">
        <div>환불 처리가 완료되었습니다.</div>
        <div>문의사항이 있으시면 매장에 연락해주세요.</div>
        <div className="mt-2">발행일시: {formatDate(new Date().toISOString())}</div>
      </div>

    </div>
  );
});

RefundReceipt.displayName = 'RefundReceipt';

export default RefundReceipt;
