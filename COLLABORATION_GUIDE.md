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
- **담당 영역**:
  ```
  src/stores/common/authStore.ts
  src/lib/supabase/
  src/components/common/ProtectedRoute.tsx
  src/pages/AuthPage.tsx
  supabase-setup/ (데이터베이스 스키마)
  ```

### 👤 **3. 고객 기능 개발자 A**
- **역할**: 주문 & 결제 시스템
- **담당 영역**:
  ```
  src/pages/customer/StoreSelection.tsx
  src/pages/customer/ProductCatalog.tsx
  src/pages/customer/Checkout.tsx
  src/components/payment/
  src/lib/payment/
  src/stores/cartStore.ts
  ```

### 👤 **4. 고객 기능 개발자 B**
- **역할**: 고객 대시보드 & 프로필
- **담당 영역**:
  ```
  src/pages/customer/CustomerHome.tsx
  src/pages/customer/CustomerOrders.tsx
  src/pages/customer/CustomerProfile.tsx
  src/pages/customer/OrderTracking.tsx
  src/components/customer/
  ```

### 🏪 **5. 점주 기능 개발자**
- **역할**: 점주 관련 모든 기능
- **담당 영역**:
  ```
  src/pages/store/
  src/components/store/
  src/stores/orderStore.ts (점주 관점)
  ```

### 🏢 **6. 본사 기능 개발자**
- **역할**: 본사 관련 모든 기능
- **담당 영역**:
  ```
  src/pages/hq/
  src/components/hq/
  ```

---

## 🌿 **브랜치 전략**

### **메인 브랜치**
```
main              # 운영 배포용 (보호된 브랜치)
├── develop       # 개발 통합 브랜치
└── release/v2.x  # 릴리즈 준비 브랜치
```

### **기능별 브랜치**
```
feature/auth-system          # 백엔드/인증 개발자
feature/customer-orders      # 고객 개발자 A
feature/customer-dashboard   # 고객 개발자 B
feature/store-management     # 점주 개발자
feature/hq-analytics         # 본사 개발자
hotfix/critical-bug-fix      # 긴급 수정용
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

# 2. 빌드 테스트
npm run build

# 3. 커밋 & 푸시
git add .
git commit -m "feat(customer): add order tracking functionality"
git push origin feature/your-area
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

### **2. 풀 리퀘스트 (PR) 템플릿**
```markdown
## 📋 작업 내용
- 구현한 기능에 대한 간단한 설명

## 🧪 테스트 방법
1. 테스트 절차 단계별 설명
2. 예상 결과

## ✅ 체크리스트
- [ ] 코드 리뷰 완료
- [ ] 테스트 통과
- [ ] 빌드 성공
- [ ] 문서 업데이트
```

### **3. 코드 리뷰 프로세스**
- **필수 승인**: 팀 리더 + 관련 영역 개발자 최소 2명
- **리뷰 포인트**: 코드 품질, 타입 안전성, 성능, 보안
- **승인 후**: develop 브랜치로 merge

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
3. 브랜치 직접 merge (PR 필수)
4. 테스트 없이 푸시
5. 데이터베이스 스키마 임의 변경

---

## 🏁 **배포 프로세스**

### **스테이징 배포**
```
develop 브랜치 → 스테이징 환경
1. 모든 PR이 develop에 merge
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