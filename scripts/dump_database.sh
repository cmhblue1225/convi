#!/bin/bash

# 편의점 관리 시스템 - 데이터베이스 덤프 자동화 스크립트
# 작성일: 2025-08-08
# 사용법: ./scripts/dump_database.sh

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# 환경 변수 로드
if [ -f ".env.dump" ]; then
    source .env.dump
    log_info ".env.dump 파일에서 설정을 로드했습니다."
else
    log_warning ".env.dump 파일이 없습니다. 기본값을 사용합니다."
fi

# 기본 설정값
PROJECT_ID="${SUPABASE_PROJECT_ID:-esbjgvnlqzseomhbsimz}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-minhyuk915}"
DB_HOST="${SUPABASE_DB_HOST:-aws-0-ap-northeast-1.pooler.supabase.com}"
DB_PORT="${SUPABASE_DB_PORT:-6543}"
DB_NAME="${SUPABASE_DB_NAME:-postgres}"
OUTPUT_DIR="${DUMP_OUTPUT_DIR:-./dumps}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILENAME="convi_dump_${TIMESTAMP}"

# PostgreSQL 17 경로 확인
PG_DUMP_PATH="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
if [ ! -f "$PG_DUMP_PATH" ]; then
    log_error "PostgreSQL 17이 설치되지 않았습니다."
    log_info "다음 명령어로 설치하세요: brew install postgresql@17"
    exit 1
fi

# 출력 디렉토리 생성
mkdir -p "$OUTPUT_DIR"
log_info "출력 디렉토리: $OUTPUT_DIR"

# 연결 문자열 구성
DB_URL="postgresql://postgres.${PROJECT_ID}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

log_info "=================================="
log_info "📦 편의점 DB 덤프 자동화 시작"
log_info "=================================="
log_info "프로젝트 ID: $PROJECT_ID"
log_info "데이터베이스 호스트: $DB_HOST"
log_info "출력 파일명: ${DUMP_FILENAME}.sql"
log_info "=================================="

# 데이터베이스 연결 테스트
log_info "🔍 데이터베이스 연결 테스트 중..."
# 간단한 연결 테스트를 위해 psql 사용
if command -v psql > /dev/null 2>&1; then
    if ! echo '\q' | psql "$DB_URL" > /dev/null 2>&1; then
        log_error "데이터베이스 연결에 실패했습니다."
        log_error "연결 정보를 확인하세요:"
        log_error "  - 프로젝트 ID: $PROJECT_ID"
        log_error "  - 비밀번호: [확인 필요]"
        log_error "  - 호스트: $DB_HOST"
        exit 1
    fi
else
    log_warning "psql을 찾을 수 없어 연결 테스트를 건너뜁니다."
fi
log_success "데이터베이스 연결 준비 완료!"

# 덤프 실행
log_info "📤 데이터베이스 덤프 실행 중..."
$PG_DUMP_PATH "$DB_URL" \
    --verbose \
    --clean \
    --no-owner \
    --no-privileges \
    --file="${OUTPUT_DIR}/${DUMP_FILENAME}.sql" \
    2>&1 | grep -E "(저장|만드는|삭제)" || true

if [ $? -eq 0 ]; then
    log_success "덤프 파일 생성 완료: ${OUTPUT_DIR}/${DUMP_FILENAME}.sql"
else
    log_error "덤프 생성 중 오류가 발생했습니다."
    exit 1
fi

# 파일 크기 확인
DUMP_SIZE=$(ls -lh "${OUTPUT_DIR}/${DUMP_FILENAME}.sql" | awk '{print $5}')
log_info "덤프 파일 크기: $DUMP_SIZE"

# 압축 실행
log_info "🗜️  파일 압축 중..."
gzip -k "${OUTPUT_DIR}/${DUMP_FILENAME}.sql"

if [ $? -eq 0 ]; then
    COMPRESSED_SIZE=$(ls -lh "${OUTPUT_DIR}/${DUMP_FILENAME}.sql.gz" | awk '{print $5}')
    log_success "압축 파일 생성 완료: ${OUTPUT_DIR}/${DUMP_FILENAME}.sql.gz"
    log_info "압축 파일 크기: $COMPRESSED_SIZE"
else
    log_error "압축 중 오류가 발생했습니다."
    exit 1
fi

# 최신 덤프 심볼릭 링크 생성
log_info "🔗 최신 덤프 링크 생성 중..."
ln -sf "${DUMP_FILENAME}.sql" "${OUTPUT_DIR}/latest_dump.sql"
ln -sf "${DUMP_FILENAME}.sql.gz" "${OUTPUT_DIR}/latest_dump.sql.gz"
log_success "최신 덤프 링크 생성 완료"

# 결과 요약
log_info "=================================="
log_success "✅ 데이터베이스 덤프 완료!"
log_info "=================================="
log_info "📁 생성된 파일들:"
log_info "  • 원본: ${OUTPUT_DIR}/${DUMP_FILENAME}.sql ($DUMP_SIZE)"
log_info "  • 압축: ${OUTPUT_DIR}/${DUMP_FILENAME}.sql.gz ($COMPRESSED_SIZE)"
log_info "  • 최신: ${OUTPUT_DIR}/latest_dump.sql.gz"
log_info ""
log_info "📤 팀원 공유 방법:"
log_info "  1. ${OUTPUT_DIR}/${DUMP_FILENAME}.sql.gz 파일을 공유"
log_info "  2. DATABASE_DUMP_README.md 안내서도 함께 공유"
log_info ""
log_info "🔄 다음 덤프 실행: ./scripts/dump_database.sh"
log_info "=================================="

# 이전 덤프 파일 정리 (선택사항)
OLD_DUMPS=$(find "$OUTPUT_DIR" -name "convi_dump_*.sql" -mtime +7 | wc -l | tr -d ' ')
if [ "$OLD_DUMPS" -gt 0 ]; then
    log_warning "7일 이전 덤프 파일 $OLD_DUMPS 개 발견"
    read -p "이전 덤프 파일들을 삭제하시겠습니까? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        find "$OUTPUT_DIR" -name "convi_dump_*.sql*" -mtime +7 -delete
        log_success "이전 덤프 파일들이 삭제되었습니다."
    fi
fi

log_success "🎉 모든 작업이 완료되었습니다!"