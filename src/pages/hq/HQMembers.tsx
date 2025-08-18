import React from 'react';
import MemberManagement from '../../components/hq/MemberManagement';

const HQMembers: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">회원 관리</h1>
        <p className="text-purple-100">회원별 쿠폰과 포인트를 관리하고 개별 지급할 수 있습니다</p>
      </div>

      {/* Member Management Component */}
      <MemberManagement />
    </div>
  );
};

export default HQMembers;
