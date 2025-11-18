# 매일 자동 백업 시스템 가이드 🔄

## 📋 개요
편의점 관리 시스템의 Supabase 데이터베이스를 매일 자동으로 백업하고, 필요시 현재 프로젝트에 복원할 수 있는 시스템입니다.

## 📁 관련 파일
```
convi/
├── scripts/
│   ├── daily_backup.sh                    # 매일 자동 백업 스크립트
│   ├── restore_to_current_project.sh      # 현재 프로젝트 복원 스크립트
│   ├── dump_database.sh                   # 수동 백업 스크립트 (기존)
│   └── restore_database.sh                # 새 프로젝트 복원 스크립트 (기존)
├── .env.dump                              # 백업 설정 파일
└── dumps/                                 # 백업 파일 저장 디렉토리
    ├── convi_daily_backup_YYYYMMDD_HHMMSS.sql
    ├── convi_daily_backup_YYYYMMDD_HHMMSS.sql.gz
    ├── latest_daily_backup.sql            # 최신 매일 백업 심볼릭 링크
    └── latest_daily_backup.sql.gz         # 최신 압축 매일 백업 심볼릭 링크
```

## 🚀 빠른 시작

### 1단계: 매일 백업 실행
```bash
# 프로젝트 루트에서 실행
./scripts/daily_backup.sh
```

### 2단계: 현재 프로젝트에 복원 (필요시)
```bash
# 최신 매일 백업으로 복원
./scripts/restore_to_current_project.sh

# 특정 백업 파일로 복원
./scripts/restore_to_current_project.sh dumps/convi_daily_backup_20250808_141715.sql.gz
```

## ⚙️ 자동화 설정

### 매일 자동 백업 (cron)
```bash
# crontab 편집
crontab -e

# 매일 새벽 2시에 자동 백업 실행
0 2 * * * cd /Users/minhyuk/Desktop/kdt/편의점\ 작업\ 폴더/convi && ./scripts/daily_backup.sh >> /tmp/daily_backup.log 2>&1
```

### 백업 로그 확인
```bash
# 백업 로그 확인
tail -f /tmp/daily_backup.log

# 백업 파일 목록 확인
ls -la dumps/convi_daily_backup_*
```

## 📊 백업 파일 관리

### 자동 정리
- **보관 기간**: 30일
- **정리 대상**: `convi_daily_backup_*.sql*` 파일
- **정리 시점**: 매일 백업 실행 시 자동 정리

### 수동 정리
```bash
# 7일 이전 백업 파일 삭제
find dumps/ -name "convi_daily_backup_*.sql*" -mtime +7 -delete

# 30일 이전 백업 파일 삭제
find dumps/ -name "convi_daily_backup_*.sql*" -mtime +30 -delete
```

## 🔄 복원 시나리오

### 1. 현재 프로젝트 복원 (권장)
```bash
# 최신 매일 백업으로 복원
./scripts/restore_to_current_project.sh

# 특정 날짜 백업으로 복원
./scripts/restore_to_current_project.sh dumps/convi_daily_backup_20250808_141715.sql.gz
```

### 2. 새 프로젝트에 복원 (기존 방식)
```bash
# 새 Supabase 프로젝트 생성 후
./scripts/restore_database.sh dumps/latest_daily_backup.sql.gz
```

## ⚠️ 주의사항

### 백업 시
- **자동 정리**: 30일 이전 백업 파일은 자동 삭제됩니다
- **연결 확인**: 백업 전 데이터베이스 연결을 자동으로 테스트합니다
- **압축**: 백업 파일은 자동으로 gzip 압축됩니다

### 복원 시
- **데이터 손실**: 현재 프로젝트 복원 시 기존 데이터가 모두 삭제됩니다
- **확인 절차**: 복원 전 사용자 확인을 요구합니다
- **검증**: 복원 후 핵심 테이블과 RLS 정책을 자동으로 검증합니다

## 🛠️ 문제 해결

### 백업 실패 시
```bash
# 로그 확인
tail -50 /tmp/daily_backup.log

# 수동 백업 시도
./scripts/dump_database.sh

# 연결 테스트
psql "postgresql://postgres.esbjgvnlqzseomhbsimz:minhyuk915@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" -c "SELECT 'ok' as test;"
```

### 복원 실패 시
```bash
# 복원 로그 확인
tail -50 /tmp/restore_current.log

# 수동 복원 시도
gunzip -c dumps/latest_daily_backup.sql.gz | psql "postgresql://postgres.esbjgvnlqzseomhbsimz:minhyuk915@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
```

## 📈 백업 통계

### 백업 파일 크기
- **원본 SQL**: ~766KB
- **압축 파일**: ~82KB (약 90% 압축률)

### 백업 내용
- ✅ 완전한 테이블 스키마
- ✅ RLS (Row Level Security) 정책
- ✅ 데이터베이스 함수 및 트리거
- ✅ 모든 데이터
- ✅ 인덱스 및 제약조건

## 🔄 정기 백업 권장사항

### 백업 주기
- **매일**: 자동 백업 (새벽 2시)
- **주간**: 수동 백업 (주요 변경 후)
- **월간**: 백업 파일 정리 및 검증

### 모니터링
- **로그 확인**: 매일 백업 로그 점검
- **파일 확인**: 백업 파일 생성 여부 확인
- **크기 모니터링**: 백업 파일 크기 변화 추적

## 📞 지원

문제가 발생하거나 개선 사항이 있으면:
1. 백업/복원 로그 확인
2. `.env.dump` 설정 재검토
3. 프로젝트 관리자에게 문의

---

🎉 **축하합니다!** 이제 매일 자동으로 안전하게 백업되고, 언제든지 복원할 수 있습니다! 