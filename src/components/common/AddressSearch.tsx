import React, { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';

interface AddressData {
  address: string;           // 기본 주소 (도로명주소 또는 지번주소)
  zonecode: string;         // 우편번호
  addressType: string;      // 도로명(R) / 지번(J) 구분
  buildingName?: string;    // 건물명
  detailAddress?: string;   // 상세 주소 (사용자 입력)
}

interface AddressSearchProps {
  onAddressSelect: (addressData: AddressData) => void;
  selectedAddress?: AddressData | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}

const AddressSearch: React.FC<AddressSearchProps> = ({
  onAddressSelect,
  selectedAddress,
  placeholder = "주소를 검색하세요",
  disabled = false,
  className = "",
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [detailAddress, setDetailAddress] = useState(selectedAddress?.detailAddress || '');

  const handleComplete = (data: any) => {
    console.log('🔍 주소 검색 결과:', data);
    
    const addressData: AddressData = {
      address: data.roadAddress || data.jibunAddress, // 도로명주소 우선, 없으면 지번주소
      zonecode: data.zonecode,
      addressType: data.roadAddress ? 'R' : 'J', // 도로명(R) 또는 지번(J)
      buildingName: data.buildingName || '',
      detailAddress: detailAddress // 기존 상세주소 유지
    };

    onAddressSelect(addressData);
    setIsOpen(false);
  };

  const handleDetailAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDetailAddress = e.target.value;
    setDetailAddress(newDetailAddress);
    
    if (selectedAddress) {
      onAddressSelect({
        ...selectedAddress,
        detailAddress: newDetailAddress
      });
    }
  };

  const openPostcode = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const closePostcode = () => {
    setIsOpen(false);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 주소 검색 버튼 */}
      <div className="flex gap-3">
        <div className="flex-1">
          <button
            type="button"
            onClick={openPostcode}
            disabled={disabled}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-left ${
              disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 cursor-pointer'
            } ${error ? 'border-red-300' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className={selectedAddress ? 'text-gray-900' : 'text-gray-500'}>
                {selectedAddress 
                  ? `[${selectedAddress.zonecode}] ${selectedAddress.address}` 
                  : placeholder
                }
              </span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* 상세주소 입력 (주소가 선택된 경우만 표시) */}
      {selectedAddress && (
        <div className="animate-slide-down">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🏠 상세주소 (선택사항)
          </label>
          <input
            type="text"
            value={detailAddress}
            onChange={handleDetailAddressChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
            placeholder="동, 호수 등 상세주소를 입력하세요"
            disabled={disabled}
          />
        </div>
      )}

      {/* 선택된 주소 미리보기 */}
      {selectedAddress && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 animate-slide-down">
          <div className="flex items-start space-x-2">
            <div className="text-blue-500 mt-0.5">
              📍
            </div>
            <div className="flex-1 text-sm">
              <div className="font-semibold text-blue-900">
                선택된 주소
              </div>
              <div className="text-blue-700 mt-1">
                <div>[{selectedAddress.zonecode}] {selectedAddress.address}</div>
                {selectedAddress.buildingName && (
                  <div className="text-blue-600 text-xs mt-1">
                    건물명: {selectedAddress.buildingName}
                  </div>
                )}
                {detailAddress && (
                  <div className="text-blue-600 text-xs mt-1">
                    상세주소: {detailAddress}
                  </div>
                )}
                <div className="text-blue-600 text-xs mt-1">
                  {selectedAddress.addressType === 'R' ? '도로명주소' : '지번주소'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAddressSelect({} as AddressData)}
              className="text-blue-400 hover:text-blue-600 transition-colors"
              title="주소 선택 취소"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <p className="text-sm text-red-500 animate-pulse flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* 다음 우편번호 검색 모달 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-scale-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                📍 주소 검색
              </h3>
              <button
                onClick={closePostcode}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-0">
              <DaumPostcode
                onComplete={handleComplete}
                onClose={closePostcode}
                style={{
                  width: '100%',
                  height: '500px',
                }}
                animation={true}
                theme={{
                  bgColor: "#ffffff",
                  searchBgColor: "#f8f9fa",
                  contentBgColor: "#ffffff",
                  pageBgColor: "#f8f9fa",
                  textColor: "#212529",
                  queryTextColor: "#495057",
                  postcodeTextColor: "#0066cc",
                  emphTextColor: "#dc3545",
                  outlineColor: "#dee2e6"
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSearch;