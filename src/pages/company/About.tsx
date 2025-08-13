import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">회사 소개</h1>
            <p className="text-lg text-gray-600">
              편리한 편의점 쇼핑 경험을 제공하는 Convi입니다
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">우리의 미션</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Convi는 고객의 편의점 쇼핑을 더욱 스마트하고 편리하게 만드는 것을 목표로 합니다. 
              디지털 기술을 활용하여 언제 어디서나 쉽게 상품을 주문하고 픽업할 수 있는 
              혁신적인 서비스를 제공합니다.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">시간 절약</h3>
                <p className="text-sm text-gray-600">미리 주문하고 바로 픽업</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">편리함</h3>
                <p className="text-sm text-gray-600">간편한 주문과 결제</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">혁신</h3>
                <p className="text-sm text-gray-600">최신 기술로 더 나은 서비스</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">회사 연혁</h2>
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0 w-24 text-blue-600 font-semibold">2024.01</div>
                <div className="text-gray-700">Convi 서비스 런칭</div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-24 text-blue-600 font-semibold">2023.12</div>
                <div className="text-gray-700">베타 서비스 시작</div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-24 text-blue-600 font-semibold">2023.06</div>
                <div className="text-gray-700">회사 설립</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">핵심 가치</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 고객 중심</h3>
                <p className="text-gray-700">
                  고객의 니즈를 최우선으로 생각하며, 지속적으로 서비스를 개선합니다.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 혁신</h3>
                <p className="text-gray-700">
                  새로운 기술과 아이디어를 통해 편의점 쇼핑의 새로운 패러다임을 만들어갑니다.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🤝 신뢰</h3>
                <p className="text-gray-700">
                  투명하고 정직한 서비스로 고객과의 신뢰 관계를 구축합니다.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🌱 성장</h3>
                <p className="text-gray-700">
                  고객과 함께 성장하며, 더 나은 미래를 만들어갑니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;