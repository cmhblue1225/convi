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
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
    loginForm.reset();
    signupForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            편의점 솔루션
          </h1>
          <p className="text-gray-600">
            {isLogin ? '계정에 로그인하세요' : '새 계정을 만드세요'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {isLogin ? (
            // 로그인 폼
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  {...loginForm.register('email')}
                  type="email"
                  id="email"
                  className="input w-full"
                  placeholder="이메일을 입력하세요"
                  disabled={isLoading}
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  {...loginForm.register('password')}
                  type="password"
                  id="password"
                  className="input w-full"
                  placeholder="비밀번호를 입력하세요"
                  disabled={isLoading}
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                loading={isLoading}
              >
                로그인
              </Button>
            </form>
          ) : (
            // 회원가입 폼
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    {...signupForm.register('firstName')}
                    type="text"
                    id="firstName"
                    className="input w-full"
                    placeholder="이름"
                    disabled={isLoading}
                  />
                  {signupForm.formState.errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {signupForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    성
                  </label>
                  <input
                    {...signupForm.register('lastName')}
                    type="text"
                    id="lastName"
                    className="input w-full"
                    placeholder="성"
                    disabled={isLoading}
                  />
                  {signupForm.formState.errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {signupForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  {...signupForm.register('email')}
                  type="email"
                  id="email"
                  className="input w-full"
                  placeholder="이메일을 입력하세요"
                  disabled={isLoading}
                />
                {signupForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  {...signupForm.register('password')}
                  type="password"
                  id="password"
                  className="input w-full"
                  placeholder="비밀번호를 입력하세요"
                  disabled={isLoading}
                />
                {signupForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <input
                  {...signupForm.register('confirmPassword')}
                  type="password"
                  id="confirmPassword"
                  className="input w-full"
                  placeholder="비밀번호를 다시 입력하세요"
                  disabled={isLoading}
                />
                {signupForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {signupForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  역할
                </label>
                <select
                  {...signupForm.register('role')}
                  id="role"
                  className="input w-full"
                  disabled={isLoading}
                >
                  <option value="customer">고객</option>
                  <option value="store_owner">점주</option>
                  <option value="headquarters">본사 관리자</option>
                </select>
                {signupForm.formState.errors.role && (
                  <p className="mt-1 text-sm text-red-600">
                    {signupForm.formState.errors.role.message}
                  </p>
                )}
              </div>

              {/* 점주 회원가입 시 지점 정보 입력 필드 */}
              {signupForm.watch('role') === 'store_owner' && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900">지점 정보</h3>
                  
                  <div>
                    <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                      지점명 *
                    </label>
                    <input
                      {...signupForm.register('storeName')}
                      type="text"
                      id="storeName"
                      className="input w-full"
                      placeholder="예: 강남점, 홍대점"
                      disabled={isLoading}
                    />
                    {signupForm.formState.errors.storeName && (
                      <p className="mt-1 text-sm text-red-600">
                        {signupForm.formState.errors.storeName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700 mb-2">
                      지점 주소 *
                    </label>
                    <input
                      {...signupForm.register('storeAddress')}
                      type="text"
                      id="storeAddress"
                      className="input w-full"
                      placeholder="지점 주소를 입력하세요"
                      disabled={isLoading}
                    />
                    {signupForm.formState.errors.storeAddress && (
                      <p className="mt-1 text-sm text-red-600">
                        {signupForm.formState.errors.storeAddress.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="storePhone" className="block text-sm font-medium text-gray-700 mb-2">
                      지점 전화번호 *
                    </label>
                    <input
                      {...signupForm.register('storePhone')}
                      type="tel"
                      id="storePhone"
                      className="input w-full"
                      placeholder="02-1234-5678"
                      disabled={isLoading}
                    />
                    {signupForm.formState.errors.storePhone && (
                      <p className="mt-1 text-sm text-red-600">
                        {signupForm.formState.errors.storePhone.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                loading={isLoading}
              >
                회원가입
              </Button>
            </form>
          )}

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              <button
                type="button"
                onClick={switchMode}
                className="ml-2 text-primary-600 hover:text-primary-500 font-medium"
                disabled={isLoading}
              >
                {isLogin ? '회원가입' : '로그인'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;