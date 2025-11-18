#!/bin/bash

# 편의점 관리 시스템 - 테스트 프로젝트 생성 및 복원 스크립트
# 작성일: 2025-08-08
# 사용법: ./scripts/create_test_project_and_restore.sh

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

# 기본 설정값
SOURCE_PROJECT_ID="${SUPABASE_PROJECT_ID:-esbjgvnlqzseomhbsimz}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-minhyuk915}"
DUMP_FILE="dumps/latest_dump.sql.gz"

log_info "=================================="
log_info "🧪 테스트 프로젝트 생성 및 복원 가이드"
log_info "=================================="
log_info "소스 프로젝트 ID: $SOURCE_PROJECT_ID"
log_info "백업 파일: $DUMP_FILE"
log_info "=================================="

# 백업 파일 확인
if [ ! -f "$DUMP_FILE" ]; then
    log_error "백업 파일을 찾을 수 없습니다: $DUMP_FILE"
    log_info "사용 가능한 백업 파일들:"
    ls -la dumps/*.sql* 2>/dev/null || log_warning "백업 파일이 없습니다."
    exit 1
fi

FILE_SIZE=$(ls -lh "$DUMP_FILE" | awk '{print $5}')
log_info "백업 파일 크기: $FILE_SIZE"

log_step "📋 1단계: Supabase 대시보드에서 새 프로젝트 생성"
echo ""
log_info "다음 단계를 따라 새 프로젝트를 생성하세요:"
echo ""
log_info "1. https://supabase.com/dashboard 접속"
log_info "2. 'New Project' 클릭"
log_info "3. 프로젝트 설정:"
log_info "   - Name: convi-test-restore"
log_info "   - Database Password: $DB_PASSWORD"
log_info "   - Region: Northeast Asia (Tokyo)"
log_info "4. 'Create new project' 클릭"
echo ""

read -p "새 프로젝트가 생성되었나요? (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "프로젝트 생성이 취소되었습니다."
    exit 0
fi

log_step "📋 2단계: 새 프로젝트 정보 입력"
echo ""
log_info "새로 생성된 프로젝트의 정보를 입력하세요:"
echo ""

read -p "새 프로젝트 ID (예: abcdefghijklmnopqrstuvwxyz): " NEW_PROJECT_ID
read -p "새 프로젝트 리전 (예: aws-0-ap-northeast-1.pooler.supabase.com): " NEW_DB_HOST

if [ -z "$NEW_PROJECT_ID" ] || [ -z "$NEW_DB_HOST" ]; then
    log_error "프로젝트 ID와 호스트 정보가 필요합니다."
    exit 1
fi

log_info "입력된 정보:"
log_info "  - 새 프로젝트 ID: $NEW_PROJECT_ID"
log_info "  - 새 DB 호스트: $NEW_DB_HOST"
log_info "  - DB 비밀번호: $DB_PASSWORD"

log_step "📋 3단계: 새 프로젝트 연결 테스트"
echo ""

# 새 프로젝트 연결 테스트
NEW_DB_URL="postgresql://postgres.${NEW_PROJECT_ID}:${DB_PASSWORD}@${NEW_DB_HOST}:6543/postgres"

log_info "새 프로젝트 연결 테스트 중..."
if command -v psql > /dev/null 2>&1; then
    if echo '\q' | psql "$NEW_DB_URL" > /dev/null 2>&1; then
        log_success "새 프로젝트 연결 성공!"
    else
        log_error "새 프로젝트 연결에 실패했습니다."
        log_error "연결 정보를 확인하세요:"
        log_error "  - 프로젝트 ID: $NEW_PROJECT_ID"
        log_error "  - 비밀번호: $DB_PASSWORD"
        log_error "  - 호스트: $NEW_DB_HOST"
        exit 1
    fi
else
    log_warning "psql을 찾을 수 없어 연결 테스트를 건너뜁니다."
fi

log_step "📋 4단계: 백업 복원 실행"
echo ""

read -p "새 프로젝트에 백업을 복원하시겠습니까? (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "복원이 취소되었습니다."
    exit 0
fi

log_info "백업 복원을 시작합니다..."
log_info "이 작업은 몇 분이 소요될 수 있습니다..."

# 복원 실행
if [[ "$DUMP_FILE" == *.gz ]]; then
    log_info "압축 파일을 복원하는 중..."
    if gunzip -c "$DUMP_FILE" | psql "$NEW_DB_URL" > /tmp/restore_test.log 2>&1; then
        log_success "압축 덤프 복원 완료!"
    else
        log_error "복원 중 오류가 발생했습니다."
        log_error "로그 확인: tail -50 /tmp/restore_test.log"
        exit 1
    fi
else
    log_info "일반 SQL 파일을 복원하는 중..."
    if psql "$NEW_DB_URL" < "$DUMP_FILE" > /tmp/restore_test.log 2>&1; then
        log_success "SQL 덤프 복원 완료!"
    else
        log_error "복원 중 오류가 발생했습니다."
        log_error "로그 확인: tail -50 /tmp/restore_test.log"
        exit 1
    fi
fi

log_step "📋 5단계: 복원 결과 검증"
echo ""

# 복원 결과 검증
log_info "복원 결과를 검증하는 중..."

# 테이블 개수 확인
RESTORED_TABLES=$(echo "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | psql "$NEW_DB_URL" -t 2>/dev/null | tr -d ' ')
log_info "복원된 public 테이블 수: $RESTORED_TABLES개"

# 핵심 테이블 확인
CORE_TABLES=("profiles" "stores" "products" "orders" "categories")
MISSING_TABLES=()

for table in "${CORE_TABLES[@]}"; do
    TABLE_EXISTS=$(echo "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');" | psql "$NEW_DB_URL" -t 2>/dev/null | tr -d ' ')
    if [ "$TABLE_EXISTS" = "t" ]; then
        log_success "✓ $table 테이블 복원 완료"
    else
        log_error "✗ $table 테이블 누락"
        MISSING_TABLES+=("$table")
    fi
done

# RLS 정책 확인
RLS_POLICIES=$(echo "SELECT count(*) FROM pg_policy;" | psql "$NEW_DB_URL" -t 2>/dev/null | tr -d ' ')
log_info "RLS 정책 수: $RLS_POLICIES개"

# 함수 확인
FUNCTIONS=$(echo "SELECT count(*) FROM information_schema.routines WHERE routine_schema = 'public';" | psql "$NEW_DB_URL" -t 2>/dev/null | tr -d ' ')
log_info "사용자 함수 수: $FUNCTIONS개"

# 결과 요약
log_info "=================================="
if [ ${#MISSING_TABLES[@]} -eq 0 ]; then
    log_success "🎉 테스트 프로젝트 복원 완료!"
    log_info "=================================="
    log_info "📊 복원 요약:"
    log_info "  • 테이블: $RESTORED_TABLES개"
    log_info "  • RLS 정책: $RLS_POLICIES개"
    log_info "  • 함수: $FUNCTIONS개"
    log_info "  • 핵심 테이블: ✅ 모두 정상"
    log_info ""
    log_info "🔗 새 프로젝트 접속 정보:"
    log_info "  • 프로젝트 URL: https://$NEW_PROJECT_ID.supabase.co"
    log_info "  • Dashboard: https://supabase.com/dashboard/project/$NEW_PROJECT_ID"
    log_info ""
    log_info "📝 다음 단계:"
    log_info "  1. Supabase Dashboard에서 데이터 확인"
    log_info "  2. 애플리케이션 연결 테스트"
    log_info "  3. 필요시 추가 설정 조정"
    log_info ""
    log_info "🔧 환경 변수 설정:"
    log_info "  VITE_SUPABASE_URL=https://$NEW_PROJECT_ID.supabase.co"
    log_info "  VITE_SUPABASE_ANON_KEY=[Dashboard에서 확인]"
else
    log_error "복원 중 일부 문제가 발생했습니다."
    log_error "누락된 테이블: ${MISSING_TABLES[*]}"
    log_error "로그 확인: tail -50 /tmp/restore_test.log"
fi
log_info "=================================="

log_success "🎊 테스트 프로젝트 생성 및 복원 작업이 완료되었습니다!" 