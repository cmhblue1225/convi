import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveDemo from './components/InteractiveDemo';

// 모의 UI 컴포넌트들
const MockHQDashboard = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-blue-500 text-white p-4 rounded-lg">
        <h4 className="font-bold text-lg">156</h4>
        <p className="text-sm opacity-90">총 지점 수</p>
      </div>
      <div className="bg-green-500 text-white p-4 rounded-lg">
        <h4 className="font-bold text-lg">₩12.5M</h4>
        <p className="text-sm opacity-90">일일 매출</p>
      </div>
      <div className="bg-orange-500 text-white p-4 rounded-lg">
        <h4 className="font-bold text-lg">342</h4>
        <p className="text-sm opacity-90">신규 주문</p>
      </div>
      <div className="bg-purple-500 text-white p-4 rounded-lg">
        <h4 className="font-bold text-lg">23</h4>
        <p className="text-sm opacity-90">발주 요청</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-semibold mb-3">지점 현황</h4>
        <div className="space-y-2">
          {[
            { name: '강남점', status: '정상', orders: '45건', sales: '₩850K' },
            { name: '역삼점', status: '재고부족', orders: '32건', sales: '₩720K' },
            { name: '삼성점', status: '정상', orders: '28건', sales: '₩650K' }
          ].map((store, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-sm">{store.name}</p>
                <p className="text-xs text-gray-600">{store.orders} | {store.sales}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                store.status === '정상' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {store.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-semibold mb-3">긴급 알림</h4>
        <div className="space-y-2">
          <div className="p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-sm font-medium text-red-800">시스템 점검 알림</p>
            <p className="text-xs text-red-600">오늘 02:00-04:00 시스템 점검 예정</p>
          </div>
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-medium text-yellow-800">재고 부족 경고</p>
            <p className="text-xs text-yellow-600">5개 지점에서 주요 상품 재고 부족</p>
          </div>
          <div className="p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-medium text-blue-800">신규 가맹점 신청</p>
            <p className="text-xs text-blue-600">3건의 신규 가맹점 승인 대기 중</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MockStoreApproval = () => {
  const [stores, setStores] = useState([
    { 
      id: 1, 
      name: '편의점24 서초점', 
      owner: '김사장',
      address: '서울시 서초구 서초대로 123',
      phone: '02-1234-5678',
      status: '승인 대기',
      docs: ['사업자등록증', '임대차계약서', '신분증']
    },
    { 
      id: 2, 
      name: '편의점24 잠실점', 
      owner: '이사장',
      address: '서울시 송파구 잠실로 456',
      phone: '02-5678-9012',
      status: '승인 대기',
      docs: ['사업자등록증', '신분증']
    }
  ]);

  const approveStore = (id: number) => {
    setStores(stores.map(store => 
      store.id === id ? { ...store, status: '승인 완료' } : store
    ));
  };

  const rejectStore = (id: number) => {
    setStores(stores.map(store => 
      store.id === id ? { ...store, status: '승인 거부' } : store
    ));
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <h4 className="font-semibold mb-4">지점 승인 관리</h4>
      <div className="space-y-4">
        {stores.map(store => (
          <div key={store.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h5 className="font-medium">{store.name}</h5>
                <p className="text-sm text-gray-600">사장: {store.owner}</p>
                <p className="text-sm text-gray-600">주소: {store.address}</p>
                <p className="text-sm text-gray-600">연락처: {store.phone}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                store.status === '승인 대기' ? 'bg-yellow-100 text-yellow-800' :
                store.status === '승인 완료' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {store.status}
              </span>
            </div>
            
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">제출 서류:</p>
              <div className="flex flex-wrap gap-2">
                {store.docs.map((doc, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    📄 {doc}
                  </span>
                ))}
              </div>
            </div>
            
            {store.status === '승인 대기' && (
              <div className="flex space-x-3">
                <button 
                  onClick={() => approveStore(store.id)}
                  className="flex-1 bg-green-500 text-white py-2 text-sm rounded hover:bg-green-600"
                >
                  승인
                </button>
                <button 
                  onClick={() => rejectStore(store.id)}
                  className="flex-1 bg-red-500 text-white py-2 text-sm rounded hover:bg-red-600"
                >
                  거부
                </button>
                <button className="flex-1 bg-gray-500 text-white py-2 text-sm rounded hover:bg-gray-600">
                  추가 서류 요청
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const MockProductMaster = () => {
  const [products, setProducts] = useState([
    { id: 1, name: '콜라 500ml', category: '음료', price: 1500, supplier: '코카콜라', code: 'COLA500', status: '활성' },
    { id: 2, name: '삼각김밥', category: '식품', price: 1200, supplier: '삼각식품', code: 'TRI001', status: '활성' },
    { id: 3, name: '컵라면', category: '라면', price: 1000, supplier: '농심', code: 'CUP001', status: '비활성' }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">상품 마스터 관리</h4>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          + 신규 상품
        </button>
      </div>
      
      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <h5 className="font-medium mb-3">신규 상품 등록</h5>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="상품명" className="px-3 py-2 border rounded text-sm" />
            <select className="px-3 py-2 border rounded text-sm">
              <option>카테고리 선택</option>
              <option>음료</option>
              <option>식품</option>
              <option>라면</option>
              <option>과자</option>
            </select>
            <input type="number" placeholder="가격" className="px-3 py-2 border rounded text-sm" />
            <input type="text" placeholder="공급업체" className="px-3 py-2 border rounded text-sm" />
            <input type="text" placeholder="상품코드" className="px-3 py-2 border rounded text-sm" />
            <select className="px-3 py-2 border rounded text-sm">
              <option>활성</option>
              <option>비활성</option>
            </select>
          </div>
          <div className="flex space-x-2 mt-3">
            <button className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600">
              등록
            </button>
            <button 
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              취소
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-medium">{product.name}</h5>
                <p className="text-sm text-gray-600">카테고리: {product.category} | 공급업체: {product.supplier}</p>
                <p className="text-sm text-gray-600">상품코드: {product.code} | 가격: ₩{product.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  product.status === '활성' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.status}
                </span>
                <button className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200">
                  수정
                </button>
                <button className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200">
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MockSupplyApproval = () => {
  const [requests, setRequests] = useState([
    { 
      id: 1, 
      store: '강남점', 
      product: '콜라 500ml', 
      quantity: 50, 
      urgency: '일반',
      reason: '재고 소진으로 인한 보충',
      status: '승인 대기',
      requestDate: '2024-08-14'
    },
    { 
      id: 2, 
      store: '역삼점', 
      product: '삼각김밥', 
      quantity: 30, 
      urgency: '긴급',
      reason: '품절 상태, 긴급 보충 필요',
      status: '승인 대기',
      requestDate: '2024-08-14'
    }
  ]);

  const approveRequest = (id: number) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: '승인 완료' } : req
    ));
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <h4 className="font-semibold mb-4">물류 발주 승인</h4>
      <div className="space-y-4">
        {requests.map(request => (
          <div key={request.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h5 className="font-medium">{request.store} - {request.product}</h5>
                <p className="text-sm text-gray-600">요청 수량: {request.quantity}개</p>
                <p className="text-sm text-gray-600">요청일: {request.requestDate}</p>
                <p className="text-sm text-gray-600">사유: {request.reason}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  request.urgency === '긴급' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {request.urgency}
                </span>
                <div className="mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.status === '승인 대기' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
              </div>
            </div>
            
            {request.status === '승인 대기' && (
              <div className="border-t pt-3">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">배송 예정일</label>
                    <input type="date" className="w-full px-2 py-1 border rounded text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">배송비</label>
                    <input type="number" placeholder="0" className="w-full px-2 py-1 border rounded text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">담당자</label>
                    <select className="w-full px-2 py-1 border rounded text-xs">
                      <option>김물류</option>
                      <option>이배송</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => approveRequest(request.id)}
                    className="flex-1 bg-green-500 text-white py-2 text-sm rounded hover:bg-green-600"
                  >
                    승인 및 배송 처리
                  </button>
                  <button className="flex-1 bg-red-500 text-white py-2 text-sm rounded hover:bg-red-600">
                    거부
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const MockCompanyAnalytics = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-lg border p-4">
        <h5 className="font-medium text-gray-700 mb-2">전사 매출</h5>
        <p className="text-2xl font-bold text-blue-600">₩125.8M</p>
        <p className="text-sm text-green-600">+15.2% vs 지난달</p>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <h5 className="font-medium text-gray-700 mb-2">평균 지점 매출</h5>
        <p className="text-2xl font-bold text-green-600">₩806K</p>
        <p className="text-sm text-green-600">+8.7% vs 지난달</p>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <h5 className="font-medium text-gray-700 mb-2">신규 고객</h5>
        <p className="text-2xl font-bold text-purple-600">2,847</p>
        <p className="text-sm text-green-600">+23.1% vs 지난달</p>
      </div>
    </div>
    
    <div className="bg-white rounded-lg border p-4">
      <h4 className="font-semibold mb-4">지역별 성과 분석</h4>
      <div className="space-y-3">
        {[
          { region: '강남구', stores: 25, sales: '₩18.5M', growth: '+12.3%', performance: '우수' },
          { region: '송파구', stores: 18, sales: '₩14.2M', growth: '+8.9%', performance: '양호' },
          { region: '서초구', stores: 22, sales: '₩16.8M', growth: '+15.7%', performance: '우수' },
          { region: '마포구', stores: 15, sales: '₩9.8M', growth: '-2.1%', performance: '개선필요' }
        ].map((region, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <h5 className="font-medium">{region.region}</h5>
              <p className="text-sm text-gray-600">{region.stores}개 지점</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-blue-600">{region.sales}</p>
              <p className={`text-sm ${region.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {region.growth}
              </p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              region.performance === '우수' ? 'bg-green-100 text-green-800' :
              region.performance === '양호' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {region.performance}
            </span>
          </div>
        ))}
      </div>
    </div>
    
    <div className="bg-white rounded-lg border p-4">
      <h4 className="font-semibold mb-4">전사 인기 상품 TOP 10</h4>
      <div className="space-y-2">
        {[
          { rank: 1, name: '콜라 500ml', sales: '15,847개', revenue: '₩23.8M' },
          { rank: 2, name: '삼각김밥', sales: '12,456개', revenue: '₩14.9M' },
          { rank: 3, name: '바나나우유', sales: '9,834개', revenue: '₩17.7M' },
          { rank: 4, name: '컵라면', sales: '8,923개', revenue: '₩8.9M' },
          { rank: 5, name: '아이스크림', sales: '7,654개', revenue: '₩15.3M' }
        ].map(item => (
          <div key={item.rank} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
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
);

const MockPromotionManagement = () => {
  const [promotions, setPromotions] = useState([
    { id: 1, name: '여름 시원 이벤트', type: '할인', rate: '10%', period: '2024-08-01 ~ 2024-08-31', status: '진행중' },
    { id: 2, name: '신규 고객 쿠폰', type: '쿠폰', rate: '₩2,000', period: '2024-08-01 ~ 2024-12-31', status: '진행중' },
    { id: 3, name: '포인트 2배 적립', type: '포인트', rate: '2배', period: '2024-07-15 ~ 2024-08-15', status: '종료' }
  ]);

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">프로모션 관리</h4>
        <button className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600">
          + 새 프로모션
        </button>
      </div>
      
      <div className="space-y-3">
        {promotions.map(promotion => (
          <div key={promotion.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h5 className="font-medium">{promotion.name}</h5>
                <p className="text-sm text-gray-600">유형: {promotion.type} | 혜택: {promotion.rate}</p>
                <p className="text-sm text-gray-600">기간: {promotion.period}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                promotion.status === '진행중' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {promotion.status}
              </span>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200">
                수정
              </button>
              <button className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded hover:bg-orange-200">
                일시정지
              </button>
              <button className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200">
                종료
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MockSystemMonitoring = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-semibold mb-3">시스템 상태</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">서버 상태</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">정상</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">데이터베이스</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">정상</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">결제 시스템</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">정상</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">알림 서비스</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">지연</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-semibold mb-3">성능 지표</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>CPU 사용률</span>
              <span>45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>메모리 사용률</span>
              <span>62%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '62%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>디스크 사용률</span>
              <span>78%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{width: '78%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-lg border p-4">
      <h4 className="font-semibold mb-3">최근 시스템 로그</h4>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {[
          { time: '14:32:15', type: 'INFO', message: '신규 주문 처리 완료 (#240814156)' },
          { time: '14:31:42', type: 'WARN', message: '알림 서비스 응답 지연 감지' },
          { time: '14:30:28', type: 'INFO', message: '지점 승인 처리 완료 (서초점)' },
          { time: '14:29:15', type: 'ERROR', message: '결제 처리 일시 실패 - 자동 복구됨' },
          { time: '14:28:03', type: 'INFO', message: '일일 백업 작업 시작' }
        ].map((log, index) => (
          <div key={index} className="flex items-center space-x-3 text-sm p-2 bg-gray-50 rounded">
            <span className="text-gray-500 font-mono">{log.time}</span>
            <span className={`px-2 py-1 text-xs rounded ${
              log.type === 'ERROR' ? 'bg-red-100 text-red-800' :
              log.type === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {log.type}
            </span>
            <span className="flex-1">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const HQManual: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      id: 'hq-dashboard',
      title: '통합 대시보드 및 현황 모니터링',
      description: '전체 네트워크의 실시간 현황을 한 눈에 파악할 수 있습니다. 지점별 매출, 주문 현황, 긴급 알림을 통해 효과적인 의사결정을 지원합니다.',
      component: <MockHQDashboard />,
      tips: [
        '대시보드는 실시간으로 업데이트되어 최신 정보를 제공합니다',
        '긴급 알림을 통해 즉시 대응이 필요한 사항을 확인하세요',
        '지점별 성과 비교를 통해 우수 사례를 공유할 수 있습니다',
        '월별, 분기별 리포트를 자동으로 생성할 수 있습니다'
      ]
    },
    {
      id: 'store-approval',
      title: '지점 관리 및 승인',
      description: '신규 가맹점 신청을 검토하고 승인/거부 처리를 할 수 있습니다. 제출된 서류를 확인하고 추가 서류를 요청할 수도 있습니다.',
      component: <MockStoreApproval />,
      tips: [
        '사업자등록증, 임대차계약서는 필수 제출 서류입니다',
        '승인 전 현장 실사를 권장합니다',
        '거부 시 구체적인 사유를 명시해주세요',
        '승인된 지점은 자동으로 시스템에 등록됩니다'
      ]
    },
    {
      id: 'product-catalog',
      title: '상품 마스터 관리',
      description: '전체 네트워크에서 판매될 상품을 등록, 수정, 삭제할 수 있습니다. 가격 정책과 공급업체 정보도 함께 관리합니다.',
      component: <MockProductMaster />,
      tips: [
        '상품 코드는 중복되지 않도록 주의하세요',
        '가격 변경 시 모든 지점에 실시간 반영됩니다',
        '시즌 상품은 미리 비활성화 일정을 설정하세요',
        '공급업체 정보 변경 시 관련 지점에 자동 알림됩니다'
      ]
    },
    {
      id: 'supply-management',
      title: '물류 및 배송 관리',
      description: '지점에서 요청한 발주를 검토하고 승인하여 배송을 처리합니다. 긴급 요청과 일반 요청을 구분하여 효율적으로 관리할 수 있습니다.',
      component: <MockSupplyApproval />,
      tips: [
        '긴급 요청은 24시간 이내 처리를 권장합니다',
        '배송 루트를 최적화하여 비용을 절감하세요',
        '재고 부족 패턴을 분석하여 예방 발주를 제안하세요',
        '배송 완료 후 지점에 자동으로 입고 처리됩니다'
      ]
    },
    {
      id: 'company-analytics',
      title: '전사 매출 분석',
      description: '전체 네트워크의 매출을 종합적으로 분석하고 지역별, 상품별 성과를 비교할 수 있습니다. 트렌드 분석을 통해 전략적 의사결정을 지원합니다.',
      component: <MockCompanyAnalytics />,
      tips: [
        '지역별 성과 차이를 분석하여 마케팅 전략을 수립하세요',
        '인기 상품 데이터를 활용하여 신규 상품을 기획하세요',
        '계절별 매출 패턴을 파악하여 재고 계획을 세우세요',
        '성과가 낮은 지점에는 맞춤형 지원을 제공하세요'
      ]
    },
    {
      id: 'promotion-policy',
      title: '프로모션 및 정책 관리',
      description: '전사 차원의 프로모션과 정책을 수립하고 관리합니다. 할인 이벤트, 쿠폰, 포인트 정책 등을 통합적으로 운영할 수 있습니다.',
      component: <MockPromotionManagement />,
      tips: [
        '프로모션 효과를 사전에 시뮬레이션해보세요',
        '지역별로 다른 프로모션을 적용할 수 있습니다',
        '프로모션 종료 후 성과 분석을 반드시 실시하세요',
        '고객 피드백을 수집하여 차기 프로모션에 반영하세요'
      ]
    },
    {
      id: 'system-monitoring',
      title: '시스템 모니터링',
      description: '전체 시스템의 안정성과 성능을 실시간으로 모니터링합니다. 장애 발생 시 즉시 대응하고 예방적 조치를 취할 수 있습니다.',
      component: <MockSystemMonitoring />,
      tips: [
        '시스템 알림을 통해 장애를 사전에 예방하세요',
        '정기적인 백업과 보안 점검을 실시하세요',
        '성능 지표를 모니터링하여 시스템을 최적화하세요',
        '장애 발생 시 복구 절차를 사전에 준비해두세요'
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
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
              <h1 className="text-2xl font-bold text-gray-900">🏢 본사 관리자 매뉴얼</h1>
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mb-6">
            <span className="text-3xl">🏢</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            본사 관리자를 위한 
            <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              {' '}통합 관리 가이드
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            전체 네트워크 관리부터 전략적 의사결정까지 성공적인 본사 운영을 위한 
            <br />
            모든 시스템을 완벽하게 마스터해보세요!
          </p>
        </motion.div>

        {/* 주요 기능 개요 */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">🎯 본사 핵심 관리 업무</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-3xl mb-3">🏪</div>
                <h4 className="font-semibold text-gray-900 mb-2">지점 관리</h4>
                <p className="text-sm text-gray-600">신규 지점 승인 및 통합 관리</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl mb-3">📦</div>
                <h4 className="font-semibold text-gray-900 mb-2">물류 관리</h4>
                <p className="text-sm text-gray-600">전사 물류 및 배송 체계</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="font-semibold text-gray-900 mb-2">통합 분석</h4>
                <p className="text-sm text-gray-600">전사 매출 및 성과 분석</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl mb-3">⚙️</div>
                <h4 className="font-semibold text-gray-900 mb-2">시스템 관리</h4>
                <p className="text-sm text-gray-600">통합 시스템 모니터링</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 인터랙티브 데모 */}
        <motion.div variants={itemVariants}>
          <InteractiveDemo
            title="편의점 네트워크 통합 관리 마스터하기"
            steps={steps}
            onComplete={() => {
              console.log('본사 매뉴얼 완료!');
            }}
          />
        </motion.div>

        {/* 추가 정보 섹션 */}
        <motion.div variants={itemVariants} className="mt-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 관리 원칙 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                효과적인 관리 원칙
              </h3>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h4 className="font-medium text-gray-900 mb-1">데이터 기반 의사결정</h4>
                  <p className="text-sm text-gray-600">실시간 데이터와 분석 결과를 바탕으로 전략적 결정을 내리세요.</p>
                </div>
                <div className="border-b border-gray-100 pb-3">
                  <h4 className="font-medium text-gray-900 mb-1">선제적 문제 해결</h4>
                  <p className="text-sm text-gray-600">문제가 발생하기 전에 예방하고, 조기에 대응하세요.</p>
                </div>
                <div className="border-b border-gray-100 pb-3">
                  <h4 className="font-medium text-gray-900 mb-1">지점과의 소통</h4>
                  <p className="text-sm text-gray-600">지점의 의견을 적극 수렴하고 피드백을 제공하세요.</p>
                </div>
              </div>
            </div>

            {/* 비상 연락망 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🚨</span>
                비상 연락망
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                  <span className="text-red-600">🚨</span>
                  <div>
                    <p className="font-medium text-gray-900">시스템 장애 신고</p>
                    <p className="text-sm text-gray-600">1588-9999 (24시간 대기)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <span className="text-orange-600">📞</span>
                  <div>
                    <p className="font-medium text-gray-900">물류 센터</p>
                    <p className="text-sm text-gray-600">1588-7777 (평일 9-18시)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600">💻</span>
                  <div>
                    <p className="font-medium text-gray-900">IT 지원팀</p>
                    <p className="text-sm text-gray-600">1588-8888 (평일 9-18시)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 완료 메시지 */}
        <motion.div variants={itemVariants} className="mt-12 text-center">
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">🎉 모든 매뉴얼 완성!</h3>
            <p className="mb-6">고객, 점주, 본사 관리자를 위한 완벽한 가이드를 모두 확인하셨습니다.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/manual/customer')}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                고객 매뉴얼 다시보기
              </button>
              <button
                onClick={() => navigate('/manual/store')}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                점주 매뉴얼 다시보기
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HQManual;