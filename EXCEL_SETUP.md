# 엑셀 다운로드 기능 설정 가이드

## 🚀 자동 설정

이 프로젝트는 엑셀 다운로드 기능을 자동으로 설정합니다.

### 설치 후 자동 실행
```bash
npm install
```

`npm install` 실행 시 자동으로 엑셀 기능이 설정됩니다.

### 수동 설정
```bash
npm run setup:excel
```

## 📦 필요한 패키지

- `exceljs`: Excel 파일 생성 및 편집
- `file-saver`: 파일 다운로드 처리
- `@types/file-saver`: TypeScript 타입 정의

## ⚙️ 설정 파일

`excel-config.json` 파일에서 다음을 설정할 수 있습니다:

- 기능 활성화/비활성화
- 파일명 템플릿
- 스타일링 옵션
- 색상 및 폰트 설정

## 🔧 사용법

### 기본 사용법
```typescript
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const downloadExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('시트명');
  
  // 데이터 입력
  worksheet.getCell('A1').value = '데이터';
  
  // 파일 생성 및 다운로드
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(blob, '파일명.xlsx');
};
```

## 📋 지원하는 기능

- ✅ 물류 요청서 (StoreSupply)
- ✅ 본사 물류 관리 (HQSupply)
- 🔄 주문 관리 (OrderManagement) - 개발 중
- 🔄 재고 현황 (InventoryReport) - 개발 중

## 🎨 스타일링 옵션

- 폰트: 맑은 고딕
- 기본 크기: 10pt
- 헤더 크기: 12pt
- 제목 크기: 16pt
- 색상: 파란색, 연한 빨간색, 회색 테마

## ❓ 문제 해결

### 패키지 누락 오류
```bash
npm install exceljs file-saver @types/file-saver
```

### 설정 파일 오류
`excel-config.json` 파일을 삭제하고 `npm run setup:excel`을 실행하세요.

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 모든 패키지가 설치되었는지
2. 설정 파일이 올바른지
3. Node.js 버전이 16 이상인지
