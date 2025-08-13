import React from 'react';

const Careers: React.FC = () => {
  const jobOpenings = [
    {
      id: 1,
      title: '프론트엔드 개발자',
      department: '개발팀',
      location: '서울',
      type: '정규직',
      experience: '경력 2-5년',
      skills: ['React', 'TypeScript', 'JavaScript'],
    },
    {
      id: 2,
      title: '백엔드 개발자',
      department: '개발팀',
      location: '서울',
      type: '정규직',
      experience: '경력 3-7년',
      skills: ['Node.js', 'Python', 'PostgreSQL'],
    },
    {
      id: 3,
      title: 'UX/UI 디자이너',
      department: '디자인팀',
      location: '서울',
      type: '정규직',
      experience: '경력 2-4년',
      skills: ['Figma', 'Sketch', 'Adobe Creative Suite'],
    },
    {
      id: 4,
      title: '마케팅 매니저',
      department: '마케팅팀',
      location: '서울',
      type: '정규직',
      experience: '경력 3-6년',
      skills: ['디지털 마케팅', 'SNS 마케팅', '데이터 분석'],
    },
  ];

  const benefits = [
    {
      icon: '💰',
      title: '경쟁력 있는 연봉',
      description: '업계 최고 수준의 연봉과 성과급'
    },
    {
      icon: '🏥',
      title: '건강한 워라밸',
      description: '유연근무제, 재택근무, 충분한 휴가'
    },
    {
      icon: '📚',
      title: '성장 지원',
      description: '교육비 지원, 컨퍼런스 참가비 지원'
    },
    {
      icon: '🍕',
      title: '복지 혜택',
      description: '식대, 간식, 건강검진, 체육시설'
    },
    {
      icon: '🚀',
      title: '스톡옵션',
      description: '회사 성장과 함께하는 스톡옵션 제공'
    },
    {
      icon: '🌟',
      title: '자율적 문화',
      description: '수평적 조직문화, 자율적 업무 환경'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">채용 정보</h1>
            <p className="text-lg text-gray-600 mb-8">
              Convi와 함께 편의점 쇼핑의 미래를 만들어갈 동료를 찾습니다
            </p>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-12 px-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4">지금이 최고의 합류 시기입니다!</h2>
              <p className="text-lg opacity-90">
                빠르게 성장하는 스타트업에서 함께 도전하고 성장할 기회
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">복지 혜택</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="text-3xl mb-3">{benefit.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">채용 공고</h2>
            <div className="space-y-6">
              {jobOpenings.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 mr-3">{job.title}</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                          {job.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center text-sm text-gray-600 mb-3">
                        <span className="mr-4">📍 {job.location}</span>
                        <span className="mr-4">🏢 {job.department}</span>
                        <span>⏰ {job.experience}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <button className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        지원하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">채용 프로세스</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">서류 전형</h3>
                <p className="text-sm text-gray-600">이력서 및 포트폴리오 검토</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">1차 면접</h3>
                <p className="text-sm text-gray-600">실무진과의 기술 면접</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">2차 면접</h3>
                <p className="text-sm text-gray-600">팀 리더와의 컬처핏 면접</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-semibold">✓</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">최종 합격</h3>
                <p className="text-sm text-gray-600">입사 일정 협의</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                원하는 포지션이 없나요?
              </h3>
              <p className="text-gray-600 mb-6">
                언제든지 자유롭게 지원해주세요. 적합한 기회가 생기면 연락드리겠습니다.
              </p>
              <button className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors">
                자유 지원하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;