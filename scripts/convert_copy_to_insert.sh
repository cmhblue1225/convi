#!/bin/bash

# COPY 문을 INSERT 문으로 변환하는 스크립트
INPUT_FILE="dumps/public_only_restore.sql"
OUTPUT_FILE="dumps/insert_restore.sql"

echo "COPY 문을 INSERT 문으로 변환하는 중..."

# 헤더 부분은 그대로 유지 (COPY 문이 시작되기 전까지)
sed '/^COPY/,$d' "$INPUT_FILE" > "$OUTPUT_FILE"

# COPY 문을 INSERT 문으로 변환
awk '
BEGIN { in_copy = 0; table_name = ""; columns = "" }

/^COPY/ {
    in_copy = 1
    # COPY public.table_name (col1, col2, ...) FROM stdin; 파싱
    match($0, /^COPY ([^(]+)\s*\(([^)]+)\)/, arr)
    table_name = arr[1]
    columns = arr[2]
    next
}

/^\\./ {
    in_copy = 0
    next
}

in_copy == 1 && NF > 0 {
    # 데이터 라인을 INSERT 문으로 변환
    gsub(/\t/, "', '", $0)  # 탭을 따옴표로 변환
    gsub(/\\N/, "NULL", $0)  # NULL 값 처리
    gsub(/'"'"'NULL'"'"'/, "NULL", $0)  # 따옴표로 둘러싸인 NULL 제거
    
    printf "INSERT INTO %s (%s) VALUES ('\''%s'\'');\n", table_name, columns, $0
}

in_copy == 0 && !/^COPY/ && !/^\\./ {
    if (!in_copy) print
}
' "$INPUT_FILE" >> "$OUTPUT_FILE"

echo "변환 완료: $OUTPUT_FILE"
wc -l "$OUTPUT_FILE"