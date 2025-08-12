import React, { useRef } from 'react';
import Receipt from './Receipt';
import type { Order } from '../../stores/orderStore';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  storeName,
  storeAddress,
  storePhone
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!receiptRef.current) {
      alert('영수증을 불러올 수 없습니다.');
      return;
    }

    // 새 창을 열어서 인쇄
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('팝업이 차단되었습니다. 팝업을 허용하고 다시 시도해주세요.');
      return;
    }

    // 영수증 HTML 내용 가져오기
    const receiptContent = receiptRef.current.innerHTML;
    
    // 인쇄용 HTML 문서 작성
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>영수증 - ${order?.orderNumber || 'receipt'}</title>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 14px;
              line-height: 1.4;
              color: #000;
              background: #fff;
              padding: 10mm;
              margin: 0;
            }
            @page {
              size: 80mm auto;
              margin: 5mm;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `);

    printWindow.document.close();

    // 이미지 로딩 완료 후 인쇄
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        console.log('영수증 인쇄 완료');
      }, 500);
    };
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            영수증 - {order.orderNumber}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              인쇄
            </button>
            <button
              onClick={onClose}
              className="flex items-center px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              닫기
            </button>
          </div>
        </div>

        {/* 영수증 내용 */}
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="receipt-container">
            <Receipt
              ref={receiptRef}
              order={order}
              storeName={storeName}
              storeAddress={storeAddress}
              storePhone={storePhone}
            />
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              <span className="font-medium">팁:</span> Ctrl+P 또는 Cmd+P로도 인쇄할 수 있습니다.
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // 영수증 내용을 클립보드에 복사
                  const receiptText = receiptRef.current?.innerText || '';
                  navigator.clipboard.writeText(receiptText).then(() => {
                    alert('영수증 내용이 클립보드에 복사되었습니다.');
                  });
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                텍스트 복사
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;