import React, { useState } from 'react';
import { Button } from '../../components/common/Button';

const CustomerSupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'guide'>('faq');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    category: '',
    message: ''
  });

  const faqData = [
    {
      id: 1,
      question: '주문은 어떻게 하나요?',
      answer: '고객 앱에서 원하는 상품을 선택하고 장바구니에 담은 후 결제를 진행하시면 됩니다. 픽업 시간을 선택하여 편리하게 주문할 수 있습니다.'
    },
    {
      id: 2,
      question: '결제 방법은 무엇이 있나요?',
      answer: '카카오페이, 토스페이먼츠를 통한 카드 결제, 실시간 계좌이체를 지원합니다. 안전하고 간편한 결제가 가능합니다.'
    },
    {
      id: 3,
      question: '주문 취소는 어떻게 하나요?',
      answer: '주문 후 점주가 승인하기 전까지 취소가 가능합니다. 고객 앱의 주문 내역에서 취소 버튼을 눌러주세요.'
    },
    {
      id: 4,
      question: '환불은 언제 처리되나요?',
      answer: '환불 요청 승인 후 3-5영업일 내에 결제 수단으로 환불됩니다. 환불 상태는 앱에서 확인하실 수 있습니다.'
    },
    {
      id: 5,
      question: '비밀번호를 잊어버렸어요',
      answer: '로그인 화면에서 "비밀번호 찾기"를 클릭하고 가입한 이메일을 입력하면 재설정 링크를 받을 수 있습니다.'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.');
    setContactForm({ name: '', email: '', category: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">고객센터</h1>
            <p className="mt-2 text-gray-600">편의점 솔루션 이용에 도움이 되는 정보를 제공합니다</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'faq'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              자주 묻는 질문
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contact'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              문의하기
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'guide'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              이용가이드
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">자주 묻는 질문</h2>
            <div className="space-y-4">
              {faqData.map((faq) => (
                <div key={faq.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <details className="group">
                    <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                      <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                      <svg 
                        className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">문의하기</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      이름 *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={contactForm.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      이메일 *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={contactForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    문의 유형 *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={contactForm.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">선택해주세요</option>
                    <option value="account">계정 관련</option>
                    <option value="order">주문/결제 관련</option>
                    <option value="technical">기술적 문제</option>
                    <option value="suggestion">제안/개선사항</option>
                    <option value="other">기타</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    문의 내용 *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={contactForm.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="문의하실 내용을 자세히 작성해주세요"
                  />
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  문의 접수
                </Button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">이용가이드</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Customer Guide */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">고객 이용가이드</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 회원가입 및 로그인</li>
                  <li>• 상품 검색 및 주문</li>
                  <li>• 결제 및 픽업</li>
                  <li>• 주문 내역 확인</li>
                  <li>• 환불 및 취소</li>
                </ul>
              </div>

              {/* Store Owner Guide */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">점주 이용가이드</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 매장 등록 및 설정</li>
                  <li>• 상품 관리</li>
                  <li>• 주문 접수 및 처리</li>
                  <li>• 재고 관리</li>
                  <li>• 매출 분석</li>
                </ul>
              </div>

              {/* HQ Guide */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">본사 이용가이드</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 시스템 관리</li>
                  <li>• 지점 관리</li>
                  <li>• 통합 분석</li>
                  <li>• 물류 관리</li>
                  <li>• 정책 설정</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-800 mb-1">추가 도움이 필요하신가요?</h3>
                  <p className="text-sm text-blue-700">
                    더 자세한 가이드나 기술 지원이 필요하시면 "문의하기" 탭을 통해 연락해주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSupport;