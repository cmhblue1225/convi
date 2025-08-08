#!/bin/bash

# 편의점 관리 시스템 - 현재 프로젝트 복원 스크립트
# 작성일: 2025-08-08
# 사용법: ./scripts/restore_to_current_project.sh [덤프파일경로]

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 로그 함수들
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# 환경 변수 로드
if [ -f ".env.dump" ]; then
    source .env.dump
    log_info ".env.dump 파일에서 설정을 로드했습니다."
else
    log_warning ".env.dump 파일이 없습니다. 기본값을 사용합니다."
fi

# 현재 프로젝트 설정값
PROJECT_ID="${SUPABASE_PROJECT_ID:-esbjgvnlqzseomhbsimz}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-minhyuk915}"
DB_HOST="${SUPABASE_DB_HOST:-aws-0-ap-northeast-1.pooler.supabase.com}"
DB_PORT="${SUPABASE_DB_PORT:-6543}"
DB_NAME="${SUPABASE_DB_NAME:-postgres}"

# 덤프 파일 경로 설정
DUMP_FILE="${1:-dumps/latest_daily_backup.sql.gz}"
DUMP_DIR="./dumps"

# PostgreSQL 17 경로 확인
PG_RESTORE_PATH="/opt/homebrew/opt/postgresql@17/bin/psql"
if [ ! -f "$PG_RESTORE_PATH" ]; then
    log_error "PostgreSQL 17이 설치되지 않았습니다."
    log_info "다음 명령어로 설치하세요: brew install postgresql@17"
    exit 1
fi

# 연결 문자열 구성
DB_URL="postgresql://postgres.${PROJECT_ID}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

log_info "=================================="
log_info "🔄 현재 프로젝트 복원 시작"
log_info "=================================="
log_info "프로젝트 ID: $PROJECT_ID"
log_info "데이터베이스 호스트: $DB_HOST"
log_info "복원 파일: $DUMP_FILE"
log_info "=================================="

# 덤프 파일 존재 확인
if [ ! -f "$DUMP_FILE" ]; then
    log_error "덤프 파일을 찾을 수 없습니다: $DUMP_FILE"
    log_info "사용 가능한 덤프 파일들:"
    if [ -d "$DUMP_DIR" ]; then
        ls -la "$DUMP_DIR"/*.sql* 2>/dev/null || log_warning "덤프 파일이 없습니다."
    fi
    log_info "사용법: ./scripts/restore_to_current_project.sh [덤프파일경로]"
    exit 1
fi

# 파일 정보 표시
FILE_SIZE=$(ls -lh "$DUMP_FILE" | awk '{print $5}')
log_info "덤프 파일 크기: $FILE_SIZE"

# 데이터베이스 연결 테스트
log_step "🔍 현재 프로젝트 연결 테스트 중..."
if command -v psql > /dev/null 2>&1; then
    if ! echo '\q' | psql "$DB_URL" > /dev/null 2>&1; then
        log_error "현재 프로젝트 연결에 실패했습니다."
        log_error "연결 정보를 확인하세요:"
        log_error "  - 프로젝트 ID: $PROJECT_ID"
        log_error "  - 비밀번호: [확인 필요]"
        log_error "  - 호스트: $DB_HOST"
        exit 1
    fi
else
    log_warning "psql을 찾을 수 없어 연결 테스트를 건너뜁니다."
fi
log_success "현재 프로젝트 연결 성공!"

# 기존 데이터 백업 확인
log_step "⚠️  기존 데이터 확인 중..."
EXISTING_TABLES=$(echo "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | psql "$DB_URL" -t 2>/dev/null | tr -d ' ')
EXISTING_TABLES=${EXISTING_TABLES:-0}

if [ "$EXISTING_TABLES" -gt 0 ]; then
    log_warning "현재 프로젝트에 기존 테이블이 $EXISTING_TABLES개 있습니다."
    log_warning "⚠️  주의: 복원 시 기존 데이터가 모두 삭제됩니다!"
    read -p "정말로 현재 프로젝트를 복원하시겠습니까? (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "복원이 취소되었습니다."
        exit 0
    fi
fi

# 복원 실행
log_step "📥 현재 프로젝트 복원 실행 중..."
log_info "이 작업은 몇 분이 소요될 수 있습니다..."

if [[ "$DUMP_FILE" == *.gz ]]; then
    log_info "압축 파일을 복원하는 중..."
    if gunzip -c "$DUMP_FILE" | psql "$DB_URL" > /tmp/restore_current.log 2>&1; then
        log_success "압축 덤프 복원 완료!"
    else
        log_error "복원 중 오류가 발생했습니다."
        log_error "로그 확인: tail -50 /tmp/restore_current.log"
        exit 1
    fi
else
    log_info "일반 SQL 파일을 복원하는 중..."
    if psql "$DB_URL" < "$DUMP_FILE" > /tmp/restore_current.log 2>&1; then
        log_success "SQL 덤프 복원 완료!"
    else
        log_error "복원 중 오류가 발생했습니다."
        log_error "로그 확인: tail -50 /tmp/restore_current.log"
        exit 1
    fi
fi

# 복원 결과 검증
log_step "✅ 복원 결과 검증 중..."

# 테이블 개수 확인
RESTORED_TABLES=$(echo "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | psql "$DB_URL" -t 2>/dev/null | tr -d ' ')
log_info "복원된 public 테이블 수: $RESTORED_TABLES개"

# 핵심 테이블 확인
CORE_TABLES=("profiles" "stores" "products" "orders" "categories")
MISSING_TABLES=()

for table in "${CORE_TABLES[@]}"; do
    TABLE_EXISTS=$(echo "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');" | psql "$DB_URL" -t 2>/dev/null | tr -d ' ')
    if [ "$TABLE_EXISTS" = "t" ]; then
        log_success "✓ $table 테이블 복원 완료"
    else
        log_error "✗ $table 테이블 누락"
        MISSING_TABLES+=("$table")
    fi
done

# RLS 정책 확인
RLS_POLICIES=$(echo "SELECT count(*) FROM pg_policy;" | psql "$DB_URL" -t 2>/dev/null | tr -d ' ')
log_info "RLS 정책 수: $RLS_POLICIES개"

# 함수 확인
FUNCTIONS=$(echo "SELECT count(*) FROM information_schema.routines WHERE routine_schema = 'public';" | psql "$DB_URL" -t 2>/dev/null | tr -d ' ')
log_info "사용자 함수 수: $FUNCTIONS개"

# 결과 요약
log_info "=================================="
if [ ${#MISSING_TABLES[@]} -eq 0 ]; then
    log_success "🎉 현재 프로젝트 복원 완료!"
    log_info "=================================="
    log_info "📊 복원 요약:"
    log_info "  • 테이블: $RESTORED_TABLES개"
    log_info "  • RLS 정책: $RLS_POLICIES개"
    log_info "  • 함수: $FUNCTIONS개"
    log_info "  • 핵심 테이블: ✅ 모두 정상"
    log_info ""
    log_info "🔗 프로젝트 접속 정보:"
    log_info "  • 프로젝트 URL: https://$PROJECT_ID.supabase.co"
    log_info "  • Dashboard: https://supabase.com/dashboard/project/$PROJECT_ID"
    log_info ""
    log_info "📝 다음 단계:"
    log_info "  1. Supabase Dashboard에서 데이터 확인"
    log_info "  2. 애플리케이션 연결 테스트"
    log_info "  3. 필요시 추가 설정 조정"
else
    log_error "복원 중 일부 문제가 발생했습니다."
    log_error "누락된 테이블: ${MISSING_TABLES[*]}"
    log_error "로그 확인: tail -50 /tmp/restore_current.log"
fi
log_info "=================================="

log_success "🎊 현재 프로젝트 복원 작업이 완료되었습니다!" 