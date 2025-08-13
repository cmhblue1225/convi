# 편의점 종합 솔루션 v2.0 - 프로젝트 문서

> 편의점 점주와 고객을 위한 완전 통합 관리 시스템

## 📚 문서 구조

### 📋 프로젝트 개요
- **[프로젝트 개요](./PROJECT_OVERVIEW.md)** - 프로젝트 소개, 목표, 범위
- **[요구사항 명세서](./REQUIREMENTS.md)** - 기능 및 비기능 요구사항

### 🏗️ 시스템 설계
- **[시스템 아키텍처](./architecture/SYSTEM_ARCHITECTURE.md)** - 전체 시스템 구조
- **[기술 스택](./architecture/TECH_STACK.md)** - 사용 기술 및 선택 이유
- **[보안 아키텍처](./architecture/SECURITY_ARCHITECTURE.md)** - 보안 설계

### 🗄️ 데이터베이스
- **[ERD 다이어그램](./database/ERD.md)** - 데이터베이스 관계도
- **[테이블 스키마](./database/SCHEMA.md)** - 상세 테이블 명세
- **[데이터 사전](./database/DATA_DICTIONARY.md)** - 필드별 상세 정의

### 🔌 API 명세
- **[API 개요](./api/API_OVERVIEW.md)** - API 설계 원칙
- **[인증 API](./api/AUTH_API.md)** - 사용자 인증 관련 API
- **[고객 API](./api/CUSTOMER_API.md)** - 고객 기능 API
- **[점주 API](./api/STORE_API.md)** - 점주 기능 API
- **[본사 API](./api/HQ_API.md)** - 본사 관리 API

### 👥 사용자 시나리오
- **[유스케이스 다이어그램](./use-cases/USE_CASES.md)** - 주요 사용 사례
- **[사용자 시나리오](./use-cases/USER_SCENARIOS.md)** - 상세 사용 시나리오
- **[비즈니스 프로세스](./use-cases/BUSINESS_PROCESS.md)** - 업무 프로세스

### 🎨 UI/UX 설계
- **[화면 설계](./ui-flow/SCREEN_DESIGN.md)** - 화면별 상세 설계
- **[사용자 플로우](./ui-flow/USER_FLOW.md)** - 사용자 여정
- **[디자인 시스템](./ui-flow/DESIGN_SYSTEM.md)** - UI 컴포넌트 가이드

### ⚙️ 기능 명세
- **[고객 기능](./features/CUSTOMER_FEATURES.md)** - 고객용 기능 상세
- **[점주 기능](./features/STORE_FEATURES.md)** - 점주용 기능 상세
- **[본사 기능](./features/HQ_FEATURES.md)** - 본사용 기능 상세
- **[공통 기능](./features/COMMON_FEATURES.md)** - 공통 기능 상세

### 🚀 배포 및 운영
- **[배포 가이드](./deployment/DEPLOYMENT_GUIDE.md)** - 배포 절차
- **[환경 설정](./deployment/ENVIRONMENT.md)** - 환경별 설정
- **[모니터링](./deployment/MONITORING.md)** - 운영 모니터링

### 📊 다이어그램
- **[시퀀스 다이어그램](./diagrams/SEQUENCE_DIAGRAMS.md)** - 주요 프로세스 흐름
- **[클래스 다이어그램](./diagrams/CLASS_DIAGRAMS.md)** - 코드 구조
- **[컴포넌트 다이어그램](./diagrams/COMPONENT_DIAGRAMS.md)** - 시스템 컴포넌트

## 🔧 개발 참고사항

### 코드베이스 구조
```
src/
├── components/          # React 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── customer/       # 고객용 컴포넌트
│   ├── store/          # 점주용 컴포넌트
│   └── hq/             # 본사용 컴포넌트
├── pages/              # 페이지 컴포넌트
├── stores/             # Zustand 상태 관리
├── hooks/              # 커스텀 훅
├── lib/                # 유틸리티 라이브러리
└── types/              # TypeScript 타입 정의
```

### 주요 기술 스택
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand + React Query
- **Payment**: 토스페이먼츠 SDK
- **Deployment**: Render.com
- **Maps**: Naver Maps API

## 📞 문의 및 지원

프로젝트 관련 문의사항이나 개선사항은 개발팀에 연락해주세요.

---
**편의점 종합 솔루션 v2.0** | 최신 업데이트: 2025-08-12