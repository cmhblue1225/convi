#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 엑셀 다운로드 기능 자동 설정을 시작합니다...');

// package.json 읽기
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 엑셀 설정 확인
if (!packageJson.excelDownload || !packageJson.excelDownload.enabled) {
  console.log('⚠️  엑셀 다운로드 기능이 비활성화되어 있습니다.');
  process.exit(0);
}

console.log('✅ 엑셀 다운로드 기능이 활성화되어 있습니다.');

// 필요한 패키지 확인
const requiredPackages = [
  'exceljs',
  'file-saver',
  '@types/file-saver'
];

const missingPackages = requiredPackages.filter(pkg => {
  return !packageJson.dependencies[pkg] && !packageJson.devDependencies[pkg];
});

if (missingPackages.length > 0) {
  console.log(`❌ 누락된 패키지: ${missingPackages.join(', ')}`);
  console.log('📦 다음 명령어로 설치하세요:');
  console.log(`npm install ${missingPackages.join(' ')}`);
  process.exit(1);
}

console.log('✅ 모든 필요한 패키지가 설치되어 있습니다.');

// 설정 파일 확인
const configPath = path.join(__dirname, '..', 'excel-config.json');
if (!fs.existsSync(configPath)) {
  console.log('❌ excel-config.json 파일이 없습니다.');
  console.log('📝 기본 설정 파일을 생성합니다...');
  
  const defaultConfig = {
    "excelDownload": {
      "enabled": true,
      "packages": {
        "exceljs": "^4.4.0",
        "file-saver": "^2.0.5",
        "@types/file-saver": "^2.0.7"
      },
      "features": {
        "storeSupply": {
          "enabled": true,
          "template": "물류요청서_거래명세서",
          "filename": "물류요청서_거래명세서_{요청번호}_{날짜}.xlsx"
        },
        "hqSupply": {
          "enabled": true,
          "template": "본사_물류요청관리",
          "filename": "본사_물류요청관리_{요청번호}_{날짜}.xlsx"
        },
        "orderManagement": {
          "enabled": false,
          "template": "주문관리",
          "filename": "주문관리_{주문번호}_{날짜}.xlsx"
        },
        "inventoryReport": {
          "enabled": false,
          "template": "재고현황",
          "filename": "재고현황_{날짜}.xlsx"
        }
      },
      "styling": {
        "defaultFont": "맑은 고딕",
        "defaultFontSize": 10,
        "headerFontSize": 12,
        "titleFontSize": 16,
        "colors": {
          "header": "FFF0F8FF",
          "summary": "FFFFF0F0",
          "label": "FFF5F5F5",
          "border": "FF000000"
        }
      }
    }
  };
  
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  console.log('✅ excel-config.json 파일이 생성되었습니다.');
} else {
  console.log('✅ excel-config.json 파일이 존재합니다.');
}

// README 파일 생성
const readmePath = path.join(__dirname, '..', 'EXCEL_SETUP.md');
if (!fs.existsSync(readmePath)) {
  console.log('📝 엑셀 설정 가이드를 생성합니다...');
  
  const readmeContent = `# 엑셀 다운로드 기능 설정 가이드

## 🚀 자동 설정

이 프로젝트는 엑셀 다운로드 기능을 자동으로 설정합니다.

### 설치 후 자동 실행
\`\`\`bash
npm install
\`\`\`

\`npm install\` 실행 시 자동으로 엑셀 기능이 설정됩니다.

### 수동 설정
\`\`\`bash
npm run setup:excel
\`\`\`

## 📦 필요한 패키지

- \`exceljs\`: Excel 파일 생성 및 편집
- \`file-saver\`: 파일 다운로드 처리
- \`@types/file-saver\`: TypeScript 타입 정의

## ⚙️ 설정 파일

\`excel-config.json\` 파일에서 다음을 설정할 수 있습니다:

- 기능 활성화/비활성화
- 파일명 템플릿
- 스타일링 옵션
- 색상 및 폰트 설정

## 🔧 사용법

### 기본 사용법
\`\`\`typescript
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
\`\`\`

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
\`\`\`bash
npm install exceljs file-saver @types/file-saver
\`\`\`

### 설정 파일 오류
\`excel-config.json\` 파일을 삭제하고 \`npm run setup:excel\`을 실행하세요.

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 모든 패키지가 설치되었는지
2. 설정 파일이 올바른지
3. Node.js 버전이 16 이상인지
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log('✅ EXCEL_SETUP.md 파일이 생성되었습니다.');
}

console.log('🎉 엑셀 다운로드 기능 설정이 완료되었습니다!');
console.log('📚 EXCEL_SETUP.md 파일을 참고하여 사용하세요.');
console.log('🚀 이제 엑셀 다운로드 기능을 사용할 수 있습니다!');

