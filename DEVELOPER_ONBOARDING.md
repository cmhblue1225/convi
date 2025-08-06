# 🚀 개발자 온보딩 가이드

**편의점 솔루션 v2.0 프로젝트에 오신 것을 환영합니다!**

이 문서는 새로운 개발자가 빠르게 프로젝트에 참여할 수 있도록 돕는 가이드입니다.

---

## 📋 **시작하기 전 체크리스트**

### **필요한 계정들**
- [ ] **GitHub 계정** - 코드 저장소 접근
- [ ] **Supabase 계정** - 데이터베이스 (개인 프로젝트 생성용)
- [ ] **Slack/Discord** - 팀 커뮤니케이션
- [ ] **토스페이먼츠 계정** - 결제 테스트 (선택사항)

### **개발 도구 설치**
- [ ] **Node.js** (v18 이상)
- [ ] **Git**
- [ ] **VS Code** (권장 에디터)
- [ ] **Chrome/Firefox** (디버깅용)

---

## 🏗️ **프로젝트 설정 (5분 완료)**

### **1단계: 저장소 클론**
```bash
# 프로젝트 클론
git clone https://github.com/cmhblue1225/convi.git
cd convi

# 의존성 설치
npm install
```

### **2단계: 개인 브랜치 생성**
```bash
# 본인 담당 영역에 맞는 브랜치로 전환
# 예시: 고객 주문 시스템 담당자
git checkout feature/customer-orders

# 또는 새로운 기능 브랜치 생성
git checkout -b feature/your-new-feature
```

### **3단계: 환경 변수 설정**
```bash
# 환경 파일 생성
cp .env.example .env.local

# .env.local 파일 편집 (아래 참고)
```

**`.env.local` 설정 내용:**
```env
# Supabase 설정 (개인 프로젝트)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 토스페이먼츠 (테스트용)
VITE_TOSS_CLIENT_KEY=test_ck_your_test_key

# 앱 설정
VITE_APP_NAME="편의점 종합 솔루션"
VITE_APP_VERSION="2.0.0"
```

---

## 🗄️ **개인 데이터베이스 설정 (3분 완료)**

### **1단계: Supabase 프로젝트 생성**
1. [supabase.com](https://supabase.com) 접속
2. "New Project" 클릭
3. 프로젝트명: `convi-dev-[본인이름]` 
4. 지역: `Asia Pacific (Seoul)` 선택

### **2단계: 데이터베이스 초기화**
1. Supabase 대시보드 → "SQL Editor" 클릭
2. `supabase-setup/00_setup_all_advanced.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 후 실행 (F5)
4. 실행 완료 확인: ✅ 17개 테이블 생성 완료!

### **3단계: 환경 변수 업데이트**
1. Supabase → Settings → API
2. Project URL과 anon key를 복사
3. `.env.local` 파일에 붙여넣기

---

## 🧪 **개발 서버 실행 & 테스트**

### **개발 서버 시작**
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:5173 접속
```

### **테스트 계정으로 로그인**
프로젝트에는 미리 설정된 테스트 계정들이 있습니다:

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 고객 | customer1@test.com | test123 |
| 점주 | owner1@test.com | test123 |
| 본사 | hq@test.com | test123 |

---

## 👥 **본인 역할 및 담당 영역 확인**

### **역할별 담당 영역**
1. **팀 리더**: 프로젝트 관리, 아키텍처
2. **백엔드/인증**: `src/stores/common/authStore.ts`, `src/lib/supabase/`
3. **고객 주문**: `src/pages/customer/Checkout.tsx`, `src/components/payment/`
4. **고객 대시보드**: `src/pages/customer/CustomerHome.tsx`, `src/components/customer/`
5. **점주 관리**: `src/pages/store/`, `src/components/store/`
6. **본사 분석**: `src/pages/hq/`, `src/components/hq/`

### **현재 완성도 확인**
```bash
# 프로젝트 구조 확인
find src -name "*.tsx" | head -20

# 본인 담당 파일들 확인
ls src/pages/customer/  # 고객 기능 담당자
ls src/pages/store/     # 점주 기능 담당자
ls src/pages/hq/        # 본사 기능 담당자
```

---

## 🔧 **개발 도구 설정**

### **VS Code 확장 프로그램 (권장)**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "github.vscode-pull-request-github"
  ]
}
```

### **유용한 명령어들**
```bash
# 코드 품질 검사
npm run lint                 # ESLint 검사
npm run type-check          # TypeScript 타입 검사
npm run build               # 프로덕션 빌드

# 개발 도구
npm run dev                 # 개발 서버
npm run preview             # 빌드 미리보기
```

---

## 📝 **첫 번째 작업 시작하기**

### **1단계: 이슈 확인**
1. [GitHub Issues](https://github.com/cmhblue1225/convi/issues) 확인
2. 본인 담당 영역의 이슈 할당받기
3. 이슈에 댓글로 작업 시작 선언

### **2단계: 작업 브랜치 생성**
```bash
# 최신 코드 동기화
git checkout develop
git pull origin develop

# 작업 브랜치 생성
git checkout -b feature/your-feature-name

# 예시: 고객 위시리스트 기능
git checkout -b feature/customer-wishlist
```

### **3단계: 첫 번째 커밋**
```bash
# 간단한 변경사항 추가 (예: README에 본인 이름 추가)
git add .
git commit -m "feat: add developer info to team structure

- Add [본인이름] to customer development team
- Ready to start working on customer features

🚀 Generated with Claude Code"

git push origin feature/your-feature-name
```

### **4단계: 첫 번째 Pull Request**
1. GitHub에서 Pull Request 생성
2. 템플릿에 맞춰 설명 작성
3. 팀 리더에게 리뷰 요청

---

## 🤝 **팀 협업 규칙 요약**

### **매일 해야 할 것**
```bash
# 작업 시작 전
git checkout develop
git pull origin develop
git checkout feature/your-branch
git rebase develop

# 작업 완료 후
npm run lint
npm run type-check
git add .
git commit -m "feat(scope): description"
git push origin feature/your-branch
```

### **커밋 메시지 형식**
```
feat(customer): add wishlist functionality
fix(store): resolve inventory calculation bug  
refactor(auth): improve login performance
docs: update API documentation
```

### **금지사항 ❌**
- 다른 개발자 담당 파일 무단 수정
- develop/main 브랜치에 직접 push
- 테스트 없이 PR 생성
- 대용량 파일 커밋

---

## 🔍 **유용한 디버깅 팁**

### **자주 발생하는 문제들**

**1. Supabase 연결 오류**
```bash
# .env.local 파일 확인
cat .env.local

# 환경변수 로딩 확인
console.log(import.meta.env.VITE_SUPABASE_URL)
```

**2. TypeScript 오류**
```bash
# 타입 검사
npm run type-check

# 캐시 정리
rm -rf node_modules/.vite
npm run dev
```

**3. ESLint 오류**
```bash
# 자동 수정
npm run lint -- --fix

# 특정 파일만 검사
npx eslint src/pages/customer/CustomerHome.tsx
```

### **브라우저 개발자 도구**
- **Network 탭**: API 호출 확인
- **Console 탭**: 에러 메시지 확인  
- **Application 탭**: localStorage 데이터 확인
- **React DevTools**: 컴포넌트 상태 확인

---

## 📞 **도움이 필요할 때**

### **단계별 문제 해결**
1. **구글링**: 에러 메시지로 검색
2. **문서 확인**: README.md, COLLABORATION_GUIDE.md
3. **팀 채널**: Slack/Discord에 질문
4. **GitHub Issue**: 버그 리포트 또는 질문 이슈 생성
5. **팀 리더**: 직접 연락

### **자주 참고하는 문서들**
- [React 19 Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Zustand Guide](https://github.com/pmndrs/zustand)

---

## 🎉 **온보딩 완료 체크리스트**

### **기본 설정 완료**
- [ ] 저장소 클론 및 의존성 설치
- [ ] 개인 Supabase 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] 개발 서버 실행 성공
- [ ] 테스트 계정으로 로그인 성공

### **개발 준비 완료**
- [ ] 담당 영역 파일 구조 파악
- [ ] 첫 번째 브랜치 생성
- [ ] VS Code 확장 프로그램 설치
- [ ] 팀 커뮤니케이션 채널 참여

### **협업 규칙 숙지**
- [ ] 커밋 메시지 컨벤션 이해
- [ ] PR 템플릿 확인
- [ ] 브랜치 전략 이해
- [ ] 코드 리뷰 프로세스 숙지

---

## 🚀 **이제 시작할 준비가 완료되었습니다!**

**질문이나 도움이 필요하면 언제든 팀 채널에서 연락해 주세요.**  
**함께 멋진 편의점 관리 시스템을 만들어봅시다!** 

---

**마지막 업데이트**: 2025-08-06  
**문서 버전**: v1.0