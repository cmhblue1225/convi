# 🛠️ Git 명령어 완벽 치트시트 (초보자 → 고급자)

**"Git이 무서워서 개발을 피하고 있나요? 이제 그만!"**

이 문서는 Git 초보자부터 고급 사용자까지 모든 상황에서 사용할 수 있는 명령어를 단계별로 정리했습니다.

---

## 🌟 **Level 1: 생존 필수 명령어 (하루 만에 마스터)**

### **📍 현재 상태 확인**
```bash
# 🔍 지금 어디에 있는지 확인
pwd                          # 현재 폴더 위치
git status                   # 변경된 파일들 확인
git branch                   # 현재 브랜치 확인
git branch -a                # 모든 브랜치 확인 (원격 포함)

# 📊 변경사항 미리보기
git diff                     # 아직 스테이징 안 된 변경사항
git diff --staged            # 스테이징된 변경사항
git log --oneline -10        # 최근 10개 커밋 간단히 보기
```

### **🚶‍♂️ 기본 이동**
```bash
# 브랜치 이동
git checkout develop                    # develop 브랜치로 이동
git checkout feature/my-area           # 내 작업 브랜치로 이동
git checkout -b feature/new-feature    # 새 브랜치 생성하며 이동

# 최신 코드 받아오기
git pull origin develop               # develop 브랜치 최신 상태로
git pull origin feature/my-area       # 내 브랜치 최신 상태로
```

### **💾 기본 저장**
```bash
# 변경사항 저장하기
git add .                           # 모든 변경사항 스테이징
git add src/pages/customer/         # 특정 폴더만 스테이징
git add src/components/Button.tsx   # 특정 파일만 스테이징

# 커밋하기
git commit -m "feat: 새로운 기능 추가"
git commit -m "fix: 버그 수정"
git commit -m "docs: 문서 업데이트"

# 서버에 올리기
git push origin feature/my-area     # 내 브랜치를 서버에 업로드
git push -u origin feature/my-area  # 처음 푸시할 때 (-u는 추적 설정)
```

---

## ⚡ **Level 2: 일상 업무 명령어 (1주일 연습)**

### **🔄 동기화 및 업데이트**
```bash
# 다른 사람 작업 받아오기
git fetch origin                    # 모든 브랜치 정보 업데이트 (merge 안 함)
git fetch origin develop           # develop 브랜치 정보만 업데이트
git pull origin develop            # develop 브랜치 받아와서 자동 merge

# 내 브랜치를 최신 develop와 맞추기
git checkout feature/my-area
git rebase develop                  # develop의 최신 내용을 내 브랜치에 적용
git merge develop                   # develop을 내 브랜치에 합병 (권장하지 않음)
```

### **📝 커밋 관리**
```bash
# 커밋 메시지 수정
git commit --amend -m "새로운 커밋 메시지"
git commit --amend --no-edit        # 메시지 그대로, 파일만 추가

# 마지막 커밋에 파일 추가
git add forgotten-file.txt
git commit --amend --no-edit

# 커밋 히스토리 예쁘게 보기
git log --graph --oneline --decorate --all
git log --graph --pretty=format:'%h - %an, %ar : %s'
```

### **🔍 정보 확인**
```bash
# 브랜치 관리
git branch -v                      # 브랜치별 마지막 커밋 정보
git branch --merged                # 이미 merge된 브랜치들
git branch --no-merged             # 아직 merge 안 된 브랜치들

# 원격 저장소 정보
git remote -v                      # 연결된 원격 저장소 확인
git remote show origin            # origin 저장소 상세 정보

# 특정 커밋 정보
git show HEAD                      # 최신 커밋 상세 정보
git show 커밋해시                   # 특정 커밋 상세 정보
```

---

## 🚀 **Level 3: 문제 해결 명령어 (위기 상황 대응)**

### **⏪ 되돌리기 (가장 많이 찾는 기능)**
```bash
# 파일 변경사항 취소
git checkout -- filename           # 특정 파일의 변경사항 완전 취소
git checkout -- .                  # 모든 파일의 변경사항 취소
git restore filename                # 최신 Git 버전의 파일 복원

# 스테이징 취소
git reset filename                  # 특정 파일만 스테이징 취소
git reset                          # 모든 파일 스테이징 취소
git restore --staged filename       # 최신 Git 버전의 스테이징 취소

# 커밋 되돌리기
git reset --soft HEAD~1            # 마지막 커밋만 취소 (파일 변경사항 유지)
git reset --mixed HEAD~1           # 마지막 커밋과 스테이징 취소 (기본값)
git reset --hard HEAD~1            # 마지막 커밋과 모든 변경사항 취소 (위험!)

# 안전한 되돌리기 (기록을 남기면서)
git revert HEAD                    # 마지막 커밋을 되돌리는 새 커밋 생성
git revert 커밋해시                 # 특정 커밋을 되돌리는 새 커밋 생성
```

### **🔧 충돌 해결**
```bash
# 충돌 상황 확인
git status                         # 충돌 파일 확인
git diff                          # 충돌 내용 확인

# 충돌 해결 후
git add conflicted-file.txt        # 충돌 해결한 파일 스테이징
git commit                         # 충돌 해결 커밋 (메시지 자동 생성)

# merge 취소 (충돌 해결이 너무 복잡할 때)
git merge --abort                  # merge 시작 전 상태로 되돌리기
git rebase --abort                 # rebase 시작 전 상태로 되돌리기
```

### **🗑️ 정리 및 관리**
```bash
# 브랜치 삭제
git branch -d feature/completed    # 로컬 브랜치 삭제 (merge된 경우만)
git branch -D feature/completed    # 로컬 브랜치 강제 삭제
git push origin --delete feature/completed  # 원격 브랜치 삭제

# 원격 브랜치 정보 정리
git remote prune origin            # 삭제된 원격 브랜치 참조 정리
git fetch --prune                  # fetch하면서 정리도 함께

# 작업 공간 정리
git clean -f                       # 추적되지 않는 파일 삭제
git clean -fd                      # 추적되지 않는 파일과 폴더 삭제
git clean -n                       # 삭제될 파일 미리보기 (실제 삭제 안 함)
```

---

## 🎯 **Level 4: 고급 협업 명령어 (팀 리더급)**

### **🔀 고급 merge & rebase**
```bash
# 스쿼시 merge (여러 커밋을 하나로 합치면서 merge)
git merge --squash feature/my-area
git commit -m "feat: add complete feature from my-area branch"

# 인터랙티브 rebase (커밋 히스토리 정리)
git rebase -i HEAD~3               # 최근 3개 커밋 편집
git rebase -i develop              # develop 이후의 모든 커밋 편집

# cherry-pick (특정 커밋만 가져오기)
git cherry-pick 커밋해시           # 다른 브랜치의 특정 커밋만 가져오기
git cherry-pick 커밋1 커밋2        # 여러 커밋을 순서대로 가져오기
```

### **🏷️ 태그 관리**
```bash
# 태그 생성
git tag v1.0.0                     # 간단한 태그
git tag -a v1.0.0 -m "Release version 1.0.0"  # 주석 태그

# 태그 푸시
git push origin v1.0.0             # 특정 태그 푸시
git push origin --tags             # 모든 태그 푸시

# 태그 확인
git tag                            # 모든 태그 목록
git show v1.0.0                    # 특정 태그 정보
```

### **📊 고급 로그 및 분석**
```bash
# 고급 로그 옵션
git log --since="2 weeks ago"      # 2주 전부터의 커밋들
git log --author="김개발"           # 특정 작성자의 커밋들
git log --grep="bug"               # 커밋 메시지에 "bug" 포함된 것들
git log src/pages/customer/        # 특정 폴더의 변경 히스토리

# 통계 및 분석
git shortlog -n -s                 # 작성자별 커밋 수 통계
git log --stat                     # 변경된 파일 통계와 함께
git log --oneline --graph --all    # 모든 브랜치 그래프 보기

# blame (코드 작성자 확인)
git blame filename                 # 각 줄의 작성자와 커밋 확인
git blame -L 10,20 filename        # 10-20줄만 확인
```

---

## 🆘 **위급 상황별 해결책**

### **😱 실수 상황 1: "앗! 잘못된 브랜치에서 작업했어요!"**
```bash
# 현재 작업을 임시 저장
git stash push -m "작업 중이던 내용"

# 올바른 브랜치로 이동
git checkout correct-branch

# 임시 저장한 작업 복원
git stash pop

# 또는 한 번에 처리
git stash
git checkout correct-branch
git stash pop
```

### **😱 실수 상황 2: "실수로 develop에 바로 커밋했어요!"**
```bash
# 새 브랜치 생성 (현재 커밋을 포함)
git checkout -b feature/my-accidental-work

# develop로 돌아가서 마지막 커밋 제거
git checkout develop
git reset --hard HEAD~1

# 내 작업은 새 브랜치에 안전하게 보존됨
git checkout feature/my-accidental-work
# 여기서 계속 작업하면 됨
```

### **😱 실수 상황 3: "커밋 메시지를 완전 잘못 썼어요!"**
```bash
# 아직 푸시 안 한 경우
git commit --amend -m "올바른 커밋 메시지"

# 이미 푸시한 경우 (팀원과 상의 후)
git commit --amend -m "올바른 커밋 메시지"
git push --force-with-lease origin feature/my-branch
```

### **😱 실수 상황 4: "merge 충돌이 너무 복잡해요!"**
```bash
# 일단 merge 취소
git merge --abort

# 다른 방법으로 접근
git rebase develop  # rebase로 시도해보기

# 그래도 안 되면 팀 리더에게 도움 요청
# 절대 --force 사용하지 말기!
```

### **😱 실수 상황 5: "파일을 실수로 삭제했어요!"**
```bash
# 아직 커밋 안 한 경우
git checkout -- deleted-file.txt

# 이미 커밋한 경우
git log --oneline -- deleted-file.txt  # 파일의 마지막 커밋 찾기
git checkout 커밋해시 -- deleted-file.txt   # 해당 커밋에서 파일 복원
```

---

## 📋 **상황별 명령어 조합 (복사해서 사용)**

### **🌅 매일 아침 작업 시작할 때**
```bash
# 1. 프로젝트 폴더로 이동
cd convi

# 2. 최신 상태 확인
git status
git branch

# 3. develop 최신 상태로 업데이트
git checkout develop
git pull origin develop

# 4. 내 브랜치로 이동하고 최신화
git checkout feature/my-area
git rebase develop

# 5. 개발 서버 실행
npm run dev
```

### **🌆 작업 완료 후 저녁에**
```bash
# 1. 테스트 실행
npm run lint
npm run type-check
npm run build

# 2. 변경사항 확인
git status
git diff

# 3. 커밋
git add .
git commit -m "feat(scope): add new functionality

- Add component for user management
- Implement API integration
- Update types and interfaces
- Add comprehensive error handling"

# 4. 푸시
git push origin feature/my-area
```

### **🔥 긴급 버그 수정할 때**
```bash
# 1. 현재 작업 임시 저장
git stash push -m "현재 작업 중인 내용"

# 2. 핫픽스 브랜치 생성
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# 3. 버그 수정 후
git add .
git commit -m "fix: resolve critical payment bug

- Fix null pointer exception in payment processing
- Add validation for empty cart scenarios
- Update error handling for payment failures"

# 4. main과 develop 모두에 적용
git checkout main
git merge hotfix/critical-bug-fix
git push origin main

git checkout develop
git merge hotfix/critical-bug-fix
git push origin develop

# 5. 원래 작업으로 복귀
git checkout feature/my-area
git stash pop
```

---

## 🎨 **Git 설정 및 최적화**

### **⚙️ 초기 설정 (처음 한 번만)**
```bash
# 사용자 정보 설정
git config --global user.name "김개발"
git config --global user.email "kim@example.com"

# 에디터 설정
git config --global core.editor "code --wait"  # VS Code
git config --global core.editor vim             # Vim

# 기본 브랜치명 설정
git config --global init.defaultBranch main

# 줄 끝 처리 (Windows)
git config --global core.autocrlf true

# 줄 끝 처리 (Mac/Linux)
git config --global core.autocrlf input
```

### **🎨 Git 별칭 설정 (편의 명령어)**
```bash
# 자주 사용하는 명령어를 짧게
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit

# 고급 별칭
git config --global alias.lg "log --graph --oneline --decorate --all"
git config --global alias.last "log -1 HEAD"
git config --global alias.unstage "reset HEAD --"

# 사용 예시
git st      # git status와 동일
git co develop  # git checkout develop와 동일
git lg      # 예쁜 로그 보기
```

### **🔧 유용한 설정**
```bash
# push 기본 동작 설정
git config --global push.default simple

# merge 시 fast-forward 비활성화 (merge 커밋 항상 생성)
git config --global merge.ff false

# rebase 시 자동으로 stash/pop
git config --global rebase.autoStash true

# 컬러 출력 활성화
git config --global color.ui auto
```

---

## 📖 **커밋 메시지 작성 가이드**

### **📝 완벽한 커밋 메시지 형식**
```
type(scope): subject

body (선택사항)

footer (선택사항)
```

### **🏷️ Type 분류**
```bash
feat:     새로운 기능 추가
fix:      버그 수정
docs:     문서 수정
style:    코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test:     테스트 추가
chore:    빌드 업무 수정, 패키지 매니저 수정
```

### **✨ 좋은 커밋 메시지 예시**
```bash
# 짧고 명확한 경우
feat(auth): add Google OAuth login
fix(payment): resolve checkout button disable issue
docs: update API documentation for v2.0

# 상세한 설명이 필요한 경우
feat(customer): implement real-time order tracking

- Add WebSocket connection for live updates
- Create OrderTracking component with status timeline
- Implement automatic status refresh every 30 seconds
- Add push notifications for mobile devices

Closes #123
```

### **❌ 피해야 할 커밋 메시지**
```bash
# 너무 애매한 메시지
git commit -m "fix"
git commit -m "update"
git commit -m "changes"

# 한국어와 영어 섞어서
git commit -m "feat: 새로운 기능 add"

# 너무 길고 복잡한 메시지
git commit -m "feat: add new payment system with toss naver kakao pay and also fix some bugs in the checkout process and update some components"
```

---

## 🎯 **마스터하기 위한 연습 계획**

### **📅 1주차: 기본기 다지기**
- [ ] `git status`, `git branch` 매일 10번씩 사용
- [ ] `git add`, `git commit`, `git push` 완전 숙달
- [ ] 브랜치 이동 자유자재로 하기

### **📅 2주차: 협업 준비**
- [ ] `git pull`, `git rebase` 이해하고 사용
- [ ] 충돌 상황 만들어서 해결 연습
- [ ] 커밋 메시지 컨벤션 익히기

### **📅 3주차: 고급 기능**
- [ ] `git stash` 활용하기
- [ ] `git cherry-pick` 연습
- [ ] 복잡한 merge 상황 해결

### **📅 4주차: 마스터 레벨**
- [ ] `git rebase -i` 로 히스토리 정리
- [ ] 팀원들의 Git 질문 해결해주기
- [ ] Git 워크플로우 개선 제안

---

## 🆘 **응급처치 핫라인**

### **🔥 정말 급할 때 (순서대로 시도)**
```bash
# 1. 현재 상태 파악
git status
git log --oneline -5

# 2. 현재 작업 백업
git stash push -m "emergency backup"

# 3. 안전한 상태로 이동
git checkout develop
git pull origin develop

# 4. 상황 설명하고 팀 리더에게 도움 요청
# 절대 --force 명령어 사용하지 말 것!
```

### **📞 도움 요청할 때 준비사항**
1. `git status` 결과 스크린샷
2. 어떤 작업을 하려고 했는지 설명
3. 어떤 에러 메시지가 나왔는지
4. 지금까지 시도해본 명령어들

---

## 🏆 **최종 목표: Git 마스터가 되기 위한 체크리스트**

### **✅ 기본 레벨 (생존)**
- [ ] Git이 무엇인지 이해했다
- [ ] 브랜치 개념을 알고 있다
- [ ] 기본적인 add, commit, push를 할 수 있다
- [ ] 브랜치 이동을 자유롭게 할 수 있다

### **✅ 협업 레벨 (팀워크)**
- [ ] 다른 사람과 충돌 없이 작업할 수 있다
- [ ] merge 충돌을 해결할 수 있다
- [ ] 좋은 커밋 메시지를 작성할 수 있다
- [ ] code review 과정을 이해한다

### **✅ 고급 레벨 (전문가)**
- [ ] 복잡한 상황에서도 당황하지 않는다
- [ ] 팀원들의 Git 문제를 해결해줄 수 있다
- [ ] Git 워크플로우를 개선할 수 있다
- [ ] Git 내부 동작 원리를 이해한다

---

**🎉 이제 여러분은 Git 공포증을 완전히 극복했습니다!**

**Git은 도구일 뿐입니다. 중요한 것은 팀과 함께 멋진 소프트웨어를 만드는 것이죠!** 💪

---

**📚 더 공부하고 싶다면:**
- [Pro Git Book (무료)](https://git-scm.com/book)
- [Git 공식 문서](https://git-scm.com/docs)
- [GitHub Git Handbook](https://guides.github.com/introduction/git-handbook/)

**마지막 업데이트**: 2025-08-06  
**문서 버전**: v1.0 Complete Edition