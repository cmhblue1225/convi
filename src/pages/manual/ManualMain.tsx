import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ManualMain: React.FC = () => {
  const navigate = useNavigate();

  const manualSections = [
    {
      id: 'customer',
      title: '고객 사용자 매뉴얼',
      description: '상품 주문부터 결제까지, 고객을 위한 완벽한 가이드',
      icon: '👥',
      color: 'from-blue-500 to-purple-600',
      features: [
        '회원가입 및 로그인',
        '지점 선택 및 상품 둘러보기',
        '장바구니 및 주문하기',
        '결제 및 포인트 사용',
        '주문 추적 및 관리',
        '환불 및 반품 신청'
      ],
      route: '/manual/customer'
    },
    {
      id: 'store',
      title: '점주 사용자 매뉴얼',
      description: '주문 관리부터 매출 분석까지, 점주를 위한 종합 가이드',
      icon: '🏪',
      color: 'from-green-500 to-teal-600',
      features: [
        '대시보드 및 실시간 현황',
        '주문 접수 및 처리',
        '재고 관리 및 발주',
        '매출 분석 및 보고서',
        '고객 환불 처리',
        '시스템 설정 관리'
      ],
      route: '/manual/store'
    },
    {
      id: 'hq',
      title: '본사 관리자 매뉴얼',
      description: '전체 지점 관리부터 통합 분석까지, 본사를 위한 관리 가이드',
      icon: '🏢',
      color: 'from-red-500 to-pink-600',
      features: [
        '지점 관리 및 승인',
        '상품 마스터 관리',
        '물류 및 배송 관리',
        '전사 매출 분석',
        '프로모션 및 정책 관리',
        '시스템 모니터링'
      ],
      route: '/manual/hq'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
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

  const cardVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">📋 사용자 매뉴얼</h1>
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
        className="container mx-auto px-4 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 인트로 섹션 */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            편의점 종합 솔루션
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> 
              사용자 가이드
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            고객, 점주, 본사 관리자를 위한 완벽한 시스템 사용법을 
            <br />
            인터랙티브한 가이드로 쉽고 재미있게 배워보세요!
          </p>
        </motion.div>

        {/* 매뉴얼 카드들 */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {manualSections.map((section, index) => (
            <motion.div
              key={section.id}
              variants={itemVariants}
              whileHover="hover"
              className="relative"
            >
              <motion.div
                variants={cardVariants}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-2xl"
                onClick={() => navigate(section.route)}
              >
                {/* 그라디언트 헤더 */}
                <div className={`bg-gradient-to-r ${section.color} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 text-6xl opacity-20">
                    {section.icon}
                  </div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-4">{section.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{section.title}</h3>
                    <p className="text-blue-100">{section.description}</p>
                  </div>
                </div>

                {/* 기능 목록 */}
                <div className="p-6">
                  <ul className="space-y-3">
                    {section.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * featureIndex }}
                        className="flex items-center text-gray-700"
                      >
                        <span className="text-green-500 mr-3">✓</span>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* 액션 버튼 */}
                <div className="p-6 pt-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full bg-gradient-to-r ${section.color} text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg`}
                  >
                    매뉴얼 시작하기 →
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* 추가 정보 섹션 */}
        <motion.div
          variants={itemVariants}
          className="mt-16 bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              💡 매뉴얼 사용 팁
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="font-semibold text-gray-900 mb-2">단계별 가이드</h4>
                <p className="text-gray-600 text-sm">실제 사용 시나리오를 따라 단계별로 학습</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🎮</div>
                <h4 className="font-semibold text-gray-900 mb-2">인터랙티브 체험</h4>
                <p className="text-gray-600 text-sm">클릭하고 체험하며 자연스럽게 학습</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">📱</div>
                <h4 className="font-semibold text-gray-900 mb-2">실제 화면 시뮬레이션</h4>
                <p className="text-gray-600 text-sm">실제 시스템과 동일한 화면으로 연습</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 고객센터 정보 */}
        <motion.div
          variants={itemVariants}
          className="mt-12 text-center"
        >
          <p className="text-gray-600">
            추가 도움이 필요하시나요? 
            <button
              onClick={() => navigate('/support/customer')}
              className="text-blue-600 hover:text-blue-800 ml-2 font-semibold"
            >
              고객센터 문의하기 →
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ManualMain;