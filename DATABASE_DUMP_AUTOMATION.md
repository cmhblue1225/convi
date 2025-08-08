# 데이터베이스 덤프 자동화 가이드 🚀

## 📋 개요
편의점 관리 시스템의 Supabase 데이터베이스를 자동으로 백업하고 압축하는 스크립트입니다.

## 📁 관련 파일
```
convi/
├── scripts/
│   └── dump_database.sh          # 자동화 스크립트 (실행 파일)
├── .env.dump                     # 설정 파일 (실제 값)
├── .env.dump.example             # 설정 파일 예제
└── dumps/                        # 덤프 파일 저장 디렉토리
    ├── convi_dump_20250808_123456.sql
    ├── convi_dump_20250808_123456.sql.gz
    ├── latest_dump.sql           # 최신 덤프 심볼릭 링크
    └── latest_dump.sql.gz        # 최신 압축 덤프 심볼릭 링크
```

## 🚀 빠른 시작

### 1단계: 설정 파일 준비
```bash
# 예제 파일을 복사 (이미 .env.dump가 있다면 생략)
cp .env.dump.example .env.dump

# 설정 파일 편집 (필요한 경우)
nano .env.dump
```

### 2단계: 스크립트 실행
```bash
# 프로젝트 루트에서 실행
./scripts/dump_database.sh
```

### 3단계: 결과 확인
```bash
# 생성된 덤프 파일 확인
ls -la dumps/
```

## ⚙️ 설정 파일 (.env.dump)

```bash
# Supabase 프로젝트 정보
SUPABASE_PROJECT_ID=esbjgvnlqzseomhbsimz    # 프로젝트 ID
SUPABASE_DB_PASSWORD=minhyuk915              # 데이터베이스 비밀번호

# 데이터베이스 연결 정보 (일반적으로 변경 불필요)
SUPABASE_DB_HOST=aws-0-ap-northeast-1.pooler.supabase.com
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres

# 출력 설정
DUMP_OUTPUT_DIR=./dumps                      # 덤프 파일 저장 위치
```

## 📊 스크립트 기능

### 🔧 자동 기능
- ✅ **연결 테스트**: 데이터베이스 연결 상태 확인
- ✅ **완전 덤프**: 스키마 + 데이터 + 함수 + RLS 정책
- ✅ **자동 압축**: gzip으로 파일 크기 90% 압축
- ✅ **타임스탬프**: 덤프 파일에 날짜시간 자동 추가
- ✅ **심볼릭 링크**: 최신 덤프 파일 바로가기 생성
- ✅ **색상 로그**: 진행 상황을 시각적으로 표시
- ✅ **에러 처리**: 각 단계별 오류 검증

### 🗃️ 파일 관리
- **파일명 형식**: `convi_dump_YYYYMMDD_HHMMSS.sql`
- **압축 파일**: `.gz` 확장자로 자동 압축
- **최신 링크**: `latest_dump.sql.gz`로 항상 최신 파일 참조
- **자동 정리**: 7일 이전 파일 삭제 옵션 (사용자 선택)

## 📤 사용 예시

### 기본 사용법
```bash
# 현재 데이터베이스 상태로 덤프 생성
./scripts/dump_database.sh
```

### 출력 예시
```
[INFO] ==================================
[INFO] 📦 편의점 DB 덤프 자동화 시작
[INFO] ==================================
[INFO] 프로젝트 ID: esbjgvnlqzseomhbsimz
[INFO] 데이터베이스 호스트: aws-0-ap-northeast-1.pooler.supabase.com
[INFO] 출력 파일명: convi_dump_20250808_123456.sql
[INFO] ==================================
[INFO] 🔍 데이터베이스 연결 테스트 중...
[SUCCESS] 데이터베이스 연결 성공!
[INFO] 📤 데이터베이스 덤프 실행 중...
[SUCCESS] 덤프 파일 생성 완료: ./dumps/convi_dump_20250808_123456.sql
[INFO] 덤프 파일 크기: 760K
[INFO] 🗜️ 파일 압축 중...
[SUCCESS] 압축 파일 생성 완료: ./dumps/convi_dump_20250808_123456.sql.gz
[INFO] 압축 파일 크기: 81K
[SUCCESS] ✅ 데이터베이스 덤프 완료!
```

## 🔧 고급 사용법

### 다른 출력 디렉토리 사용
```bash
# .env.dump 파일에서 DUMP_OUTPUT_DIR 변경
DUMP_OUTPUT_DIR=./my_custom_dumps
```

### 스케줄링 (cron)
```bash
# 매일 새벽 2시에 자동 덤프
crontab -e

# cron에 추가할 내용
0 2 * * * cd /path/to/convi && ./scripts/dump_database.sh >> /tmp/dump.log 2>&1
```

### CI/CD 파이프라인 연동
```yaml
# GitHub Actions 예시
- name: Database Backup
  run: |
    ./scripts/dump_database.sh
    # S3나 다른 스토리지에 업로드
```

## 🛠️ 문제 해결

### PostgreSQL 버전 오류
```bash
# 에러: server version: 17.4; pg_dump version: 14.18
# 해결: PostgreSQL 17 설치
brew install postgresql@17
```

### 연결 오류
```bash
# 에러: connection to server failed
# 해결 방법:
# 1. .env.dump에서 프로젝트 ID와 비밀번호 확인
# 2. Supabase 대시보드에서 데이터베이스 상태 확인
# 3. 네트워크 연결 상태 확인
```

### 권한 오류
```bash
# 에러: Permission denied
# 해결: 실행 권한 부여
chmod +x scripts/dump_database.sh
```

## ⚠️ 보안 주의사항

1. **비밀번호 보호**: `.env.dump` 파일은 반드시 `.gitignore`에 추가
2. **팀 공유**: 비밀번호는 별도 채널로 안전하게 전달
3. **프로덕션**: 실제 서비스에서는 강력한 비밀번호 사용
4. **백업 저장**: 덤프 파일을 안전한 위치에 별도 보관

## 📈 자동화 개선 아이디어

### 향후 추가할 수 있는 기능들
- **클라우드 업로드**: AWS S3, Google Drive 자동 업로드
- **알림 기능**: Slack, Discord 완료 알림
- **증분 백업**: 변경된 데이터만 백업하는 기능
- **다중 환경**: dev/staging/prod 환경별 설정
- **압축 옵션**: 7z, bzip2 등 다른 압축 방식 선택
- **검증 기능**: 덤프 파일 무결성 검사

## 🔄 정기 백업 권장사항

### 백업 주기
- **개발 환경**: 매일 또는 주요 변경 후
- **스테이징**: 매일 새벽
- **프로덕션**: 매일 + 주간 + 월간 백업

### 보관 정책
- **일일 백업**: 30일 보관
- **주간 백업**: 12주 보관  
- **월간 백업**: 12개월 보관

## 📞 지원

문제가 발생하거나 개선 사항이 있으면:
1. 스크립트 실행 로그 확인
2. `.env.dump` 설정 재검토
3. 프로젝트 관리자에게 문의

---

🎉 **축하합니다!** 이제 클릭 한 번으로 데이터베이스를 안전하게 백업할 수 있습니다!