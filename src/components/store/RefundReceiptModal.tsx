import React, { useRef } from 'react';
import RefundReceipt from './RefundReceipt';

interface RefundReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  refund: any;
  order: any;
  storeInfo: any;
}

const RefundReceiptModal: React.FC<RefundReceiptModalProps> = ({
  isOpen,
  onClose,
  refund,
  order,
  storeInfo
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (!receiptRef.current) {
      alert('영수증을 불러올 수 없습니다.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
      return;
    }

    // 영수증 HTML 내용 가져오기
    const receiptContent = receiptRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>환불 영수증 - ${order?.orderNumber || 'receipt'}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 0; 
              padding: 20px; 
              background: white; 
            }
            .refund-receipt { 
              max-width: 400px; 
              margin: 0 auto; 
              border: 1px solid #ccc; 
              padding: 20px; 
            }
            @media print {
              body { margin: 0; }
              .refund-receipt { border: none; }
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // 인쇄 다이얼로그 열기
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    
    console.log('환불 영수증 인쇄 완료');
  };

  const handleDownload = () => {
    if (!receiptRef.current) {
      alert('영수증을 불러올 수 없습니다.');
      return;
    }

    // 영수증 내용을 HTML 파일로 다운로드
    const receiptContent = receiptRef.current.innerHTML;
    const blob = new Blob([`
      <!DOCTYPE html>
      <html>
        <head>
          <title>환불 영수증 - ${order?.orderNumber || 'receipt'}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 0; 
              padding: 20px; 
              background: white; 
            }
            .refund-receipt { 
              max-width: 400px; 
              margin: 0 auto; 
              border: 1px solid #ccc; 
              padding: 20px; 
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `], { type: 'text/html' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `환불영수증_${order?.orderNumber || 'receipt'}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('환불 영수증 다운로드 완료');
  };

  const handleCopy = () => {
    if (!receiptRef.current) {
      alert('영수증을 불러올 수 없습니다.');
      return;
    }

    // 영수증 내용을 클립보드에 복사
    const receiptText = receiptRef.current?.innerText || '';
    navigator.clipboard.writeText(receiptText).then(() => {
      alert('환불 영수증 내용이 클립보드에 복사되었습니다.');
    }).catch(() => {
      alert('클립보드 복사에 실패했습니다.');
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">환불 영수증</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 영수증 내용 */}
          <div className="mb-6">
            <div className="receipt-container">
              <RefundReceipt
                ref={receiptRef}
                refund={refund}
                order={order}
                storeInfo={storeInfo}
              />
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex justify-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              🖨️ 인쇄
            </button>
            
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              💾 다운로드
            </button>
            
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              📋 복사
            </button>
            
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundReceiptModal;
