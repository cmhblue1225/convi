import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon as X, 
  PlayIcon as Play, 
  PauseIcon as Pause, 
  ArrowPathIcon as RotateCcw,
  ArrowRightIcon as ArrowRight,
  ArchiveBoxIcon as Package,
  TruckIcon as Truck,
  ShoppingCartIcon as ShoppingCart,
  BuildingStorefrontIcon as Store,
  BuildingOffice2Icon as Building2,
  UserIcon as User,
  UserIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  UserGroupIcon,
  CubeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SystemDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = {
  id: string;
  title: string;
  description: string;
  role: 'customer' | 'store_owner' | 'headquarters';
  icon: React.ReactNode;
  position: { x: number; y: number };
  connections: string[];
};

type DemoTab = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  steps: Step[];
};

const demoTabs: DemoTab[] = [
  {
    id: 'order-flow',
    title: '주문 처리',
    description: '고객 주문부터 픽업까지의 전체 프로세스',
    icon: <ShoppingCart className="w-5 h-5" />,
    steps: [
      {
        id: 'customer-order',
        title: '고객 주문',
        description: '고객이 앱을 통해 상품을 주문하고 결제합니다',
        role: 'customer',
        icon: <ShoppingCart className="w-6 h-6" />,
        position: { x: 15, y: 15 },
        connections: ['payment-process']
      },
      {
        id: 'payment-process',
        title: '결제 처리',
        description: '토스페이먼츠를 통한 안전한 결제 처리',
        role: 'customer',
        icon: <CreditCardIcon className="w-6 h-6" />,
        position: { x: 50, y: 15 },
        connections: ['store-receive']
      },
      {
        id: 'store-receive',
        title: '주문 접수',
        description: '점주가 실시간으로 새 주문을 확인합니다',
        role: 'store_owner',
        icon: <BellIcon className="w-6 h-6" />,
        position: { x: 85, y: 15 },
        connections: ['store-prepare']
      },
      {
        id: 'store-prepare',
        title: '상품 준비',
        description: '주문받은 상품을 준비하고 포장합니다',
        role: 'store_owner',
        icon: <Package className="w-6 h-6" />,
        position: { x: 85, y: 40 },
        connections: ['order-ready']
      },
      {
        id: 'order-ready',
        title: '준비 완료',
        description: '고객에게 픽업 준비 완료 알림을 발송합니다',
        role: 'store_owner',
        icon: <CheckCircleIcon className="w-6 h-6" />,
        position: { x: 50, y: 40 },
        connections: ['customer-pickup']
      },
      {
        id: 'customer-pickup',
        title: '픽업 완료',
        description: '고객이 매장에서 상품을 픽업합니다',
        role: 'customer',
        icon: <User className="w-6 h-6" />,
        position: { x: 15, y: 40 },
        connections: ['customer-order']
      }
    ]
  },
  {
    id: 'inventory-management',
    title: '재고 관리',
    description: '재고 확인부터 물류 요청까지의 관리 시스템',
    icon: <CubeIcon className="w-5 h-5" />,
    steps: [
      {
        id: 'stock-check',
        title: '재고 확인',
        description: '점주가 실시간으로 재고 현황을 확인합니다',
        role: 'store_owner',
        icon: <ClipboardDocumentListIcon className="w-6 h-6" />,
        position: { x: 15, y: 15 },
        connections: ['low-stock-alert']
      },
      {
        id: 'low-stock-alert',
        title: '재고 부족 알림',
        description: '안전재고 이하 상품에 대한 자동 알림',
        role: 'store_owner',
        icon: <ExclamationTriangleIcon className="w-6 h-6" />,
        position: { x: 50, y: 15 },
        connections: ['supply-request']
      },
      {
        id: 'supply-request',
        title: '물류 요청',
        description: '본사에 필요한 상품의 공급을 요청합니다',
        role: 'store_owner',
        icon: <DocumentTextIcon className="w-6 h-6" />,
        position: { x: 85, y: 15 },
        connections: ['hq-review']
      },
      {
        id: 'hq-review',
        title: '요청 검토',
        description: '본사에서 물류 요청을 검토하고 승인합니다',
        role: 'headquarters',
        icon: <Building2 className="w-6 h-6" />,
        position: { x: 85, y: 40 },
        connections: ['shipping']
      },
      {
        id: 'shipping',
        title: '배송 처리',
        description: '승인된 상품을 지점으로 배송 처리합니다',
        role: 'headquarters',
        icon: <Truck className="w-6 h-6" />,
        position: { x: 50, y: 40 },
        connections: ['stock-update']
      },
      {
        id: 'stock-update',
        title: '재고 업데이트',
        description: '배송 완료 후 지점 재고가 자동 업데이트됩니다',
        role: 'store_owner',
        icon: <CubeIcon className="w-6 h-6" />,
        position: { x: 15, y: 40 },
        connections: ['stock-check']
      }
    ]
  },
  {
    id: 'analytics-reporting',
    title: '분석 및 리포팅',
    description: '매출 분석과 비즈니스 인사이트 시스템',
    icon: <ChartBarIcon className="w-5 h-5" />,
    steps: [
      {
        id: 'sales-data',
        title: '매출 데이터 수집',
        description: '모든 거래 데이터를 실시간으로 수집합니다',
        role: 'store_owner',
        icon: <ChartBarIcon className="w-6 h-6" />,
        position: { x: 15, y: 15 },
        connections: ['daily-summary']
      },
      {
        id: 'daily-summary',
        title: '일일 매출 요약',
        description: '하루 매출을 자동으로 집계하고 요약합니다',
        role: 'store_owner',
        icon: <DocumentTextIcon className="w-6 h-6" />,
        position: { x: 50, y: 15 },
        connections: ['product-analysis']
      },
      {
        id: 'product-analysis',
        title: '상품별 분석',
        description: '인기 상품과 매출 트렌드를 분석합니다',
        role: 'store_owner',
        icon: <CubeIcon className="w-6 h-6" />,
        position: { x: 85, y: 15 },
        connections: ['hq-consolidation']
      },
      {
        id: 'hq-consolidation',
        title: '본사 데이터 통합',
        description: '모든 지점 데이터를 본사에서 통합 관리합니다',
        role: 'headquarters',
        icon: <Building2 className="w-6 h-6" />,
        position: { x: 85, y: 40 },
        connections: ['business-insights']
      },
      {
        id: 'business-insights',
        title: '비즈니스 인사이트',
        description: '전체 네트워크 분석과 최적화 방안 제시',
        role: 'headquarters',
        icon: <ChartBarIcon className="w-6 h-6" />,
        position: { x: 50, y: 40 },
        connections: ['recommendations']
      },
      {
        id: 'recommendations',
        title: '개선 권장사항',
        description: '데이터 기반 운영 개선 방안을 각 지점에 제공',
        role: 'headquarters',
        icon: <DocumentTextIcon className="w-6 h-6" />,
        position: { x: 15, y: 40 },
        connections: ['sales-data']
      }
    ]
  },
  {
    id: 'user-management',
    title: '사용자 관리',
    description: '고객, 점주, 본사 직원의 통합 관리 시스템',
    icon: <UserGroupIcon className="w-5 h-5" />,
    steps: [
      {
        id: 'user-registration',
        title: '사용자 등록',
        description: '새로운 사용자가 역할별로 회원가입합니다',
        role: 'customer',
        icon: <UserIcon className="w-6 h-6" />,
        position: { x: 15, y: 15 },
        connections: ['role-assignment']
      },
      {
        id: 'role-assignment',
        title: '역할 할당',
        description: '고객, 점주, 본사 역할에 따른 권한 설정',
        role: 'headquarters',
        icon: <CogIcon className="w-6 h-6" />,
        position: { x: 50, y: 15 },
        connections: ['store-approval']
      },
      {
        id: 'store-approval',
        title: '지점 승인',
        description: '점주 회원가입 시 지점 정보 검토 및 승인',
        role: 'headquarters',
        icon: <Store className="w-6 h-6" />,
        position: { x: 85, y: 15 },
        connections: ['access-control']
      },
      {
        id: 'access-control',
        title: '접근 권한 관리',
        description: '역할별 시스템 접근 권한을 관리합니다',
        role: 'headquarters',
        icon: <CogIcon className="w-6 h-6" />,
        position: { x: 85, y: 40 },
        connections: ['user-monitoring']
      },
      {
        id: 'user-monitoring',
        title: '사용자 모니터링',
        description: '시스템 사용 패턴과 활성 사용자를 모니터링',
        role: 'headquarters',
        icon: <UserGroupIcon className="w-6 h-6" />,
        position: { x: 50, y: 40 },
        connections: ['account-management']
      },
      {
        id: 'account-management',
        title: '계정 관리',
        description: '사용자 계정 상태 관리 및 지원 서비스',
        role: 'headquarters',
        icon: <UserIcon className="w-6 h-6" />,
        position: { x: 15, y: 40 },
        connections: ['user-registration']
      }
    ]
  }
];

const SystemDemo: React.FC<SystemDemoProps> = ({ isOpen, onClose }) => {
  const [activeTabId, setActiveTabId] = useState('order-flow');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  
  const activeTab = demoTabs.find(tab => tab.id === activeTabId) || demoTabs[0];
  const steps = activeTab.steps;

  // 탭 변경 시 상태 초기화
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setCompletedSteps(new Set());
  }, [activeTabId]);

  useEffect(() => {
    if (isPlaying && isOpen) {
      const timer = setInterval(() => {
        setCurrentStep(prev => {
          const next = (prev + 1) % steps.length;
          setCompletedSteps(prevCompleted => new Set([...prevCompleted, steps[prev].id]));
          return next;
        });
      }, 2000);

      return () => clearInterval(timer);
    }
  }, [isPlaying, isOpen]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setCompletedSteps(new Set());
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'customer': return 'from-blue-500 to-blue-600';
      case 'store_owner': return 'from-green-500 to-green-600';
      case 'headquarters': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'customer': return '고객';
      case 'store_owner': return '점주';
      case 'headquarters': return '본사';
      default: return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">편의점 솔루션 시스템 데모</h2>
              <p className="text-blue-100 mt-1">전체 워크플로우를 시각적으로 확인해보세요</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center gap-2 mb-4 overflow-x-auto">
            {demoTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTabId === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                {tab.icon}
                {tab.title}
              </button>
            ))}
          </div>
          
          <div className="text-sm text-gray-600 mb-3">
            {activeTab.description}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlay}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isPlaying 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? '일시정지' : '재생'}
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              처음부터
            </button>

            <div className="flex-1" />

            <div className="text-sm text-gray-600">
              진행률: {currentStep + 1} / {steps.length}
            </div>
          </div>
        </div>

        {/* Demo Content */}
        <div className="flex flex-1 h-full">
          {/* Visual Flow */}
          <div className="flex-1 relative p-8 py-12 bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }} />
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {steps.map((step, index) => 
                step.connections.map(targetId => {
                  const target = steps.find(s => s.id === targetId);
                  if (!target) return null;
                  
                  const startX = (step.position.x / 100) * 100 + '%';
                  const startY = (step.position.y / 100) * 100 + '%';
                  const endX = (target.position.x / 100) * 100 + '%';
                  const endY = (target.position.y / 100) * 100 + '%';
                  
                  const isActive = completedSteps.has(step.id) || index === currentStep;
                  
                  return (
                    <line
                      key={`${step.id}-${targetId}`}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={isActive ? '#3b82f6' : '#d1d5db'}
                      strokeWidth={isActive ? '3' : '2'}
                      strokeDasharray={isActive ? '0' : '5,5'}
                      className="transition-all duration-500"
                    />
                  );
                })
              )}
            </svg>

            {/* Step Nodes */}
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = completedSteps.has(step.id);
              
              return (
                <div
                  key={step.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                    isActive ? 'scale-125 z-20' : isCompleted ? 'scale-110 z-10' : 'scale-100 z-0'
                  }`}
                  style={{
                    left: `${step.position.x}%`,
                    top: `${step.position.y}%`
                  }}
                >
                  <div className={`
                    w-16 h-16 rounded-full bg-gradient-to-br ${getRoleColor(step.role)}
                    flex items-center justify-center text-white shadow-lg
                    ${isActive ? 'animate-pulse shadow-2xl' : ''}
                    ${isCompleted ? 'shadow-xl' : ''}
                  `}>
                    {step.icon}
                  </div>
                  
                  {/* Step Label */}
                  <div className={`
                    absolute top-18 left-1/2 transform -translate-x-1/2 
                    bg-white rounded-lg shadow-lg p-2 min-w-28 max-w-32
                    transition-all duration-500
                    ${isActive ? 'opacity-100 scale-100' : 'opacity-75 scale-90'}
                  `}>
                    <div className="text-center">
                      <div className={`text-xs font-medium mb-1 px-1 py-0.5 rounded ${
                        step.role === 'customer' ? 'bg-blue-100 text-blue-700' :
                        step.role === 'store_owner' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {getRoleLabel(step.role)}
                      </div>
                      <div className="text-xs font-semibold text-gray-900 leading-tight">{step.title}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Floating Data Flow Animation */}
            {isPlaying && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Animated data packets */}
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full animate-ping" 
                     style={{ 
                       left: `${steps[currentStep].position.x}%`, 
                       top: `${steps[currentStep].position.y}%`,
                       animationDelay: '0.5s'
                     }} />
              </div>
            )}
          </div>

          {/* Step Details Panel */}
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <div className="space-y-6">
              {/* Current Step Info */}
              <div className={`p-4 rounded-lg bg-gradient-to-br ${getRoleColor(steps[currentStep].role)} text-white`}>
                <div className="flex items-center gap-3 mb-3">
                  {steps[currentStep].icon}
                  <div>
                    <div className="text-sm opacity-90">{getRoleLabel(steps[currentStep].role)}</div>
                    <div className="font-semibold">{steps[currentStep].title}</div>
                  </div>
                </div>
                <p className="text-sm opacity-90">{steps[currentStep].description}</p>
              </div>

              {/* Progress List */}
              <div>
                <h3 className="text-lg font-semibold mb-2">{activeTab.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{activeTab.description}</p>
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        index === currentStep 
                          ? `bg-gradient-to-r ${getRoleColor(step.role)} text-white shadow-lg`
                          : completedSteps.has(step.id)
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        index === currentStep || completedSteps.has(step.id)
                          ? 'bg-white/20'
                          : 'bg-gray-200'
                      }`}>
                        {completedSteps.has(step.id) && index !== currentStep ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{step.title}</div>
                        <div className={`text-xs truncate ${
                          index === currentStep ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {getRoleLabel(step.role)}
                        </div>
                      </div>
                      {index === currentStep && (
                        <ArrowRight className="w-4 h-4 animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div>
                <h3 className="text-lg font-semibold mb-4">역할 구분</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                    <span className="text-sm">고객 (Customer)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-green-600" />
                    <span className="text-sm">점주 (Store Owner)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-600" />
                    <span className="text-sm">본사 (Headquarters)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDemo;