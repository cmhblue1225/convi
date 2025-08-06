import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
            <span className="text-6xl font-bold text-primary-600">404</span>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-600 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full">
              홈으로 돌아가기
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            이전 페이지로 돌아가기
          </button>
        </div>

        {/* Help */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">도움이 필요하신가요?</h3>
          <p className="text-sm text-gray-600 mb-3">
            문제가 지속되면 고객센터에 문의해주세요.
          </p>
          <Link to="/auth" className="text-sm text-primary-600 hover:text-primary-500">
            로그인하기 →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 