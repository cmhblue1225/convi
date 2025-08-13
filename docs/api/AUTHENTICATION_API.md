# 인증 API 명세서

## 🔐 인증 시스템 개요

편의점 솔루션의 인증 시스템은 Supabase Auth를 기반으로 하며, 역할 기반 접근 제어(RBAC)를 통해 고객, 점주, 본사 관리자의 권한을 분리합니다.

## 👤 사용자 역할 (User Roles)

```typescript
type UserRole = 'customer' | 'store_owner' | 'headquarters';

interface UserProfile {
  id: string;
  user_id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

## 🔑 인증 API 엔드포인트

### 1. 회원가입 (Sign Up)

#### 고객 회원가입
```typescript
// POST /auth/signup
const signUpCustomer = async (data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        role: 'customer',
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone
      }
    }
  });

  if (authError) throw authError;
  return authData;
};
```

**응답 예시:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "customer@example.com",
    "created_at": "2025-08-12T10:00:00Z",
    "user_metadata": {
      "role": "customer",
      "first_name": "홍",
      "last_name": "길동"
    }
  },
  "session": {
    "access_token": "jwt-token-here",
    "refresh_token": "refresh-token-here",
    "expires_in": 3600
  }
}
```

#### 점주 회원가입
```typescript
const signUpStoreOwner = async (data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  store_info: {
    name: string;
    address: string;
    phone: string;
    business_license: string;
  };
}) => {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        role: 'store_owner',
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        store_info: data.store_info
      }
    }
  });

  if (error) throw error;
  return authData;
};
```

### 2. 로그인 (Sign In)

```typescript
// POST /auth/signin
const signIn = async (credentials: {
  email: string;
  password: string;
}) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password
  });

  if (error) throw error;
  return data;
};
```

**응답 예시:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "role": "customer"
  },
  "session": {
    "access_token": "jwt-token-here",
    "refresh_token": "refresh-token-here",
    "expires_in": 3600,
    "expires_at": 1691842800
  }
}
```

### 3. 로그아웃 (Sign Out)

```typescript
// POST /auth/signout
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
```

### 4. 토큰 갱신 (Refresh Token)

```typescript
// POST /auth/refresh
const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return data;
};
```

### 5. 비밀번호 재설정 (Password Reset)

```typescript
// POST /auth/reset-password
const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  if (error) throw error;
};

// POST /auth/update-password
const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
};
```

## 👥 프로필 관리 API

### 1. 프로필 조회 (Get Profile)

```typescript
// GET /api/profile
const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};
```

### 2. 프로필 업데이트 (Update Profile)

```typescript
// PUT /api/profile
const updateProfile = async (
  userId: string, 
  updates: Partial<UserProfile>
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

**요청 예시:**
```json
{
  "first_name": "홍길동",
  "phone": "010-1234-5678",
  "notification_settings": {
    "email_notifications": true,
    "push_notifications": true,
    "order_updates": true
  }
}
```

### 3. 아바타 업로드 (Upload Avatar)

```typescript
// POST /api/profile/avatar
const uploadAvatar = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // 파일 업로드
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  // 공개 URL 생성
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // 프로필 업데이트
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

## 🛡️ 인증 미들웨어

### 1. 토큰 검증

```typescript
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: '인증 처리 중 오류가 발생했습니다' });
  }
};
```

### 2. 역할 기반 접근 제어

```typescript
const requireRole = (allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', req.user.id)
        .single();

      if (!profile || !allowedRoles.includes(profile.role)) {
        return res.status(403).json({ error: '접근 권한이 없습니다' });
      }

      req.userRole = profile.role;
      next();
    } catch (error) {
      res.status(500).json({ error: '권한 확인 중 오류가 발생했습니다' });
    }
  };
};

// 사용 예시
app.get('/api/hq/stores', 
  authMiddleware, 
  requireRole(['headquarters']), 
  getStoresHandler
);
```

## 🔒 보안 정책

### Row Level Security (RLS) 정책

```sql
-- 프로필 테이블 RLS 정책
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 본사는 모든 프로필 조회 가능
CREATE POLICY "HQ can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'headquarters'
        )
    );
```

### JWT 토큰 설정

```typescript
// Supabase 클라이언트 설정
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
```

## 📱 소셜 로그인 (선택적)

### 카카오 로그인

```typescript
const signInWithKakao = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) throw error;
  return data;
};
```

### 네이버 로그인

```typescript
const signInWithNaver = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'naver',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) throw error;
  return data;
};
```

## 🔄 세션 관리

### 세션 상태 추적

```typescript
// 인증 상태 변경 감지
supabase.auth.onAuthStateChange((event, session) => {
  switch (event) {
    case 'SIGNED_IN':
      console.log('사용자 로그인:', session?.user?.email);
      // 사용자 정보 로드
      loadUserProfile(session?.user?.id);
      break;
      
    case 'SIGNED_OUT':
      console.log('사용자 로그아웃');
      // 로컬 상태 정리
      clearUserData();
      break;
      
    case 'TOKEN_REFRESHED':
      console.log('토큰 갱신됨');
      break;
      
    case 'USER_UPDATED':
      console.log('사용자 정보 업데이트됨');
      break;
  }
});
```

### 자동 로그아웃

```typescript
// 비활성 시간 후 자동 로그아웃
let inactivityTimer: NodeJS.Timeout;

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    supabase.auth.signOut();
    alert('비활성 상태로 인해 자동 로그아웃되었습니다.');
  }, 30 * 60 * 1000); // 30분
};

// 사용자 활동 감지
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
```

## 📊 인증 API 응답 코드

| 상태 코드 | 설명 | 예시 상황 |
|----------|------|----------|
| 200 | 성공 | 로그인 성공, 프로필 조회 성공 |
| 201 | 생성됨 | 회원가입 성공 |
| 400 | 잘못된 요청 | 필수 필드 누락, 잘못된 이메일 형식 |
| 401 | 인증 실패 | 잘못된 비밀번호, 만료된 토큰 |
| 403 | 권한 없음 | 역할 권한 부족 |
| 404 | 찾을 수 없음 | 존재하지 않는 사용자 |
| 409 | 충돌 | 이미 존재하는 이메일 |
| 422 | 처리할 수 없는 엔티티 | 비밀번호 정책 위반 |
| 500 | 서버 오류 | 데이터베이스 연결 실패 |

## 🧪 테스트 케이스

### 회원가입 테스트

```typescript
describe('Authentication API', () => {
  test('고객 회원가입 성공', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'securePassword123!',
      first_name: '테스트',
      last_name: '사용자'
    };

    const result = await signUpCustomer(userData);
    
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(userData.email);
    expect(result.session).toBeDefined();
  });

  test('중복 이메일 회원가입 실패', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'password123',
      first_name: '테스트',
      last_name: '사용자'
    };

    await expect(signUpCustomer(userData))
      .rejects
      .toThrow('User already registered');
  });
});
```

---
**편의점 종합 솔루션 v2.0** | 최신 업데이트: 2025-08-13