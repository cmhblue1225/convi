import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveDemo from './components/InteractiveDemo';

// 모의 UI 컴포넌트들
const MockStoreDashboard = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-blue-500 text-white p-4 rounded-lg">
        <h4 className="font-bold text-lg">12</h4>
        <p className="text-sm opacity-90">신규 주문</p>
      </div>
      <div className="bg-green-500 text-white p-4 rounded-lg">
        <h4 className="font-bold text-lg">₩127,500</h4>
        <p className="text-sm opacity-90">오늘 매출</p>
      </div>
      <div className="bg-orange-500 text-white p-4 rounded-lg">
        <h4 className="font-bold text-lg">8</h4>
        <p className="text-sm opacity-90">품절 상품</p>
      </div>
    </div>
    <div className="bg-white rounded-lg border p-4">
      <h4 className="font-semibold mb-3">실시간 주문 현황</h4>
      <div className="space-y-2">
        {[
          { id: '#240814001', customer: '홍길동', status: '준비중', time: '2분 전' },
          { id: '#240814002', customer: '김영희', status: '완료', time: '5분 전' },
          { id: '#240814003', customer: '이철수', status: '신규', time: '방금' }
        ].map((order, index) => (
          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-sm">{order.id}</p>
              <p className="text-xs text-gray-600">{order.customer}</p>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 text-xs rounded-full ${
                order.status === '신규' ? 'bg-blue-100 text-blue-800' :
                order.status === '준비중' ? 'bg-orange-100 text-orange-800' :
                'bg-green-100 text-green-800'
              }`}>
                {order.status}
              </span>
              <p className="text-xs text-gray-500 mt-1">{order.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MockOrderManagement = () => {
  const [orders, setOrders] = useState([
    { id: 1, orderNum: '#240814001', customer: '홍길동', items: 'cola, 삼각김밥', amount: '2,700원', status: '신규' },
    { id: 2, orderNum: '#240814002', customer: '김영희', items: '컵라면, 바나나우유', amount: '2,800원', status: '준비중' },
    { id: 3, orderNum: '#240814003', customer: '이철수', items: 'coffee, 샌드위치', amount: '3,500원', status: '준비완료' }
  ]);

  const updateStatus = (id: number, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <h4 className="font-semibold mb-4">주문 관리</h4>
      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{order.orderNum}</p>
                <p className="text-sm text-gray-600">{order.customer}</p>
                <p className="text-sm text-gray-500">{order.items}</p>
              </div>
              <p className="font-bold text-blue-600">{order.amount}</p>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className={`px-2 py-1 text-xs rounded-full ${
                order.status === '신규' ? 'bg-blue-100 text-blue-800' :
                order.status === '준비중' ? 'bg-orange-100 text-orange-800' :
                order.status === '준비완료' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
              <div className="space-x-2">
                {order.status === '신규' && (
                  <button 
                    onClick={() => updateStatus(order.id, '준비중')}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    접수
                  </button>
                )}
                {order.status === '준비중' && (
                  <button 
                    onClick={() => updateStatus(order.id, '준비완료')}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                  >
                    준비완료
                  </button>
                )}
                {order.status === '준비완료' && (
                  <button 
                    onClick={() => updateStatus(order.id, '픽업완료')}
                    className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                  >
                    픽업완료
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MockInventoryManagement = () => {
  const [products, setProducts] = useState([
    { id: 1, name: '콜라 500ml', stock: 15, minStock: 10, price: '1,500원', status: '정상' },
    { id: 2, name: '삼각김밥', stock: 3, minStock: 5, price: '1,200원', status: '부족' },
    { id: 3, name: '컵라면', stock: 0, minStock: 8, price: '1,000원', status: '품절' },
    { id: 4, name: '바나나우유', stock: 25, minStock: 12, price: '1,800원', status: '정상' }
  ]);

  const updateStock = (id: number, change: number) => {
    setProducts(products.map(product => {
      if (product.id === id) {
        const newStock = Math.max(0, product.stock + change);
        const status = newStock === 0 ? '품절' : 
                     newStock <= product.minStock ? '부족' : '정상';
        return { ...product, stock: newStock, status };
      }
      return product;
    }));
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">재고 관리</h4>
        <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
          발주 요청
        </button>
      </div>
      <div className="space-y-3">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-600">{product.price}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                product.status === '정상' ? 'bg-green-100 text-green-800' :
                product.status === '부족' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {product.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  재고: <span className="font-medium">{product.stock}개</span>
                  <span className="text-xs text-gray-500 ml-2">
                    (최소: {product.minStock}개)
                  </span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => updateStock(product.id, -1)}
                  className="w-6 h-6 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                  disabled={product.stock === 0}
                >
                  -
                </button>
                <span className="text-sm font-medium w-8 text-center">{product.stock}</span>
                <button 
                  onClick={() => updateStock(product.id, 1)}
                  className="w-6 h-6 bg-green-100 text-green-600 rounded text-xs hover:bg-green-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MockSupplyRequest = () => (
  <div className="bg-white rounded-lg border p-4">
    <h4 className="font-semibold mb-4">물류 요청</h4>
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상품 선택</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option>콜라 500ml</option>
            <option>삼각김밥</option>
            <option>컵라면</option>
            <option>바나나우유</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">요청 수량</label>
          <input 
            type="number" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" 
            placeholder="예: 50"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">긴급도</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
          <option>일반 (3-5일)</option>
          <option>긴급 (당일)</option>
          <option>예약 (7일 후)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">요청 사유</label>
        <textarea 
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20"
          placeholder="예: 품절로 인한 긴급 보충 필요"
        ></textarea>
      </div>
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <h5 className="font-medium text-blue-800 mb-1">발주 안내</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 일반 발주: 본사 승인 후 3-5일 내 배송</li>
          <li>• 긴급 발주: 당일 승인 시 다음날 배송 (추가 비용 발생)</li>
          <li>• 최소 주문 단위를 확인해주세요</li>
        </ul>
      </div>
      <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors">
        발주 요청 제출
      </button>
    </form>
  </div>
);

const MockSalesAnalysis = () => (
  <div className="space-y-4">
    <div className="bg-white rounded-lg border p-4">
      <h4 className="font-semibold mb-4">매출 분석</h4>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-blue-600 text-sm">오늘 매출</p>
          <p className="text-xl font-bold text-blue-900">₩127,500</p>
          <p className="text-xs text-blue-600">+12% vs 어제</p>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <p className="text-green-600 text-sm">이번 주 매출</p>
          <p className="text-xl font-bold text-green-900">₩856,200</p>
          <p className="text-xs text-green-600">+8% vs 지난주</p>
        </div>
      </div>
      <div className="border-t pt-4">
        <h5 className="font-medium mb-3">인기 상품 TOP 5</h5>
        <div className="space-y-2">
          {[
            { rank: 1, name: '콜라 500ml', sales: '45개', revenue: '₩67,500' },
            { rank: 2, name: '삼각김밥', sales: '32개', revenue: '₩38,400' },
            { rank: 3, name: '바나나우유', sales: '28개', revenue: '₩50,400' },
            { rank: 4, name: '컵라면', sales: '24개', revenue: '₩24,000' },
            { rank: 5, name: '아이스크림', sales: '18개', revenue: '₩36,000' }
          ].map(item => (
            <div key={item.rank} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {item.rank}
                </span>
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{item.revenue}</p>
                <p className="text-xs text-gray-600">{item.sales}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MockRefundProcessing = () => (
  <div className="bg-white rounded-lg border p-4">
    <h4 className="font-semibold mb-4">환불 처리</h4>
    <div className="space-y-4">
      <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-medium">환불 요청 #REF240814001</p>
            <p className="text-sm text-gray-600">주문번호: #240814001</p>
            <p className="text-sm text-gray-600">고객: 홍길동</p>
          </div>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            검토 필요
          </span>
        </div>
        <div className="space-y-2 mb-4">
          <p className="text-sm"><strong>환불 사유:</strong> 상품 불량</p>
          <p className="text-sm"><strong>상품:</strong> 삼각김밥 × 2개 (₩2,400)</p>
          <p className="text-sm"><strong>요청 내용:</strong> 상품이 상해있어서 환불 요청드립니다.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex-1 bg-green-500 text-white py-2 text-sm rounded hover:bg-green-600">
            승인
          </button>
          <button className="flex-1 bg-red-500 text-white py-2 text-sm rounded hover:bg-red-600">
            거부
          </button>
          <button className="flex-1 bg-gray-500 text-white py-2 text-sm rounded hover:bg-gray-600">
            고객 연락
          </button>
        </div>
      </div>
      
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <h5 className="font-medium text-blue-800 mb-2">환불 처리 가이드</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 상품 불량: 즉시 승인 (사진 확인 필요)</li>
          <li>• 단순 변심: 5분 이내 주문만 승인</li>
          <li>• 의심스러운 경우: 고객센터로 연락</li>
        </ul>
      </div>
    </div>
  </div>
);

const MockStoreSettings = () => (
  <div className="bg-white rounded-lg border p-4">
    <h4 className="font-semibold mb-4">지점 설정</h4>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">영업 시간</label>
        <div className="grid grid-cols-2 gap-2">
          <input 
            type="time" 
            className="px-3 py-2 border border-gray-300 rounded-md text-sm" 
            defaultValue="06:00"
          />
          <input 
            type="time" 
            className="px-3 py-2 border border-gray-300 rounded-md text-sm" 
            defaultValue="24:00"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">지점 전화번호</label>
        <input 
          type="tel" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" 
          defaultValue="02-1234-5678"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">특이사항</label>
        <textarea 
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20"
          placeholder="고객에게 알릴 특이사항을 입력하세요."
          defaultValue="주차장 이용 가능, 24시간 운영"
        ></textarea>
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" defaultChecked />
          <span className="text-sm">신규 주문 알림</span>
        </label>
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" defaultChecked />
          <span className="text-sm">재고 부족 알림</span>
        </label>
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span className="text-sm">임시 휴업</span>
        </label>
      </div>
      
      <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors">
        설정 저장
      </button>
    </div>
  </div>
);

const StoreManual: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      id: 'dashboard-overview',
      title: '대시보드 및 실시간 현황',
      description: '점주 전용 대시보드에서 실시간 주문, 매출, 재고 현황을 한 눈에 확인할 수 있습니다.',
      component: <MockStoreDashboard />,
      tips: [
        '신규 주문은 실시간으로 알림이 옵니다',
        '매출은 시간별, 일별로 확인 가능합니다',
        '품절 상품은 즉시 발주 요청을 권장합니다',
        '대시보드는 5초마다 자동 새로고침됩니다'
      ]
    },
    {
      id: 'order-processing',
      title: '주문 접수 및 처리',
      description: '고객 주문을 접수하고 준비 상태를 관리합니다. 주문 상태를 단계별로 업데이트하여 고객에게 알림을 전송할 수 있습니다.',
      component: <MockOrderManagement />,
      tips: [
        '신규 주문은 5분 이내에 접수해주세요',
        '준비 시간은 상품에 따라 조절하세요',
        '고객에게 실시간 상태가 전달됩니다',
        '특이사항이 있으면 메모를 남겨주세요'
      ]
    },
    {
      id: 'inventory-control',
      title: '재고 관리 및 발주',
      description: '상품별 재고를 실시간으로 관리하고, 부족한 상품에 대해 자동 발주 요청을 할 수 있습니다.',
      component: <MockInventoryManagement />,
      tips: [
        '최소 재고량 설정으로 자동 알림을 받을 수 있습니다',
        '재고 조정은 실시간으로 반영됩니다',
        '발주 요청은 본사 승인 후 배송됩니다',
        '품절 상품은 고객에게 자동으로 표시됩니다'
      ]
    },
    {
      id: 'supply-requests',
      title: '물류 요청 시스템',
      description: '재고가 부족하거나 신규 상품이 필요할 때 본사에 물류 요청을 할 수 있습니다.',
      component: <MockSupplyRequest />,
      tips: [
        '긴급 발주는 추가 비용이 발생할 수 있습니다',
        '최소 주문 단위를 확인하고 요청하세요',
        '요청 사유를 구체적으로 작성해주세요',
        '승인 상태는 실시간으로 확인 가능합니다'
      ]
    },
    {
      id: 'sales-analytics',
      title: '매출 분석 및 보고서',
      description: '일별, 주별, 월별 매출을 분석하고 인기 상품을 파악하여 효율적인 매장 운영을 할 수 있습니다.',
      component: <MockSalesAnalysis />,
      tips: [
        '인기 상품 위주로 재고를 관리하세요',
        '시간대별 매출 패턴을 파악해보세요',
        '계절별 트렌드를 고려한 발주를 계획하세요',
        '보고서는 PDF로 다운로드 가능합니다'
      ]
    },
    {
      id: 'refund-handling',
      title: '고객 환불 처리',
      description: '고객의 환불 요청을 검토하고 승인/거부 처리를 할 수 있습니다. 합리적인 사유인지 판단하여 처리하세요.',
      component: <MockRefundProcessing />,
      tips: [
        '상품 불량은 사진 확인 후 즉시 승인하세요',
        '의심스러운 환불 요청은 고객센터로 문의하세요',
        '환불 승인 시 재고가 자동으로 복구됩니다',
        '환불 이력은 모두 기록되어 관리됩니다'
      ]
    },
    {
      id: 'store-configuration',
      title: '시스템 설정 관리',
      description: '지점 운영 시간, 연락처, 알림 설정 등을 관리하여 원활한 매장 운영을 할 수 있습니다.',
      component: <MockStoreSettings />,
      tips: [
        '영업 시간 변경은 고객에게 즉시 반영됩니다',
        '임시 휴업 설정 시 신규 주문이 차단됩니다',
        '알림 설정으로 업무 효율성을 높이세요',
        '설정 변경 사항은 자동으로 저장됩니다'
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
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
              <h1 className="text-2xl font-bold text-gray-900">🏪 점주 사용자 매뉴얼</h1>
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded-full mb-6">
            <span className="text-3xl">🏪</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            점주를 위한 종합 
            <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              {' '}운영 가이드
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            주문 관리부터 재고, 매출 분석까지 성공적인 편의점 운영을 위한 
            <br />
            모든 기능을 단계별로 체험해보세요!
          </p>
        </motion.div>

        {/* 주요 기능 개요 */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">🎯 점주 핵심 업무 한눈에 보기</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl mb-3">📋</div>
                <h4 className="font-semibold text-gray-900 mb-2">주문 관리</h4>
                <p className="text-sm text-gray-600">실시간 주문 접수 및 처리</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl mb-3">📦</div>
                <h4 className="font-semibold text-gray-900 mb-2">재고 관리</h4>
                <p className="text-sm text-gray-600">실시간 재고 현황 및 발주</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="font-semibold text-gray-900 mb-2">매출 분석</h4>
                <p className="text-sm text-gray-600">상세한 매출 리포트</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-3xl mb-3">⚙️</div>
                <h4 className="font-semibold text-gray-900 mb-2">지점 설정</h4>
                <p className="text-sm text-gray-600">운영 설정 및 관리</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 인터랙티브 데모 */}
        <motion.div variants={itemVariants}>
          <InteractiveDemo
            title="편의점 운영 마스터하기"
            steps={steps}
            onComplete={() => {
              console.log('점주 매뉴얼 완료!');
            }}
          />
        </motion.div>

        {/* 추가 정보 섹션 */}
        <motion.div variants={itemVariants} className="mt-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 운영 팁 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💡</span>
                성공적인 운영 팁
              </h3>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h4 className="font-medium text-gray-900 mb-1">주문 처리 시간 단축</h4>
                  <p className="text-sm text-gray-600">자주 주문되는 상품을 쉽게 접근할 수 있는 위치에 배치하세요.</p>
                </div>
                <div className="border-b border-gray-100 pb-3">
                  <h4 className="font-medium text-gray-900 mb-1">재고 최적화</h4>
                  <p className="text-sm text-gray-600">시간대별 판매 패턴을 분석하여 효율적인 재고 관리를 하세요.</p>
                </div>
                <div className="border-b border-gray-100 pb-3">
                  <h4 className="font-medium text-gray-900 mb-1">고객 만족도 향상</h4>
                  <p className="text-sm text-gray-600">주문 완료 알림을 빠르게 보내고 픽업 시간을 정확히 지켜주세요.</p>
                </div>
              </div>
            </div>

            {/* 지원 정보 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🤝</span>
                점주 지원 서비스
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600">📞</span>
                  <div>
                    <p className="font-medium text-gray-900">점주 전용 상담</p>
                    <p className="text-sm text-gray-600">1588-5678 (24시간 운영)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600">💻</span>
                  <div>
                    <p className="font-medium text-gray-900">점주 커뮤니티</p>
                    <p className="text-sm text-gray-600">운영 노하우 공유 및 질의응답</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <span className="text-purple-600">📚</span>
                  <div>
                    <p className="font-medium text-gray-900">교육 프로그램</p>
                    <p className="text-sm text-gray-600">월 1회 점주 교육 및 워크샵</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 다음 매뉴얼 안내 */}
        <motion.div variants={itemVariants} className="mt-12 text-center">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">🏢 본사 관리자 매뉴얼도 확인해보세요!</h3>
            <p className="mb-6">전체 시스템 관리와 통합 운영에 대해 알아보세요.</p>
            <button
              onClick={() => navigate('/manual/hq')}
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              본사 매뉴얼 보기 →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StoreManual;