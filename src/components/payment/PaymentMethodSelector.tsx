import React, { useState } from 'react';

export type PaymentMethod = 'card' | 'cash' | 'mobile' | 'toss' | 'naver' | 'payco';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  amount: number;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  amount
}) => {
  const paymentMethods = [
    {
      id: 'card' as PaymentMethod,
      name: '신용/체크카드',
      icon: '💳',
      description: '모든 카드사 지원',
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      selectedColor: 'bg-blue-100 border-blue-400'
    },
    {
      id: 'toss' as PaymentMethod,
      name: '토스페이',
      icon: '🏦',
      description: '간편하고 안전한 결제',
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      selectedColor: 'bg-blue-100 border-blue-400'
    },
    
    {
      id: 'naver' as PaymentMethod,
      name: '네이버페이',
      icon: '🟢',
      description: '네이버 간편결제',
      color: 'bg-green-50 border-green-200 text-green-800',
      selectedColor: 'bg-green-100 border-green-400'
    },
    {
      id: 'payco' as PaymentMethod,
      name: 'PAYCO',
      icon: '🔴',
      description: 'NHN 간편결제',
      color: 'bg-red-50 border-red-200 text-red-800',
      selectedColor: 'bg-red-100 border-red-400'
    },
    {
      id: 'mobile' as PaymentMethod,
      name: '휴대폰 결제',
      icon: '📱',
      description: '휴대폰 소액결제',
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      selectedColor: 'bg-purple-100 border-purple-400'
    },
    {
      id: 'cash' as PaymentMethod,
      name: '현금 결제',
      icon: '💵',
      description: '매장에서 현금 결제',
      color: 'bg-gray-50 border-gray-200 text-gray-800',
      selectedColor: 'bg-gray-100 border-gray-400'
    }
  ];

  return (
    <div className="payment-method-selector">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">결제 방법 선택</h3>
        <p className="text-sm text-gray-600">
          결제 금액: <span className="font-semibold text-primary-color">₩{amount.toLocaleString()}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`payment-method-card cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              selectedMethod === method.id 
                ? method.selectedColor 
                : `${method.color} hover:border-gray-300`
            }`}
            onClick={() => onMethodChange(method.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => onMethodChange(method.id)}
                  className="w-4 h-4 text-primary-color bg-gray-100 border-gray-300 focus:ring-primary-color focus:ring-2"
                />
              </div>
            </div>

            {/* 선택된 방법에 대한 추가 정보 */}
            {selectedMethod === method.id && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">결제 예정 금액</span>
                  <span className="font-semibold text-gray-900">₩{amount.toLocaleString()}</span>
                </div>
                {method.id === 'card' && (
                  <p className="text-xs text-gray-500 mt-1">
                    * 모든 국내 카드사 및 해외카드 사용 가능
                  </p>
                )}
                {(method.id === 'toss' || method.id === 'naver' || method.id === 'payco') && (
                  <p className="text-xs text-gray-500 mt-1">
                    * 해당 앱이 설치되어 있거나 웹에서 로그인이 필요합니다
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 결제 보안 안내 */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-green-500">🔒</span>
          <div>
            <p className="text-sm font-medium text-gray-900">안전한 결제</p>
            <p className="text-xs text-gray-600">
              모든 결제는 SSL로 암호화되어 안전하게 처리됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;