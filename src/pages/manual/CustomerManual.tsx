import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveDemo from './components/InteractiveDemo';

// 모의 UI 컴포넌트들
const MockLoginForm = () => (
  <div className="bg-white rounded-lg p-6 border border-gray-200 max-w-md mx-auto">
    <h3 className="text-lg font-bold mb-4">회원가입</h3>
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
        <input 
          type="email" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md" 
          placeholder="example@email.com"
          value=""
          readOnly
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
        <input 
          type="password" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md" 
          placeholder="••••••••"
          value=""
          readOnly
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
        <input 
          type="text" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md" 
          placeholder="홍길동"
          value=""
          readOnly
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
        <input 
          type="tel" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md" 
          placeholder="010-1234-5678"
          value=""
          readOnly
        />
      </div>
      <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors">
        회원가입
      </button>
    </div>
  </div>
);

const MockStoreList = () => (
  <div className="space-y-4">
    {[
      { name: '편의점24 강남점', distance: '0.2km', status: '영업중' },
      { name: '편의점24 역삼점', distance: '0.5km', status: '영업중' },
      { name: '편의점24 삼성점', distance: '0.8km', status: '준비중' }
    ].map((store, index) => (
      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-gray-900">{store.name}</h4>
            <p className="text-sm text-gray-600">{store.distance}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs ${
            store.status === '영업중' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}>
            {store.status}
          </span>
        </div>
      </div>
    ))}
  </div>
);

const MockProductGrid = () => (
  <div className="grid grid-cols-2 gap-4">
    {[
      { name: '콜라 500ml', price: '1,500원', image: '🥤' },
      { name: '삼각김밥', price: '1,200원', image: '🍙' },
      { name: '바나나우유', price: '1,800원', image: '🥛' },
      { name: '컵라면', price: '1,000원', image: '🍜' }
    ].map((product, index) => (
      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
        <div className="text-center">
          <div className="text-3xl mb-2">{product.image}</div>
          <h5 className="font-medium text-sm text-gray-900">{product.name}</h5>
          <p className="text-blue-600 font-bold">{product.price}</p>
        </div>
        <button className="w-full mt-2 bg-blue-500 text-white py-1 text-xs rounded hover:bg-blue-600 transition-colors">
          장바구니 담기
        </button>
      </div>
    ))}
  </div>
);

const MockCart = () => {
  const [items, setItems] = useState([
    { id: 1, name: '콜라 500ml', price: 1500, quantity: 2 },
    { id: 2, name: '삼각김밥', price: 1200, quantity: 1 }
  ]);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="font-bold mb-4">장바구니</h4>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-gray-600">{item.price.toLocaleString()}원 × {item.quantity}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setItems(items.map(i => i.id === item.id ? {...i, quantity: Math.max(1, i.quantity - 1)} : i))}
                className="w-6 h-6 bg-gray-200 rounded text-xs"
              >
                -
              </button>
              <span className="text-sm">{item.quantity}</span>
              <button 
                onClick={() => setItems(items.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i))}
                className="w-6 h-6 bg-gray-200 rounded text-xs"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t pt-3 mt-3">
        <div className="flex justify-between font-bold">
          <span>총 합계</span>
          <span>{total.toLocaleString()}원</span>
        </div>
        <button className="w-full mt-3 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors">
          주문하기
        </button>
      </div>
    </div>
  );
};

const MockPayment = () => (
  <div className="bg-white rounded-lg p-6 border border-gray-200">
    <h4 className="font-bold mb-4">결제 방법 선택</h4>
    <div className="space-y-3">
      <label className="flex items-center p-3 border border-gray-200 rounded cursor-pointer hover:border-blue-300">
        <input type="radio" name="payment" className="mr-3" defaultChecked />
        <div>
          <p className="font-medium">토스페이먼츠</p>
          <p className="text-sm text-gray-600">카드, 계좌이체, 간편결제</p>
        </div>
      </label>
      <label className="flex items-center p-3 border border-gray-200 rounded cursor-pointer hover:border-blue-300">
        <input type="radio" name="payment" className="mr-3" />
        <div>
          <p className="font-medium">현장 결제</p>
          <p className="text-sm text-gray-600">픽업 시 카드/현금 결제</p>
        </div>
      </label>
    </div>
    <div className="mt-4 p-3 bg-blue-50 rounded">
      <h5 className="font-medium text-blue-900 mb-2">포인트 사용</h5>
      <div className="flex items-center space-x-2">
        <input type="number" placeholder="0" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />
        <span className="text-sm text-gray-600">P (보유: 1,250P)</span>
        <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded">전액 사용</button>
      </div>
    </div>
    <div className="border-t pt-4 mt-4">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>상품 금액</span>
          <span>4,200원</span>
        </div>
        <div className="flex justify-between">
          <span>포인트 할인</span>
          <span className="text-red-600">-0원</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>최종 결제 금액</span>
          <span>4,200원</span>
        </div>
      </div>
      <button className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium">
        4,200원 결제하기
      </button>
    </div>
  </div>
);

const MockOrderStatus = () => (
  <div className="bg-white rounded-lg p-4 border border-gray-200">
    <h4 className="font-bold mb-4">주문 상태</h4>
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium">주문 #240814001</p>
            <p className="text-sm text-gray-600">편의점24 강남점</p>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">준비 완료</span>
        </div>
        <div className="flex space-x-8 mt-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
            <span className="text-xs mt-1">주문 접수</span>
          </div>
          <div className="flex-1 border-t-2 border-green-500 mt-4"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
            <span className="text-xs mt-1">준비 중</span>
          </div>
          <div className="flex-1 border-t-2 border-green-500 mt-4"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
            <span className="text-xs mt-1">준비 완료</span>
          </div>
          <div className="flex-1 border-t-2 border-gray-300 mt-4"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs">◯</div>
            <span className="text-xs mt-1">픽업 완료</span>
          </div>
        </div>
        <p className="text-sm text-blue-600 mt-3">📍 픽업 가능합니다! 매장에서 주문번호를 말씀해 주세요.</p>
      </div>
    </div>
  </div>
);

const MockRefund = () => (
  <div className="bg-white rounded-lg p-4 border border-gray-200">
    <h4 className="font-bold mb-4">환불 신청</h4>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">환불 사유</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option>단순 변심</option>
          <option>상품 불량</option>
          <option>주문 실수</option>
          <option>기타</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">상세 내용</label>
        <textarea 
          className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
          placeholder="환불 사유를 자세히 입력해주세요."
        ></textarea>
      </div>
      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
        <h5 className="font-medium text-yellow-800 mb-1">환불 안내</h5>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 결제 수단으로 환불됩니다 (카드: 즉시, 계좌: 1-2일)</li>
          <li>• 포인트로 결제한 부분은 포인트로 복원됩니다</li>
          <li>• 환불 처리까지 영업일 기준 1-3일 소요됩니다</li>
        </ul>
      </div>
      <div className="flex space-x-3">
        <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition-colors">
          취소
        </button>
        <button className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors">
          환불 신청
        </button>
      </div>
    </div>
  </div>
);

const CustomerManual: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      id: 'registration',
      title: '회원가입 및 로그인',
      description: '편의점 시스템을 이용하기 위해 먼저 회원가입을 진행해주세요. 이메일, 비밀번호, 기본 정보를 입력하면 됩니다.',
      component: <MockLoginForm />,
      tips: [
        '이메일은 로그인 아이디로 사용되니 정확히 입력해주세요',
        '비밀번호는 8자 이상, 영문+숫자 조합을 권장합니다',
        '전화번호는 주문 알림을 위해 정확히 입력해주세요',
        '회원가입 즉시 1,000포인트가 지급됩니다'
      ]
    },
    {
      id: 'store-selection',
      title: '지점 선택하기',
      description: 'GPS를 기반으로 주변 편의점을 찾아보세요. 거리순으로 정렬되며, 각 지점의 영업 상태를 확인할 수 있습니다.',
      component: <MockStoreList />,
      tips: [
        '위치 권한을 허용하면 더 정확한 거리 정보를 제공합니다',
        '영업 중인 지점만 주문이 가능합니다',
        '지점을 터치하면 상세 정보와 상품 목록을 볼 수 있습니다',
        '즐겨찾기 지점으로 등록하면 빠른 접근이 가능합니다'
      ]
    },
    {
      id: 'product-browsing',
      title: '상품 둘러보기',
      description: '선택한 지점의 상품들을 카테고리별로 둘러보세요. 실시간 재고 상태와 가격을 확인할 수 있습니다.',
      component: <MockProductGrid />,
      tips: [
        '품절 상품은 회색으로 표시됩니다',
        '상품을 터치하면 상세 정보를 볼 수 있습니다',
        '카테고리 필터를 사용해 원하는 상품을 빠르게 찾으세요',
        '검색 기능으로 특정 상품을 직접 찾을 수 있습니다'
      ]
    },
    {
      id: 'cart-management',
      title: '장바구니 관리',
      description: '원하는 상품을 장바구니에 담고 수량을 조절해보세요. 실시간으로 총 금액이 계산됩니다.',
      component: <MockCart />,
      tips: [
        '수량은 +/- 버튼으로 쉽게 조절할 수 있습니다',
        '장바구니는 30분간 유지됩니다',
        '재고가 부족한 경우 알림이 표시됩니다',
        '최소 주문 금액은 1,000원입니다'
      ]
    },
    {
      id: 'ordering-payment',
      title: '주문 및 결제',
      description: '픽업 시간을 선택하고 결제 방법을 선택해주세요. 포인트 사용도 가능합니다.',
      component: <MockPayment />,
      tips: [
        '토스페이먼츠는 다양한 결제 수단을 지원합니다',
        '현장 결제는 픽업 시 카드나 현금으로 결제 가능합니다',
        '포인트는 1포인트 = 1원으로 사용할 수 있습니다',
        '결제 완료 후 주문번호를 기억해두세요'
      ]
    },
    {
      id: 'order-tracking',
      title: '주문 추적하기',
      description: '주문 후 실시간으로 준비 상태를 확인할 수 있습니다. 픽업 준비가 완료되면 알림을 받게 됩니다.',
      component: <MockOrderStatus />,
      tips: [
        '주문 상태는 실시간으로 업데이트됩니다',
        '준비 완료 시 SMS나 앱 푸시 알림을 받습니다',
        '주문번호는 픽업 시 필요하니 기억해두세요',
        '준비 시간은 보통 5-15분 정도 소요됩니다'
      ]
    },
    {
      id: 'refund-return',
      title: '환불 및 반품',
      description: '주문 취소나 환불이 필요한 경우 간편하게 신청할 수 있습니다. 결제 수단별로 환불 방법이 다릅니다.',
      component: <MockRefund />,
      tips: [
        '주문 접수 후 5분 이내는 무료 취소 가능합니다',
        '카드 결제는 즉시 취소, 계좌이체는 1-2일 소요됩니다',
        '포인트 결제 부분은 포인트로 즉시 복원됩니다',
        '상품 불량 시 사진 첨부하면 빠른 처리가 가능합니다'
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/manual')}
                className="text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                ← 메뉴얼 홈
              </button>
              <h1 className="text-2xl font-bold text-gray-900">👥 고객 사용자 매뉴얼</h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="text-sm">← 홈으로 돌아가기</span>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <motion.div
        className="container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 인트로 섹션 */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <span className="text-3xl">👥</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            고객을 위한 완벽한 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}사용 가이드
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            회원가입부터 주문, 결제, 환불까지 모든 과정을 
            <br />
            실제 화면으로 체험하며 배워보세요!
          </p>
        </motion.div>

        {/* 주요 기능 개요 */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">🎯 주요 기능 한눈에 보기</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl mb-3">🔐</div>
                <h4 className="font-semibold text-gray-900 mb-2">회원 관리</h4>
                <p className="text-sm text-gray-600">회원가입, 로그인, 프로필 관리</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl mb-3">🛒</div>
                <h4 className="font-semibold text-gray-900 mb-2">주문 시스템</h4>
                <p className="text-sm text-gray-600">상품 선택, 장바구니, 주문, 결제</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl mb-3">📱</div>
                <h4 className="font-semibold text-gray-900 mb-2">고객 서비스</h4>
                <p className="text-sm text-gray-600">주문 추적, 환불, 포인트 관리</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 인터랙티브 데모 */}
        <motion.div variants={itemVariants}>
          <InteractiveDemo
            title="고객 서비스 완전 정복하기"
            steps={steps}
            onComplete={() => {
              console.log('고객 매뉴얼 완료!');
            }}
          />
        </motion.div>

        {/* 추가 정보 섹션 */}
        <motion.div variants={itemVariants} className="mt-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 자주 묻는 질문 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">❓</span>
                자주 묻는 질문
              </h3>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h4 className="font-medium text-gray-900 mb-1">Q. 최소 주문 금액이 있나요?</h4>
                  <p className="text-sm text-gray-600">A. 최소 주문 금액은 1,000원입니다.</p>
                </div>
                <div className="border-b border-gray-100 pb-3">
                  <h4 className="font-medium text-gray-900 mb-1">Q. 포인트는 어떻게 적립되나요?</h4>
                  <p className="text-sm text-gray-600">A. 결제 금액의 1%가 자동으로 적립됩니다.</p>
                </div>
                <div className="border-b border-gray-100 pb-3">
                  <h4 className="font-medium text-gray-900 mb-1">Q. 주문 취소는 언제까지 가능한가요?</h4>
                  <p className="text-sm text-gray-600">A. 주문 접수 후 5분 이내에만 무료 취소가 가능합니다.</p>
                </div>
              </div>
            </div>

            {/* 고객센터 정보 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📞</span>
                고객센터 안내
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600">📞</span>
                  <div>
                    <p className="font-medium text-gray-900">전화 문의</p>
                    <p className="text-sm text-gray-600">1588-1234 (평일 9시-18시)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600">💬</span>
                  <div>
                    <p className="font-medium text-gray-900">채팅 상담</p>
                    <p className="text-sm text-gray-600">앱 내 실시간 채팅 (24시간)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <span className="text-purple-600">📧</span>
                  <div>
                    <p className="font-medium text-gray-900">이메일 문의</p>
                    <p className="text-sm text-gray-600">support@convenience24.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 다음 매뉴얼 안내 */}
        <motion.div variants={itemVariants} className="mt-12 text-center">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">🏪 점주 매뉴얼도 확인해보세요!</h3>
            <p className="mb-6">편의점 운영에 관심이 있으시다면 점주 사용법도 미리 알아보세요.</p>
            <button
              onClick={() => navigate('/manual/store')}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              점주 매뉴얼 보기 →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CustomerManual;