import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase 설정 - 환경 변수가 없으면 기본값 사용
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jjardndxllxysbdhpuow.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqYXJkbmR4bGx4eXNiZGhwdW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzczNzIsImV4cCI6MjA2OTUxMzM3Mn0.L0ZG1Dl92OhkyoyGhS424OxQKpJ681AmfD-GxUJTAH0';

// URL 유효성 검사
if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
  console.error('❌ Supabase URL이 설정되지 않았습니다.');
  throw new Error('Supabase URL이 설정되지 않았습니다. .env 파일을 확인해주세요.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key') {
  console.error('❌ Supabase Anon Key가 설정되지 않았습니다.');
  throw new Error('Supabase Anon Key가 설정되지 않았습니다. .env 파일을 확인해주세요.');
}

console.log('🔗 Supabase 클라이언트 초기화:', { supabaseUrl, hasAnonKey: !!supabaseAnonKey });

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,    // 자동 토큰 갱신 활성화 (보편적)
    persistSession: true,      // 세션 지속성 활성화 (localStorage에 저장)
    detectSessionInUrl: true,  // URL에서 세션 감지 활성화
    storage: window.localStorage, // 명시적으로 localStorage 사용
    storageKey: 'supabase.auth.token', // 세션 저장 키
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Auth 헬퍼 함수들
export const auth = {
  // 회원가입
  signUp: async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  // 로그인
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // 로그아웃
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // 현재 세션 가져오기
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // 비밀번호 재설정
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  // 비밀번호 업데이트
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  },
};

// Real-time 구독 헬퍼 함수들
export const realtime = {
  // 주문 실시간 구독
  subscribeToOrders: (callback: (payload: any) => void) => {
    return supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe();
  },

  // 재고 실시간 구독
  subscribeToInventory: (callback: (payload: any) => void) => {
    return supabase
      .channel('inventory')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_products' }, callback)
      .subscribe();
  },

  // 알림 실시간 구독
  subscribeToNotifications: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },
};

// Storage 헬퍼 함수들
export const storage = {
  // 이미지 업로드
  uploadImage: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  },

  // 이미지 URL 가져오기
  getImageUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // 이미지 삭제
  deleteImage: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { data, error };
  },
};

export default supabase;