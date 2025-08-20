# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

이 프로젝트는 편의점 종합 솔루션 v2.0입니다 - 고객, 점주, 본사를 위한 완전한 웹 애플리케이션입니다.

### 핵심 특징
- **완성도**: 98% 완성된 상용 수준의 애플리케이션
- **사용자 역할**: 3가지 (customer/store_owner/headquarters)
- **기술 스택**: React 19 + TypeScript + Vite + Supabase
- **배포**: Render에서 자동 배포 (https://convi-final.onrender.com)

## 개발 명령어

### 로컬 개발
```bash
# 개발 서버 시작 (포트 5173)
npm run dev

# 백엔드 프록시 서버 시작 (포트 3001) 
npm run server

# 전체 스택 동시 실행 
npm run dev:full
```

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기 
npm run preview

# 프로덕션 서버 실행
npm run start
npm run production
```

### 엑셀 관련 기능
```bash
# 엑셀 시스템 설정
npm run setup:excel
```

### 코드 품질
```bash
# 린팅 검사
npm run lint
```

## 프로젝트 아키텍처

### 디렉토리 구조
```
src/
├── components/          # 재사용 컴포넌트
│   ├── common/         # 공통 컴포넌트 (Button, LoadingSpinner 등)
│   ├── customer/       # 고객 전용 컴포넌트
│   ├── store/          # 점주 전용 컴포넌트
│   └── hq/             # 본사 전용 컴포넌트
├── pages/              # 페이지 컴포넌트 (라우팅별)
│   ├── customer/       # 고객 페이지 (/customer/*)
│   ├── store/          # 점주 페이지 (/store/*)
│   └── hq/             # 본사 페이지 (/hq/*)
├── stores/             # Zustand 상태 관리
│   └── common/         # 공통 스토어 (authStore)
├── lib/                # 외부 라이브러리 설정
│   └── supabase/       # Supabase 클라이언트 및 타입
├── hooks/              # 커스텀 훅
├── types/              # TypeScript 타입 정의
└── utils/              # 유틸리티 함수
```

### 핵심 아키텍처 패턴

#### 1. 역할 기반 라우팅
- `ProtectedRoute` 컴포넌트로 권한 검사
- 각 페이지는 allowedRoles로 접근 제어
- authStore에서 사용자 인증 상태 관리

#### 2. 레이아웃 시스템
- `CustomerLayout`, `StoreLayout`, `HQLayout`으로 역할별 UI
- Outlet을 통한 중첩 라우팅
- 각 레이아웃은 전용 헤더/사이드바 포함

#### 3. 상태 관리 전략
- **전역 상태**: Zustand (authStore, cartStore 등)
- **서버 상태**: TanStack Query (Supabase 데이터)
- **로컬 상태**: useState/useReducer

#### 4. Supabase 통합
- **데이터베이스**: PostgreSQL with RLS
- **인증**: Supabase Auth (역할별 profile 자동 생성)
- **실시간**: Realtime subscriptions
- **프로젝트 ID**: esbjgvnlqzseomhbsimz

## 데이터베이스 구조

### 핵심 테이블 (17개)
1. **profiles** - 사용자 프로필 (role: customer/store_owner/headquarters)
2. **stores** - 점포 정보
3. **products** - 상품 마스터
4. **store_products** - 점포별 상품 재고
5. **orders** - 주문 정보
6. **order_items** - 주문 상세
7. **supply_requests** - 재고 요청
8. **notifications** - 실시간 알림

### 중요한 비즈니스 로직
- **재고 관리**: 주문 완료 시 자동 재고 차감
- **알림 시스템**: 주문 상태 변경 시 실시간 알림
- **권한 제어**: RLS 정책으로 역할별 데이터 접근 제어

## 백엔드 서버 (server.js)

### 주요 기능
- **정적 파일 서빙**: Vite 빌드 결과 (dist 폴더)
- **SPA 라우팅**: 모든 경로를 index.html로 리다이렉트
- **네이버 Geocoding API 프록시**: CORS 문제 해결
- **헬스체크**: `/health` 엔드포인트

### 환경 변수
```
VITE_SUPABASE_URL=https://esbjgvnlqzseomhbsimz.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_NAVER_CLIENT_ID=your_naver_client_id
VITE_NAVER_CLIENT_SECRET=your_naver_client_secret
VITE_TOSS_CLIENT_KEY=your_toss_client_key
```

## 빌드 설정

### Vite 설정 (vite.config.ts)
- **청크 분리**: vendor, supabase, router 번들 최적화
- **공용 디렉토리**: wireframes 폴더 포함 (문서 시스템)
- **HMR**: 빠른 개발 환경

### 배포 설정 (render.yaml)
- **플랫폼**: Render.com
- **빌드 명령**: `npm install --include=dev && npm run build`
- **시작 명령**: `node server.js`
- **헬스체크**: `/health`

## 주요 기능 모듈

### 1. 인증 시스템
- `authStore.ts`: 전역 인증 상태 관리
- `ProtectedRoute.tsx`: 권한 기반 라우팅
- 자동 세션 복원 및 프로필 생성

### 2. 결제 시스템
- `TossPaymentWidget.tsx`: 토스페이먼츠 연동
- `PaymentProcessor.tsx`: 결제 로직
- 중복 결제 방지 (paymentKey 기반)

### 3. 실시간 시스템
- Supabase Realtime으로 주문/재고 실시간 업데이트
- `notifications` 테이블로 알림 관리

### 4. 지도 시스템
- 네이버 Maps API 사용 (CORS 프록시 서버 경유)
- `MapLocation.tsx`: 점포 위치 표시
- GPS 기반 주변 점포 검색

## 테스트 계정

```
고객: customer1@test.com / test123
점주: owner1@test.com / test123
본사: hq@test.com / test123
```

## 특별 주의사항

### 1. Supabase 연결
- 모든 데이터베이스 작업은 MCP Supabase 도구 사용
- 프로젝트 ID: `esbjgvnlqzseomhbsimz`
- RLS 정책 변경 시 권한 검증 필수

### 2. 빌드 최적화
- wireframes 폴더는 public으로 복사되어 배포됨
- 정적 파일은 server.js에서 서빙
- SPA 라우팅을 위한 fallback 설정 필수

### 3. 개발 패턴
- 컴포넌트는 역할별 폴더 구조 준수
- 타입 안전성을 위해 TypeScript strict 모드
- 상태 관리는 용도에 따라 Zustand/TanStack Query 선택

### 4. 성능 고려사항
- 이미지 로딩: LazyImage 컴포넌트 사용
- 코드 스플리팅: 청크 단위 로딩
- 캐싱: TanStack Query로 서버 상태 캐시