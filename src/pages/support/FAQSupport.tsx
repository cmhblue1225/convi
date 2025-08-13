import React, { useState } from 'react';

const FAQSupport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqData = [
    {
      id: 1,
      category: 'account',
      question: '회원가입은 어떻게 하나요?',
      answer: '앱을 다운로드 후 "회원가입" 버튼을 눌러 이메일과 비밀번호를 입력하시면 됩니다. 이메일 인증을 완료하면 바로 서비스를 이용하실 수 있습니다.'
    },
    {
      id: 2,
      category: 'account',
      question: '비밀번호를 잊어버렸어요',
      answer: '로그인 화면에서 "비밀번호 찾기"를 클릭하고 가입한 이메일을 입력하면 재설정 링크를 받을 수 있습니다.'
    },
    {
      id: 3,
      category: 'order',
      question: '주문은 어떻게 하나요?',
      answer: '고객 앱에서 원하는 상품을 선택하고 장바구니에 담은 후 결제를 진행하시면 됩니다. 픽업 시간을 선택하여 편리하게 주문할 수 있습니다.'
    },
    {
      id: 4,
      category: 'order',
      question: '주문 취소는 어떻게 하나요?',
      answer: '주문 후 점주가 승인하기 전까지 취소가 가능합니다. 고객 앱의 주문 내역에서 취소 버튼을 눌러주세요.'
    },
    {
      id: 5,
      category: 'payment',
      question: '결제 방법은 무엇이 있나요?',
      answer: '카카오페이, 토스페이먼츠를 통한 카드 결제, 실시간 계좌이체를 지원합니다. 안전하고 간편한 결제가 가능합니다.'
    },
    {
      id: 6,
      category: 'payment',
      question: '환불은 언제 처리되나요?',
      answer: '환불 요청 승인 후 3-5영업일 내에 결제 수단으로 환불됩니다. 환불 상태는 앱에서 확인하실 수 있습니다.'
    },
    {
      id: 7,
      category: 'store',
      question: '매장은 어떻게 등록하나요?',
      answer: '점주용 앱에서 "매장 등록"을 선택하고 사업자등록증, 매장 정보를 입력하시면 됩니다. 승인까지 1-2일 소요됩니다.'
    },
    {
      id: 8,
      category: 'store',
      question: '상품 등록은 어떻게 하나요?',
      answer: '점주 대시보드에서 "상품 관리" 메뉴를 통해 상품명, 가격, 사진, 재고를 등록할 수 있습니다.'
    },
    {
      id: 9,
      category: 'technical',
      question: '앱이 자꾸 종료돼요',
      answer: '앱 업데이트를 확인하고, 스마트폰을 재시작해보세요. 문제가 계속되면 고객센터로 연락해주세요.'
    },
    {
      id: 10,
      category: 'technical',
      question: '알림이 오지 않아요',
      answer: '스마트폰 설정에서 앱 알림 권한을 허용해주세요. 설정 > 알림 > ConVi에서 확인할 수 있습니다.'
    }
  ];

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'account', name: '계정 관련' },
    { id: 'order', name: '주문/픽업' },
    { id: 'payment', name: '결제/환불' },
    { id: 'store', name: '매장 관리' },
    { id: 'technical', name: '기술 지원' }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">자주 묻는 질문</h1>
            <p className="mt-2 text-gray-600">편의점 솔루션 이용 시 자주 묻는 질문들을 모았습니다</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="질문을 검색해보세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <svg 
              className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <details className="group">
                  <summary className="flex justify-between items-center p-6 cursor-pointer list-none hover:bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 pr-4">{faq.question}</h3>
                    <svg 
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed pt-4">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.239 0-4.236-.843-5.657-2.229A7.963 7.963 0 014 9c0-4.418 3.582-8 8-8s8 3.582 8 8a7.963 7.963 0 01-2.343 5.657L20 18l-2.343-2.343z" />
              </svg>
              <p className="text-gray-500 text-lg">검색 결과가 없습니다</p>
              <p className="text-gray-400 text-sm mt-1">다른 검색어를 시도해보세요</p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-1">원하는 답변을 찾지 못하셨나요?</h3>
              <p className="text-sm text-blue-700">
                추가적인 문의사항이 있으시면 고객센터를 통해 직접 문의해주세요. 전문 상담원이 도움을 드리겠습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSupport;