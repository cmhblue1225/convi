# 🏪 편의점 솔루션 v2.0 - 팀 협업 가이드

## 🎯 **프로젝트 개요**

**상용 수준의 편의점 통합 관리 플랫폼 (95% 완성)**  
6명의 개발자팀이 병렬로 작업하여 고품질 코드와 효율적인 협업을 목표로 합니다.

---

## 👥 **팀 구성 (6명)**

### 👑 **1. 팀 리더 (Team Lead)**
- **역할**: 프로젝트 총괄, 아키텍처 관리, 코드 리뷰
- **담당 영역**: 
  - 프로젝트 설정 (package.json, vite.config.ts)
  - `src/App.tsx` (메인 라우터)
  - 데이터베이스 스키마 관리
  - CI/CD 파이프라인

### 🔐 **2. 백엔드/인증 개발자**
- **역할**: 인증 시스템, 데이터베이스, API 연동
- **담당 브랜치**: `feature/auth-*`, `feature/common-api`
- **담당 영역**:
  ```
  # 인증 시스템
  src/stores/common/authStore.ts
  src/components/common/ProtectedRoute.tsx  
  src/pages/AuthPage.tsx
  
  # 공통 API
  src/lib/supabase/
  supabase-setup/ (데이터베이스 스키마)
  ```

### 👤 **3. 고객 기능 개발자 A** - 주문 & 결제 전문가
- **역할**: 주문 & 결제 시스템
- **담당 브랜치**: `feature/customer-cart`, `feature/customer-payment`, `feature/customer-checkout`, `feature/customer-tracking`
- **담당 영역**:
  ```
  # 주문 프로세스
  src/pages/customer/StoreSelection.tsx
  src/pages/customer/ProductCatalog.tsx  
  src/pages/customer/Checkout.tsx
  src/pages/customer/OrderTracking.tsx
  
  # 결제 & 장바구니
  src/components/payment/
  src/lib/payment/
  src/stores/cartStore.ts
  ```

### 👤 **4. 고객 기능 개발자 B** - 대시보드 & UI 전문가
- **역할**: 고객 대시보드 & UI/UX
- **담당 브랜치**: `feature/customer-home`, `feature/customer-orders`, `feature/customer-profile`, `feature/customer-navigation`
- **담당 영역**:
  ```
  # 고객 대시보드
  src/pages/customer/CustomerHome.tsx
  src/pages/customer/CustomerOrders.tsx
  src/pages/customer/CustomerProfile.tsx
  
  # UI 컴포넌트
  src/components/customer/
  src/components/common/ (일부)
  ```

### 🏪 **5. 점주 기능 개발자**
- **역할**: 점주 관련 모든 기능
- **담당 브랜치**: `feature/store-*` (전체 5개)
- **담당 영역**:
  ```
  # 점주 기능 전체
  src/pages/store/
  src/components/store/
  src/stores/orderStore.ts (점주 관점)
  src/stores/inventoryStore.ts
  ```

### 🏢 **6. 본사 기능 개발자**
- **역할**: 본사 관련 모든 기능 + 공통 컴포넌트
- **담당 브랜치**: `feature/hq-*` (전체 5개), `feature/common-components`, `feature/common-utils`
- **담당 영역**:
  ```
  # 본사 기능
  src/pages/hq/
  src/components/hq/
  
  # 공통 컴포넌트
  src/components/common/ (대부분)
  src/lib/utils/
  src/types/common.ts
  ```

---

## 🌿 **브랜치 전략**

### **메인 브랜치**
```
main              # 운영 배포용 (보호된 브랜치)
├── develop       # 개발 통합 브랜치
└── release/v2.x  # 릴리즈 준비 브랜치
```

### **세분화된 기능별 브랜치**

#### **🔐 인증 시스템 (Auth)**
```
feature/auth-login           # 로그인/로그아웃 기능
feature/auth-register        # 회원가입 기능
feature/auth-profile         # 프로필 관리 & 권한 처리
```

#### **🛒 고객 주문 시스템 (Customer Orders)**
```
feature/customer-cart        # 장바구니 기능
feature/customer-payment     # 결제 시스템 (토스, 카카오페이 등)
feature/customer-checkout    # 주문 결제 프로세스
feature/customer-tracking    # 주문 추적 & 상태 관리
```

#### **👤 고객 대시보드 (Customer Dashboard)**
```
feature/customer-home        # 홈 대시보드 & 매장 선택
feature/customer-orders      # 주문 내역 관리
feature/customer-profile     # 고객 프로필 & 설정
feature/customer-navigation  # 하단 네비게이션 & 라우팅
```

#### **🏪 점주 관리 (Store Management)**
```
feature/store-dashboard      # 점주 대시보드
feature/store-orders         # 주문 관리 & 처리
feature/store-inventory      # 재고 관리
feature/store-supply         # 발주 시스템
feature/store-analytics      # 점주용 매출 분석
```

#### **🏢 본사 관리 (HQ Management)**
```
feature/hq-dashboard         # 본사 통합 대시보드
feature/hq-stores            # 지점 관리 & 승인
feature/hq-products          # 상품 카탈로그 관리
feature/hq-supply            # 발주 승인 & 관리
feature/hq-analytics         # 전사 분석 & 리포트
```

#### **⚙️ 공통 기능 (Common)**
```
feature/common-components    # 공통 UI 컴포넌트
feature/common-api           # API 연동 & 데이터베이스
feature/common-utils         # 유틸리티 & 공통 로직
```

#### **🚨 긴급 수정**
```
hotfix/critical-bug-fix      # 긴급 수정용
hotfix/security-patch        # 보안 패치용
```

---

## 🚀 **개발 환경 설정**

### **1. 프로젝트 클론 및 설정**
```bash
# 1. 저장소 클론
git clone https://github.com/cmhblue1225/convi.git
cd convi

# 2. 의존성 설치
npm install

# 3. 개인 브랜치 생성
git checkout -b feature/your-area-name

# 4. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 개인 Supabase 설정 입력
```

### **2. 개인 Supabase 프로젝트 설정**
```bash
# 각 개발자는 개인 Supabase 프로젝트 생성 필요
# 1. https://supabase.com에서 새 프로젝트 생성
# 2. supabase-setup/00_setup_all_advanced.sql 파일 내용을 SQL Editor에서 실행
# 3. .env.local에 개인 프로젝트 정보 입력:
#    VITE_SUPABASE_URL=your_supabase_project_url
#    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📋 **일일 작업 루틴**

### **매일 작업 시작 전**
```bash
# 1. 최신 코드 동기화
git checkout develop
git pull origin develop

# 2. 개인 브랜치 업데이트
git checkout feature/your-area
git rebase develop

# 3. 의존성 업데이트 확인
npm install

# 4. 개발 서버 실행
npm run dev
```

### **작업 완료 후**
```bash
# 1. 코드 품질 검사
npm run lint
npm run type-check
npm run build

# 2. 본인 브랜치에 커밋 & 푸시
git add .
git commit -m "feat(customer): add order tracking functionality"
git push origin feature/your-area

# 3. develop에 직접 merge
git checkout develop
git pull origin develop
git merge feature/your-area
git push origin develop

# 4. 본인 브랜치로 복귀 및 최신화
git checkout feature/your-area
git rebase develop
```

---

## 🤝 **협업 규칙**

### **1. 커밋 메시지 컨벤션**
```
# 형식: type(scope): description

feat:     새로운 기능 추가
fix:      버그 수정
refactor: 코드 리팩토링
style:    스타일 변경
docs:     문서 수정
test:     테스트 추가/수정
chore:    빌드/설정 변경

# 예시
feat(customer): add real-time order tracking
fix(store): resolve inventory update issue
refactor(auth): improve login flow
```

### **2. 브랜치 Merge 프로세스**

**단순화된 워크플로우 (코드 리뷰 생략)**

```bash
# 1. 본인 브랜치에서 작업 완료 후
git add .
git commit -m "feat(customer): add new feature"
git push origin feature/your-area

# 2. develop 브랜치에 직접 merge
git checkout develop
git pull origin develop  # 최신 상태 확인
git merge feature/your-area  # 본인 브랜치 merge
git push origin develop

# 3. 계속 작업을 위해 본인 브랜치로 복귀
git checkout feature/your-area
git rebase develop  # 최신 develop 내용 반영
```

### **3. Main 브랜치 배포**
- **develop → main**: 릴리즈 시에만 팀 리더가 수행
- **각 개발자**: develop까지만 merge, main은 건드리지 않음

### **4. 세분화된 브랜치 활용법**

#### **🤝 협업 시나리오**
```bash
# 시나리오 1: 한 사람이 여러 기능 작업
김개발자가 인증과 관련된 여러 기능 작업
→ feature/auth-login, feature/auth-register 모두 사용

# 시나리오 2: 여러 사람이 한 영역 협업
이개발 + 박개발이 고객 기능 협업
→ 이개발: feature/customer-cart, feature/customer-payment
→ 박개발: feature/customer-home, feature/customer-orders
```

#### **⚡ 빠른 협업 규칙**
```bash
🤝 여러 명이 한 브랜치 작업 시:
1. 팀 채널에 "customer-cart 브랜치 작업 시작" 공지
2. 작업 완료 후 "customer-cart 푸시 완료" 알림
3. 다른 사람이 "받아서 계속 작업하겠습니다" 응답
4. 충돌 시 실시간 소통으로 해결
```

---

## 🔒 **충돌 방지 가이드**

### **파일 접근 권한**
- ✅ **허용**: 각자 담당 폴더 (`src/pages/customer/`, `src/components/store/` 등)
- ⚠️ **주의**: 공통 파일 (`src/App.tsx`, 설정 파일)
- ❌ **금지**: 다른 개발자 담당 영역

### **네이밍 컨벤션**
```typescript
// 컴포넌트: PascalCase + 영역 표시
CustomerOrderCard.tsx     // 고객 영역
StoreInventoryTable.tsx   // 점주 영역
HQAnalyticsChart.tsx      // 본사 영역

// 훅: camelCase + use 접두사
useCustomerOrders.ts
useStoreInventory.ts

// 유틸리티: camelCase + Utils 접미사
customerOrderUtils.ts
storeInventoryUtils.ts
```

---

## 🗄️ **데이터베이스 변경 관리**

### **스키마 변경 프로세스**
1. **개인 Supabase에서 테스트**
2. **SQL 스크립트 작성**
3. **`supabase-setup/00_setup_all_advanced.sql` 업데이트**
4. **팀 리더 승인 후 develop 브랜치에 반영**
5. **팀 전체에 공지**

### **주의사항**
- RLS 정책 변경 시 보안 검토 필수
- 스키마 변경 시 기존 데이터 호환성 확인
- 백업 및 롤백 계획 수립

---

## 🧪 **테스트 전략**

### **개발자 책임 범위**
```bash
# 개인 테스트 (각 개발자)
npm run test:unit        # 단위 테스트
npm run test:component   # 컴포넌트 테스트

# 통합 테스트 (CI/CD 자동화)
npm run test:integration # 통합 테스트
npm run test:e2e         # E2E 테스트
```

---

## 📞 **소통 채널**

### **정기 미팅**
- **일일 스탠드업**: 매일 오전 10시 (15분)
  - 어제 완료한 작업
  - 오늘 계획한 작업
  - 블로킹 이슈 공유

- **주간 리뷰**: 매주 금요일 오후 3시 (1시간)
  - 완료 기능 데모
  - 다음 주 계획
  - 기술적 이슈 논의

### **커뮤니케이션 채널**
```
#dev-general      # 일반적인 개발 논의
#dev-backend      # 백엔드/DB 관련
#dev-frontend     # 프론트엔드 관련
#dev-urgent       # 긴급 이슈
```

---

## 🚦 **성공적인 협업을 위한 DO & DON'T**

### **DO ✅**
1. 작업 전 항상 최신 코드 동기화
2. 작은 단위로 자주 커밋  
3. 의존성 변경 시 팀 공지
4. 코드 리뷰 적극 참여
5. 문서화 습관

### **DON'T ❌**
1. 다른 영역 파일 무단 수정
2. 대용량 파일 커밋
3. main 브랜치 직접 수정 (팀 리더만 가능)
4. 테스트 없이 merge
5. 데이터베이스 스키마 임의 변경

---

## 🏁 **배포 프로세스**

### **스테이징 배포**
```
develop 브랜치 → 스테이징 환경
1. 각 개발자가 develop에 직접 merge
2. 자동 빌드 및 테스트
3. 스테이징 환경 배포
4. QA 테스트 진행
```

### **프로덕션 배포**
```
develop → main → 프로덕션
1. 릴리즈 브랜치 생성
2. 최종 테스트 및 검증
3. main 브랜치로 merge
4. 태그 생성 및 배포
```

---

## 🎯 **프로젝트 완성도 현황**

- **전체 완성도**: 95%
- **구현된 기능**: 모든 핵심 기능 완료
- **남은 작업**: 코드 품질 향상, 테스트 강화, 문서화

**목표**: 6명의 개발자가 효율적으로 협업하여 **상용 수준의 고품질 편의점 관리 시스템** 완성! 🚀

---

**문의사항이나 이슈가 있을 때는 언제든 팀 채널에서 공유해 주세요!**