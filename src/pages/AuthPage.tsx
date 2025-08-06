import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../stores/common/authStore';
import type { UserRole } from '../types/common';

// 로그인 스키마
const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

// 회원가입 스키마
const signupSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, '이름을 입력해주세요'),
  lastName: z.string().min(1, '성을 입력해주세요'),
  role: z.enum(['customer', 'store_owner', 'headquarters']),
  // 점주 회원가입 시 지점 정보
  storeName: z.string().optional(),
  storeAddress: z.string().optional(),
  storePhone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
}).refine((data) => {
  // 점주인 경우 지점 정보 필수
  if (data.role === 'store_owner') {
    return data.storeName && data.storeAddress && data.storePhone;
  }
  return true;
}, {
  message: "점주 회원가입 시 지점 정보를 모두 입력해주세요",
  path: ["storeName"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, isLoading, isAuthenticated, user } = useAuthStore();

  const from = location.state?.from?.pathname || '/';

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    console.log('🔍 AuthPage useEffect - isAuthenticated:', isAuthenticated, 'user:', user);
    
    if (isAuthenticated && user) {
      console.log('🎯 사용자 역할:', user.role);
      
      const redirectPath = user.role === 'customer' ? '/customer' 
        : user.role === 'store_owner' ? '/store' 
        : user.role === 'headquarters' ? '/hq' 
        : '/';
      
      console.log('🚀 리다이렉트 경로:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onLoginSubmit = async (data: LoginFormData) => {
    setError(null);
    setSuccess(null);
    
    try {
      const result = await signIn(data.email, data.password);
      
      if (result.success) {
        setSuccess('로그인 성공! 잠시만 기다려주세요...');
        // 로그인 성공 시 useEffect에서 자동으로 리다이렉트됨
      } else {
        setError(result.error || '로그인에 실패했습니다');
      }
    } catch (error) {
      setError('로그인 중 예상치 못한 오류가 발생했습니다.');
      console.error('로그인 오류:', error);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setError(null);
    setSuccess(null);
    
    try {
      const userData = {
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
        // 점주인 경우 지점 정보 추가
        ...(data.role === 'store_owner' && {
          storeName: data.storeName,
          storeAddress: data.storeAddress,
          storePhone: data.storePhone,
        }),
      };
      
      const result = await signUp(data.email, data.password, userData);
      
      if (result.success) {
        if (data.role === 'store_owner') {
          setSuccess('점주 회원가입이 완료되었습니다! 지점이 성공적으로 생성되었습니다. 잠시만 기다려주세요...');
        } else {
          setSuccess('회원가입이 완료되었습니다! 잠시만 기다려주세요...');
        }
        // 회원가입 성공 시 자동으로 로그인되거나 이메일 확인 메시지 표시
        // useEffect에서 자동으로 리다이렉트됨
      } else {
        setError(result.error || '회원가입에 실패했습니다');
      }
    } catch (error) {
      setError('회원가입 중 예상치 못한 오류가 발생했습니다.');
      console.error('회원가입 오류:', error);
    }
  };

  const switchMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setError(null);
      setSuccess(null);
      loginForm.reset();
      signupForm.reset();
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* 배경 애니메이션 요소들 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-yellow-400/15 to-orange-400/15 rounded-full blur-2xl animate-float delay-500"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-green-400/15 to-teal-400/15 rounded-full blur-2xl animate-float delay-1000"></div>
      </div>

      {/* 메인 컨테이너 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* 로고 섹션 */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl animate-glow">
              <span className="text-3xl animate-bounce-gentle">🏪</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 animate-fade-in">
              편의점 솔루션
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              {isLogin ? '다시 만나서 반가워요! 👋' : '함께 시작해요! 🚀'}
            </p>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-slow"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse-slow delay-300"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse-slow delay-600"></div>
            </div>
          </div>

          {/* Auth Form Card */}
          <div className={`bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 transition-all duration-500 ${
            isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
          }`}>
            {/* 상태 메시지 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-bounce-gentle">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  <p className="text-green-600 text-sm font-medium">{success}</p>
                </div>
              </div>
            )}

            {isLogin ? (
              // 로그인 폼
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    📧 이메일
                  </label>
                  <div className="relative">
                    <input
                      {...loginForm.register('email')}
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="이메일을 입력하세요"
                      disabled={isLoading}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-500 animate-pulse">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    🔒 비밀번호
                  </label>
                  <div className="relative">
                    <input
                      {...loginForm.register('password')}
                      type="password"
                      id="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="비밀번호를 입력하세요"
                      disabled={isLoading}
                    />
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500 animate-pulse">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl animate-glow"
                  disabled={isLoading}
                  loading={isLoading}
                >
                  {isLoading ? '로그인 중...' : '🚀 로그인'}
                </Button>
              </form>
            ) : (
              // 회원가입 폼
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700">
                      👤 이름
                    </label>
                    <input
                      {...signupForm.register('firstName')}
                      type="text"
                      id="firstName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="이름"
                      disabled={isLoading}
                    />
                    {signupForm.formState.errors.firstName && (
                      <p className="text-sm text-red-500 animate-pulse">
                        {signupForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">
                      👤 성
                    </label>
                    <input
                      {...signupForm.register('lastName')}
                      type="text"
                      id="lastName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="성"
                      disabled={isLoading}
                    />
                    {signupForm.formState.errors.lastName && (
                      <p className="text-sm text-red-500 animate-pulse">
                        {signupForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    📧 이메일
                  </label>
                  <input
                    {...signupForm.register('email')}
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="이메일을 입력하세요"
                    disabled={isLoading}
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-sm text-red-500 animate-pulse">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    🔒 비밀번호
                  </label>
                  <input
                    {...signupForm.register('password')}
                    type="password"
                    id="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="비밀번호를 입력하세요"
                    disabled={isLoading}
                  />
                  {signupForm.formState.errors.password && (
                    <p className="text-sm text-red-500 animate-pulse">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                    🔐 비밀번호 확인
                  </label>
                  <input
                    {...signupForm.register('confirmPassword')}
                    type="password"
                    id="confirmPassword"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="비밀번호를 다시 입력하세요"
                    disabled={isLoading}
                  />
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 animate-pulse">
                      {signupForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="block text-sm font-semibold text-gray-700">
                    🎭 역할 선택
                  </label>
                  <select
                    {...signupForm.register('role')}
                    id="role"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    disabled={isLoading}
                  >
                    <option value="customer">🛒 고객</option>
                    <option value="store_owner">🏪 점주</option>
                    <option value="headquarters">🏢 본사 관리자</option>
                  </select>
                  {signupForm.formState.errors.role && (
                    <p className="text-sm text-red-500 animate-pulse">
                      {signupForm.formState.errors.role.message}
                    </p>
                  )}
                </div>

                {/* 점주 회원가입 시 지점 정보 입력 필드 */}
                {signupForm.watch('role') === 'store_owner' && (
                  <div className="space-y-4 border-t border-gray-200 pt-6 animate-slide-down">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🏪</span>
                      <h3 className="text-lg font-semibold text-gray-900">지점 정보</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="storeName" className="block text-sm font-semibold text-gray-700">
                        🏷️ 지점명 *
                      </label>
                      <input
                        {...signupForm.register('storeName')}
                        type="text"
                        id="storeName"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="예: 강남점, 홍대점"
                        disabled={isLoading}
                      />
                      {signupForm.formState.errors.storeName && (
                        <p className="text-sm text-red-500 animate-pulse">
                          {signupForm.formState.errors.storeName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="storeAddress" className="block text-sm font-semibold text-gray-700">
                        📍 지점 주소 *
                      </label>
                      <input
                        {...signupForm.register('storeAddress')}
                        type="text"
                        id="storeAddress"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="지점 주소를 입력하세요"
                        disabled={isLoading}
                      />
                      {signupForm.formState.errors.storeAddress && (
                        <p className="text-sm text-red-500 animate-pulse">
                          {signupForm.formState.errors.storeAddress.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="storePhone" className="block text-sm font-semibold text-gray-700">
                        📞 지점 전화번호 *
                      </label>
                      <input
                        {...signupForm.register('storePhone')}
                        type="tel"
                        id="storePhone"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="02-1234-5678"
                        disabled={isLoading}
                      />
                      {signupForm.formState.errors.storePhone && (
                        <p className="text-sm text-red-500 animate-pulse">
                          {signupForm.formState.errors.storePhone.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full py-4 text-lg font-bold bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl animate-glow"
                  disabled={isLoading}
                  loading={isLoading}
                >
                  {isLoading ? '회원가입 중...' : '✨ 회원가입'}
                </Button>
              </form>
            )}

            {/* Switch Mode */}
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={switchMode}
                className="mt-4 w-full py-4 px-6 border-2 border-gradient-to-r from-blue-300 to-purple-300 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 hover:border-purple-400 transition-all duration-300 font-bold transform hover:scale-105 shadow-lg hover:shadow-xl"
                disabled={isLoading || isAnimating}
              >
                {isLogin ? '🆕 새 계정 만들기' : '🔐 기존 계정으로 로그인'}
              </button>
            </div>
          </div>

          {/* 하단 정보 */}
          <div className="text-center mt-8 text-sm text-gray-500 animate-fade-in">
            <p className="font-medium">편의점 솔루션 v2.0</p>
            <p className="text-xs mt-1 opacity-75">최신 기술로 만든 스마트 편의점 관리 시스템 ✨</p>
            <div className="mt-3 flex justify-center space-x-1">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse-slow"></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse-slow delay-200"></div>
              <div className="w-1 h-1 bg-pink-400 rounded-full animate-pulse-slow delay-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;