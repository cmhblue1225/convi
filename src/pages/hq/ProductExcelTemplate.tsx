import React, { useState } from 'react';
import ExcelTemplateDownload from '../../components/hq/ExcelTemplateDownload';
import ExcelUpload from '../../components/hq/ExcelUpload';

const ProductExcelTemplate: React.FC = () => {
  const [uploadResults, setUploadResults] = useState<any[]>([]);

  const handleUploadComplete = (results: any[]) => {
    setUploadResults(results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 헤더 섹션 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            📊 상품 일괄 등록 시스템
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            엑셀 파일을 사용하여 상품을 일괄으로 등록할 수 있습니다. 
            <br className="hidden md:block" />
            템플릿을 다운로드하여 상품 정보를 입력한 후 업로드하면 상품이 자동으로 등록됩니다.
          </p>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16">
          {/* 왼쪽: 템플릿 다운로드 */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 h-fit">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">템플릿 다운로드</h3>
                <p className="text-gray-600 text-sm">엑셀 템플릿을 다운로드하여 상품 정보를 입력하세요</p>
              </div>
              <ExcelTemplateDownload />
            </div>
          </div>

          {/* 중앙: 사용 가이드 */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">상품 등록 가이드</h3>
                <p className="text-gray-600">엑셀 파일 작성 방법과 주의사항을 확인하세요</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 필수 입력 항목 */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">!</span>
                    </div>
                    <h4 className="font-bold text-red-800 text-lg">필수 입력 항목</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-red-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>상품명</strong> - 고객에게 표시될 상품 이름</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>카테고리</strong> - 상품 분류 (음료, 과자, 생활용품 등)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>단위</strong> - 판매 단위 (개, 봉, kg, L 등)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>기본가격</strong> - 상품 판매 가격</span>
                    </li>
                  </ul>
                </div>

                {/* 선택 입력 항목 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">💡</span>
                    </div>
                    <h4 className="font-bold text-blue-800 text-lg">선택 입력 항목</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-blue-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>브랜드</strong> - 상품 브랜드명</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>제조사</strong> - 제조 회사명</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>원가</strong> - 상품 원가 (수익률 계산용)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>세율</strong> - 부가세율 (기본값: 0.1 = 10%)</span>
                    </li>
                  </ul>
                </div>

                {/* 고급 설정 */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">⚙️</span>
                    </div>
                    <h4 className="font-bold text-purple-800 text-lg">고급 설정</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-purple-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>영양정보</strong> - JSON 형식으로 입력</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>알레르기정보</strong> - 쉼표로 구분하여 입력</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>유통기한</strong> - 일 단위로 입력</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>준비시간</strong> - 분 단위로 입력</span>
                    </li>
                  </ul>
                </div>

                {/* 이미지 관리 */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">📸</span>
                    </div>
                    <h4 className="font-bold text-emerald-800 text-lg">이미지 관리</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-emerald-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>이미지URL</strong> - 쉼표(,)로 구분하여 여러 이미지 입력</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>활성화여부</strong> - Y(활성) 또는 N(비활성)</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 팁 섹션 */}
              <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">💡</span>
                  </div>
                  <h4 className="font-bold text-amber-800 text-lg">유용한 팁</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-800">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>샘플 데이터를 참고하여 입력 형식을 확인하세요</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>영양정보는 정확한 JSON 형식으로 입력해야 합니다</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>이미지URL은 유효한 링크여야 합니다</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>대량 상품 등록 시 템플릿을 복사하여 사용하세요</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 엑셀 업로드 섹션 */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">엑셀 파일 업로드</h3>
              <p className="text-gray-600">작성한 엑셀 파일을 업로드하여 상품을 일괄 등록하세요</p>
            </div>
            <ExcelUpload onUploadComplete={handleUploadComplete} />
          </div>
        </div>

        {/* 업로드 결과 요약 */}
        {uploadResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">📊 업로드 결과 요약</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {uploadResults.filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-green-700 font-medium">성공</div>
                  <div className="text-green-600 text-sm mt-1">정상 등록됨</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-200">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {uploadResults.filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-red-700 font-medium">실패</div>
                  <div className="text-red-600 text-sm mt-1">오류 발생</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {uploadResults.length}
                  </div>
                  <div className="text-blue-700 font-medium">전체</div>
                  <div className="text-blue-600 text-sm mt-1">처리된 항목</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductExcelTemplate;
