import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">개인정보 처리방침</h1>
            <p className="text-gray-600">
              Convi는 고객의 개인정보를 소중히 보호합니다
            </p>
            <p className="text-sm text-gray-500 mt-2">
              시행일자: 2024년 1월 1일
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">제1조 (개인정보의 처리목적)</h2>
              <p className="text-gray-700 mb-4">
                Convi는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지 목적</li>
                <li>재화 또는 서비스 제공: 물품배송, 서비스 제공, 계약서·청구서 발송, 콘텐츠 제공, 맞춤서비스 제공, 본인인증, 요금결제·정산 목적</li>
                <li>고충처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보 목적</li>
                <li>마케팅 및 광고에의 활용: 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공, 서비스의 유효성 확인, 접속빈도 파악 또는 회원의 서비스 이용에 대한 통계</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">제2조 (개인정보의 처리 및 보유기간)</h2>
              <p className="text-gray-700 mb-4">
                Convi는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">구체적인 개인정보 처리 및 보유 기간</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>회원 정보: 회원 탈퇴 시까지 (단, 관계법령에 의한 정보보유 사유가 발생할 경우 해당 기간 종료시까지)</li>
                  <li>결제 정보: 5년 (전자상거래법)</li>
                  <li>배송 정보: 배송 완료 후 3개월</li>
                  <li>고객 문의 정보: 처리 완료 후 3년</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">제3조 (개인정보의 제3자 제공)</h2>
              <p className="text-gray-700 mb-4">
                Convi는 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-800 font-medium">
                  현재 Convi는 개인정보를 제3자에게 제공하지 않습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">제4조 (개인정보처리 위탁)</h2>
              <p className="text-gray-700 mb-4">
                Convi는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">위탁받는 자</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">위탁하는 업무의 내용</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">결제대행업체</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">결제 처리 및 관리</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">클라우드 서비스 제공업체</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">데이터 저장 및 관리</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">제5조 (정보주체의 권리·의무 및 행사방법)</h2>
              <p className="text-gray-700 mb-4">
                정보주체는 Convi에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>개인정보 처리현황 통지요구</li>
                <li>개인정보 열람요구</li>
                <li>개인정보 정정·삭제요구</li>
                <li>개인정보 처리정지요구</li>
              </ul>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  <strong>권리 행사 방법:</strong> 개인정보보호법 시행규칙 별지 제8호 서식에 따라 작성하여 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며, Convi는 이에 대해 지체없이 조치하겠습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">제6조 (개인정보의 안전성 확보조치)</h2>
              <p className="text-gray-700 mb-4">
                Convi는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적/물리적 조치를 하고 있습니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>개인정보 취급 직원의 최소화 및 교육</li>
                <li>개인정보에 대한 접근 제한</li>
                <li>개인정보의 암호화</li>
                <li>해킹 등에 대한 기술적 대책</li>
                <li>개인정보처리시스템 등의 접근권한 관리</li>
                <li>개인정보의 안전한 보관을 위한 보관시설의 마련 또는 잠금장치의 설치</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">제7조 (개인정보 보호책임자)</h2>
              <p className="text-gray-700 mb-4">
                Convi는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">▶ 개인정보 보호책임자</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>성명:</strong> 홍길동</li>
                  <li><strong>직책:</strong> 개발팀장</li>
                  <li><strong>연락처:</strong> privacy@convi.co.kr</li>
                </ul>
                <p className="text-sm text-gray-600 mt-4">
                  ※ 개인정보보호 담당부서로 연결됩니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">제8조 (개인정보 처리방침 변경)</h2>
              <p className="text-gray-700">
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-center text-sm text-gray-500">
                본 방침은 2024년 1월 1일부터 시행됩니다.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                개인정보 관련 문의사항
              </h3>
              <p className="text-blue-800 mb-4">
                개인정보 처리방침에 대한 문의나 개선사항이 있으시면 언제든지 연락해 주시기 바랍니다.
              </p>
              <p className="text-blue-900 font-medium">
                📧 privacy@convi.co.kr
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;