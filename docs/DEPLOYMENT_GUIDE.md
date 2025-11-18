# 배포 가이드 (Deployment Guide)

## 🚀 배포 개요

편의점 종합 솔루션 v2.0의 **프로덕션 환경 배포**를 위한 완전한 가이드입니다. 이 문서는 개발 환경에서 프로덕션 배포까지의 모든 단계를 다룹니다.

## 📋 배포 전 체크리스트

### 1. 개발 환경 검증
- [ ] 모든 기능 정상 동작 확인
- [ ] 테스트 케이스 통과
- [ ] 빌드 에러 없음
- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 마이그레이션 완료

### 2. 보안 검증
- [ ] API 키 보안 확인
- [ ] 민감한 정보 하드코딩 제거
- [ ] HTTPS 설정 준비
- [ ] CORS 설정 검토
- [ ] 인증/권한 시스템 테스트

### 3. 성능 최적화
- [ ] 번들 크기 최적화
- [ ] 이미지 최적화
- [ ] 코드 스플리팅 적용
- [ ] 캐싱 전략 수립
- [ ] CDN 설정 (필요 시)

## 🏗️ 아키텍처 개요

### 배포 구조
```
Production Architecture

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │────│   (Render)      │────│   (Supabase)    │
│                 │    │                 │    │                 │
│ - React App     │    │ - Node.js API   │    │ - PostgreSQL    │
│ - Static Files  │    │ - Express.js    │    │ - Real-time     │
│ - CDN           │    │ - Middleware    │    │ - File Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                               │
                    ┌─────────────────┐
                    │   External      │
                    │   Services      │
                    │                 │
                    │ - Toss Payments │
                    │ - Email Service │
                    │ - SMS Service   │
                    └─────────────────┘
```

## 🔧 환경별 배포 설정

### 1. 개발 환경 (Development)
```bash
# 환경 변수 (.env.local)
VITE_SUPABASE_URL=https://esbjgvnlqzseomhbsimz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TOSS_CLIENT_KEY=test_client_key
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3001
```

### 2. 스테이징 환경 (Staging)
```bash
# 환경 변수 (.env.staging)
VITE_SUPABASE_URL=https://esbjgvnlqzseomhbsimz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TOSS_CLIENT_KEY=test_client_key
VITE_APP_ENV=staging
VITE_API_BASE_URL=https://staging-api.your-domain.com
```

### 3. 프로덕션 환경 (Production)
```bash
# 환경 변수 (.env.production)
VITE_SUPABASE_URL=https://esbjgvnlqzseomhbsimz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TOSS_CLIENT_KEY=live_client_key
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.your-domain.com
```

## 📦 Frontend 배포 (Vercel)

### 1. Vercel 배포 설정

#### package.json 확인
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

#### Vercel 설정 파일 (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "VITE_TOSS_CLIENT_KEY": "@toss_client_key"
  }
}
```

### 2. 배포 단계

#### Step 1: GitHub 연동
```bash
# GitHub 리포지토리에 코드 push
git add .
git commit -m "feat: 프로덕션 배포 준비"
git push origin main
```

#### Step 2: Vercel 프로젝트 생성
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "New Project" 클릭
3. GitHub 리포지토리 연결
4. Framework Preset: "Vite" 선택
5. Root Directory: "/" 설정

#### Step 3: 환경 변수 설정
```bash
# Vercel Dashboard에서 설정
VITE_SUPABASE_URL=https://esbjgvnlqzseomhbsimz.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_TOSS_CLIENT_KEY=live_client_key
VITE_APP_ENV=production
```

#### Step 4: 배포 실행
```bash
# Vercel CLI 사용 (선택사항)
npm install -g vercel
vercel --prod
```

### 3. 도메인 설정

#### 커스텀 도메인 추가
1. Vercel Dashboard → Project Settings → Domains
2. 도메인 추가: `your-domain.com`
3. DNS 설정:
   ```
   Type: A
   Name: @
   Value: 76.76.19.61
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

#### SSL 인증서 자동 발급
- Vercel이 자동으로 Let's Encrypt SSL 인증서 발급
- HTTPS 자동 리다이렉트 설정

## 🖥️ Backend 배포 (Render)

### 1. Backend 코드 준비

#### Express.js 서버 설정
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// 보안 미들웨어
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: '너무 많은 요청이 발생했습니다.'
});
app.use('/api/', limiter);

// 기본 라우트
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
```

#### package.json 설정
```json
{
  "name": "convenience-store-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.7.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 2. Render 배포

#### Step 1: Render 서비스 생성
1. [Render Dashboard](https://dashboard.render.com/) 접속
2. "New +" → "Web Service" 선택
3. GitHub 리포지토리 연결
4. 설정:
   ```
   Name: convenience-store-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

#### Step 2: 환경 변수 설정
```bash
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-domain.com
SUPABASE_URL=https://esbjgvnlqzseomhbsimz.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
```

#### Step 3: 배포 완료
- 자동 HTTPS 제공
- 무료 티어: 750시간/월 제한
- 커스텀 도메인 설정 가능

## 🗄️ Database 배포 (Supabase)

### 1. Supabase 프로덕션 설정

#### 현재 프로젝트 정보
```
Project ID: esbjgvnlqzseomhbsimz
Project Name: newConvi
Region: ap-southeast-1 (Singapore)
Database: PostgreSQL 15
```

#### 프로덕션 최적화 설정
```sql
-- 성능 최적화
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- 백업 설정 확인
SELECT * FROM pg_stat_archiver;
```

### 2. 데이터베이스 마이그레이션

#### 마이그레이션 스크립트 실행
```bash
# Supabase CLI를 통한 마이그레이션
npx supabase db push --project-ref esbjgvnlqzseomhbsimz
```

#### 초기 데이터 설정
```sql
-- 시스템 설정 초기값
INSERT INTO system_settings (key, value, description) VALUES
('maintenance_mode', 'false', '시스템 점검 모드'),
('max_order_items', '50', '주문당 최대 상품 수'),
('delivery_fee', '3000', '기본 배송비'),
('free_delivery_threshold', '30000', '무료배송 기준금액');

-- 기본 카테고리 설정
INSERT INTO categories (name, description, icon) VALUES
('음료', '음료수 및 커피', '🥤'),
('과자', '과자 및 간식', '🍪'),
('라면', '라면 및 즉석식품', '🍜'),
('생활용품', '일상 생활용품', '🧴');
```

### 3. 보안 설정

#### RLS 정책 활성화 확인
```sql
-- 모든 테이블의 RLS 상태 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE schemaname = 'public';
```

#### API 키 관리
```bash
# 프로덕션용 API 키 생성
Service Role Key: 백엔드 서버에서만 사용
Anon Key: 프론트엔드에서 사용
```

## 🌐 CDN 및 성능 최적화

### 1. 정적 자산 최적화

#### 이미지 최적화
```bash
# 이미지 압축 및 WebP 변환
npm install -g imagemin-cli imagemin-webp
imagemin src/assets/**/*.{jpg,png} --out-dir=dist/assets --plugin=webp
```

#### 번들 크기 분석
```bash
# Bundle analyzer 설치 및 실행
npm install --save-dev vite-bundle-analyzer
npm run build
npx vite-bundle-analyzer
```

### 2. 캐싱 전략

#### HTTP 캐시 헤더 설정
```javascript
// Vercel에서 _headers 파일 생성
/*
  Cache-Control: public, max-age=31536000, immutable

/api/*
  Cache-Control: no-cache

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

#### Service Worker 설정 (선택사항)
```javascript
// sw.js
const CACHE_NAME = 'convenience-store-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## 📊 모니터링 및 로깅

### 1. 애플리케이션 모니터링

#### Vercel Analytics 설정
```typescript
// pages/_app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

#### 에러 추적 (Sentry)
```bash
npm install @sentry/react @sentry/tracing
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 1.0,
});
```

### 2. 로그 관리

#### Structured Logging
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

module.exports = logger;
```

## 🔒 보안 체크리스트

### 1. 프론트엔드 보안
- [ ] 환경 변수에 민감한 정보 제외
- [ ] XSS 방지 (input validation)
- [ ] CSRF 토큰 구현
- [ ] Content Security Policy 설정
- [ ] HTTPS 강제 사용

### 2. 백엔드 보안
- [ ] Rate Limiting 적용
- [ ] CORS 적절히 설정
- [ ] Helmet.js 보안 헤더
- [ ] Input Validation
- [ ] SQL Injection 방지

### 3. 데이터베이스 보안
- [ ] RLS 정책 적용
- [ ] Service Role Key 보안 관리
- [ ] 정기적인 백업 확인
- [ ] SSL 연결 강제

## 🚀 배포 자동화 (CI/CD)

### 1. GitHub Actions 설정

#### 워크플로우 파일 (.github/workflows/deploy.yml)
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run build

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### 2. 배포 시크릿 설정
```bash
# GitHub Secrets에 추가
VERCEL_TOKEN: vercel 액세스 토큰
ORG_ID: Vercel 조직 ID
PROJECT_ID: Vercel 프로젝트 ID
RENDER_DEPLOY_HOOK: Render 배포 웹훅 URL
```

## 🔧 트러블슈팅

### 1. 일반적인 문제들

#### 빌드 실패
```bash
# 의존성 문제 해결
rm -rf node_modules package-lock.json
npm install

# TypeScript 에러 확인
npm run type-check
```

#### 환경 변수 문제
```bash
# 환경 변수 로딩 확인
console.log('ENV:', import.meta.env);
```

#### CORS 에러
```javascript
// 백엔드 CORS 설정 확인
app.use(cors({
  origin: ['https://your-domain.com', 'http://localhost:5173'],
  credentials: true
}));
```

### 2. 성능 문제

#### 느린 로딩 시간
- 번들 크기 최적화
- 코드 스플리팅 적용
- 이미지 최적화
- CDN 사용

#### 데이터베이스 성능
```sql
-- 슬로우 쿼리 확인
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- 인덱스 추가
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at 
ON orders(created_at DESC);
```

## 📈 성능 메트릭

### 1. 목표 지표
- **First Contentful Paint**: < 1.5초
- **Largest Contentful Paint**: < 2.5초
- **Time to Interactive**: < 3.5초
- **Cumulative Layout Shift**: < 0.1

### 2. 모니터링 도구
- Google PageSpeed Insights
- Vercel Analytics
- Lighthouse CI
- Real User Monitoring (RUM)

## 🔄 롤백 절차

### 1. 긴급 롤백
```bash
# Vercel 이전 배포로 롤백
vercel --prod --target production

# GitHub에서 이전 커밋으로 롤백
git revert HEAD~1
git push origin main
```

### 2. 데이터베이스 롤백
```sql
-- 마이그레이션 롤백 (신중히!)
-- 백업에서 복원하거나 수동 데이터 수정
```

## 📋 배포 후 체크리스트

### 1. 기능 검증
- [ ] 로그인/회원가입 동작
- [ ] 주문 프로세스 완료
- [ ] 결제 시스템 동작
- [ ] 실시간 알림 동작
- [ ] 관리자 기능 동작

### 2. 성능 검증
- [ ] 페이지 로드 시간 확인
- [ ] API 응답 시간 확인
- [ ] 모바일 동작 확인
- [ ] 크로스 브라우저 테스트

### 3. 보안 검증
- [ ] HTTPS 동작 확인
- [ ] API 인증 동작
- [ ] 권한 시스템 동작
- [ ] 민감한 정보 노출 확인

---

## 🎯 배포 완료!

편의점 종합 솔루션 v2.0이 성공적으로 배포되었습니다!

### 🌐 배포된 URL 예시
- **Frontend**: https://convenience-store.vercel.app
- **Backend API**: https://convenience-store-api.render.com
- **Database**: Supabase (esbjgvnlqzseomhbsimz)

### 📞 지원 연락처
- **기술 문의**: dev@convenience-store.com
- **긴급 상황**: emergency@convenience-store.com

---
**편의점 종합 솔루션 v2.0** | 최신 업데이트: 2025-08-17