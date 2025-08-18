import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// 브라우저 호환성을 위한 폴리필
const downloadBlob = (blob: Blob, filename: string) => {
  try {
    // file-saver 사용
    saveAs(blob, filename);
    return true;
  } catch (err) {
    console.log('file-saver 실패, 대체 방법 시도...');
    
    try {
      // createObjectURL 사용
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err2) {
      console.log('createObjectURL도 실패, 최후 방법 시도...');
      
      try {
        // data URL 사용 (작은 파일의 경우)
        const reader = new FileReader();
        reader.onload = function(e) {
          const dataUrl = e.target?.result as string;
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        reader.readAsDataURL(blob);
        return true;
      } catch (err3) {
        console.error('모든 다운로드 방법 실패:', err3);
        return false;
      }
    }
  }
};

const ExcelTemplateDownload: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = async () => {
    try {
      setIsDownloading(true);
      setError(null);
      
      console.log('엑셀 파일 생성 시작...');
      
      const workbook = XLSX.utils.book_new();
      
      try {
        // 📋 상품정보 시트
        console.log('상품정보 시트 생성 중...');
        const productSheet = await createProductSheet();
        XLSX.utils.book_append_sheet(workbook, productSheet, '상품정보');
        
        // 📚 카테고리 가이드 시트
        console.log('카테고리 가이드 시트 생성 중...');
        const categorySheet = createCategorySheet();
        XLSX.utils.book_append_sheet(workbook, categorySheet, '카테고리가이드');
        
        // 📖 사용설명서 시트
        console.log('사용설명서 시트 생성 중...');
        const guideSheet = createGuideSheet();
        XLSX.utils.book_append_sheet(workbook, guideSheet, '사용설명서');
      } catch (sheetError) {
        console.error('시트 생성 중 오류:', sheetError);
        throw new Error('엑셀 시트 생성 중 오류가 발생했습니다.');
      }
      
      // 파일명 생성
      const fileName = `상품등록_템플릿_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      console.log('엑셀 파일을 Blob으로 변환 중...');
      
      try {
        // XLSX.writeFile 대신 Blob을 사용하여 다운로드
        const excelBuffer = XLSX.write(workbook, { 
          bookType: 'xlsx', 
          type: 'array',
          compression: true
        });
        
        const data = new Blob([excelBuffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        console.log('다운로드 시작...');
        
        const success = downloadBlob(data, fileName);
        
        if (success) {
          console.log('다운로드 성공');
          setError(null);
        } else {
          throw new Error('다운로드 실패');
        }
      } catch (downloadError) {
        console.error('Blob 다운로드 실패:', downloadError);
        
        // 직접 XLSX.writeFile 시도
        XLSX.writeFile(workbook, fileName);
        
        console.log('대체 방법으로 다운로드 성공');
        setError(null);
      }
      
    } catch (err) {
      console.error('엑셀 파일 다운로드 오류:', err);
      setError('엑셀 파일 다운로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsDownloading(false);
    }
  };

  const tryAlternativeDownload = () => {
    setError(null);
    downloadTemplate();
  };

  const downloadCSV = () => {
    try {
      console.log('CSV 다운로드 시작...');
      
      const csvContent = `상품명*,카테고리*,브랜드,제조사,단위,바코드,판매가*,원가,세율,상품설명,조리필요여부(Y/N),조리시간(분),활성상태(Y/N)*
코카콜라 330ml,음료,코카콜라,코카콜라컴퍼니,개,8801094001234,1500,1200,0.1,세계적으로 사랑받는 콜라,N,0,Y
포카칩 오리지널,과자,농심,농심,봉,8801094005678,2000,1500,0.1,바삭하고 고소한 포카칩,N,0,Y
서울우유 1L,음료,서울우유,서울우유협동조합,개,8801094009012,3000,2500,0.1,신선한 서울우유,N,0,Y`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = `상품등록_템플릿_${new Date().toISOString().split('T')[0]}.csv`;
      
      const success = downloadBlob(blob, fileName);
      
      if (success) {
        console.log('CSV 다운로드 성공');
        setError(null);
      } else {
        throw new Error('CSV 다운로드 실패');
      }
    } catch (err) {
      console.error('CSV 다운로드도 실패:', err);
      setError('모든 다운로드 방법이 실패했습니다. 브라우저 설정을 확인해주세요.');
    }
  };

  // 상품정보 시트 생성
  const createProductSheet = async () => {
    // 기존 상품 추가 모달과 동일한 필드들
    const headers = [
      '상품명*',
      '카테고리*',
      '브랜드',
      '제조사',
      '단위*',
      '바코드',
      '판매가*',
      '원가',
      '세율',
      '상품설명',
      '조리필요여부',
      '조리시간(분)',
      '활성상태*',
      '상품이미지'
    ];

    // 기존 모달과 동일한 샘플 데이터 (이미지 URL 포함)
    const sampleData = [
      [
        '코카콜라 330ml',
        '음료',
        '코카콜라',
        '코카콜라컴퍼니',
        '개',
        '8801094001234',
        '1500',
        '1200',
        '0.10',
        '세계적으로 사랑받는 콜라',
        'false',
        '0',
        'true',
        'https://example.com/cola.jpg'
      ],
      [
        '포카칩 오리지널',
        '과자',
        '농심',
        '농심',
        '봉',
        '8801094005678',
        '2000',
        '1500',
        '0.10',
        '바삭하고 고소한 포카칩',
        'false',
        '0',
        'true',
        'https://example.com/chip.jpg'
      ],
      [
        '서울우유 1L',
        '음료',
        '서울우유',
        '서울우유협동조합',
        '개',
        '8801094009012',
        '3000',
        '2500',
        '0.10',
        '신선한 서울우유',
        'false',
        '0',
        'true',
        'https://example.com/milk.jpg'
      ]
    ];

    // 입력 가이드 행 추가 (헤더와 샘플 데이터 사이)
    const inputGuideRow = [
      '← 상품명 입력 (필수)',
      '← 카테고리 선택 (필수)',
      '← 브랜드명 입력',
      '← 제조사명 입력',
      '← 단위 입력 (필수)',
      '← 13자리 바코드',
      '← 판매가 입력 (필수)',
      '← 원가 입력',
      '← 세율 입력 (기본: 0.10)',
      '← 상품 설명 입력',
      '← true/false 입력',
      '← 분 단위 입력',
      '← true/false 입력 (필수)',
      '← 이미지 URL 입력 (선택)'
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, inputGuideRow, ...sampleData]);
    
    // 열 너비 설정 (이미지 열 포함)
    worksheet['!cols'] = [
      { width: 25 }, // 상품명
      { width: 15 }, // 카테고리
      { width: 15 }, // 브랜드
      { width: 20 }, // 제조사
      { width: 10 }, // 단위
      { width: 18 }, // 바코드
      { width: 12 }, // 판매가
      { width: 10 }, // 원가
      { width: 8 },  // 세율
      { width: 30 }, // 상품설명
      { width: 15 }, // 조리필요여부
      { width: 15 }, // 조리시간
      { width: 12 }, // 활성상태
      { width: 20 }  // 상품이미지
    ];

    // 행 높이 설정 (이미지가 들어갈 행은 더 높게)
    worksheet['!rows'] = [
      { hpt: 25 }, // 헤더 행
      { hpt: 20 }, // 가이드 행
      { hpt: 80 }, // 샘플 데이터 행들 (이미지 포함)
      { hpt: 80 },
      { hpt: 80 }
    ];

    // 헤더 스타일링 - 기본 스타일
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { 
            bold: true,
            size: 11
          },
          alignment: { 
            horizontal: "center", 
            vertical: "center"
          }
        };
      }
    }

    // 1행에만 테두리 적용
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          border: {
            top: { style: "thick", color: { rgb: "000000" } },
            bottom: { style: "thick", color: { rgb: "000000" } },
            left: { style: "thick", color: { rgb: "000000" } },
            right: { style: "thick", color: { rgb: "000000" } }
          }
        };
      }
    }

    // 이미지 삽입 기능 추가 (비동기로 처리)
    await addImagesToWorksheet(worksheet, sampleData);

    return worksheet;
  };

  // 카테고리 가이드 시트 생성
  const createCategorySheet = () => {
    const data = [
      ['📚 상품 카테고리 가이드'],
      ['대분류', '중분류', '설명', '예시'],
      ['음료', '탄산음료', '탄산이 포함된 음료', '콜라, 사이다, 환타'],
      ['음료', '과일음료', '과일 주스 및 음료', '오렌지주스, 사항주스'],
      ['음료', '커피음료', '커피 관련 음료', '아메리카노, 라떼, 모카'],
      ['음료', '차음료', '차류 음료', '녹차, 홍차, 허브티'],
      ['음료', '우유/유제품', '우유 및 유제품', '우유, 요구르트, 치즈'],
      ['음료', '기타음료', '기타 음료류', '에너지드링크, 보조음료'],
      [''],
      ['과자', '스낵류', '간식용 과자', '포카칩, 새우깡, 감자칩'],
      ['과자', '초콜릿', '초콜릿 제품', '초콜릿바, 초콜릿과자'],
      ['과자', '비스킷', '비스킷류', '크래커, 쿠키, 웨하스'],
      ['과자', '캔디', '사탕류', '젤리, 껌, 사탕'],
      ['과자', '기타과자', '기타 과자류', '팝콘, 견과류'],
      [''],
      ['생활용품', '청소용품', '청소 관련 용품', '세제, 걸레, 빨래비누'],
      ['생활용품', '화장용품', '화장 관련 용품', '화장지, 물티슈, 면봉'],
      ['생활용품', '주방용품', '주방 관련 용품', '비닐봉지, 일회용품'],
      ['생활용품', '기타용품', '기타 생활용품', '배터리, 전구, 도구'],
      [''],
      ['냉동식품', '피자/파스타', '냉동 피자 및 파스타', '냉동피자, 냉동스파게티'],
      ['냉동식품', '만두/교자', '냉동 만두류', '냉동만두, 교자'],
      ['냉동식품', '치킨/육류', '냉동 육류', '냉동치킨, 냉동돈까스'],
      ['냉동식품', '기타냉동', '기타 냉동식품', '냉동새우, 냉동생선'],
      [''],
      ['빵/베이커리', '식빵/토스트', '기본 빵류', '식빵, 토스트빵'],
      ['빵/베이커리', '크로아상', '크로아상류', '크로아상, 데니시'],
      ['빵/베이커리', '케이크', '케이크류', '초코케이크, 생크림케이크'],
      ['빵/베이커리', '기타베이커리', '기타 베이커리', '도넛, 머핀'],
      [''],
      ['육류/수산물', '돼지고기', '돼지고기 제품', '돼지고기, 삼겹살'],
      ['육류/수산물', '소고기', '소고기 제품', '소고기, 등심, 안심'],
      ['육류/수산물', '닭고기', '닭고기 제품', '닭고기, 닭가슴살'],
      ['육류/수산물', '생선', '생선류', '고등어, 삼치, 연어'],
      ['육류/수산물', '기타수산물', '기타 수산물', '새우, 오징어, 조개']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // 열 너비 설정
    worksheet['!cols'] = [
      { width: 20 }, // 대분류
      { width: 20 }, // 중분류
      { width: 35 }, // 설명
      { width: 40 }  // 예시
    ];

    // 헤더 스타일링
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']!);
    
    // 제목 행 스타일링
    const titleCell = worksheet['A1'];
    if (titleCell) {
      titleCell.s = {
        font: { 
          bold: true, 
          size: 14,
          color: { rgb: "FF6B35" }
        },
        fill: { 
          fgColor: { rgb: "FFF3E0" },
          patternType: "solid"
        },
        border: {
          top: { style: "thick", color: { rgb: "FFA500" } },
          bottom: { style: "thick", color: { rgb: "FFA500" } }
        },
        alignment: { 
          horizontal: "center", 
          vertical: "center"
        }
      };
    }

    // 사용자 입력 섹션 제목 스타일링
    const userInputTitleCell = worksheet[`A${data.length + 2}`];
    if (userInputTitleCell) {
      userInputTitleCell.s = {
        font: { 
          bold: true, 
          size: 12,
          color: { rgb: "7B1FA2" }
        },
        fill: { 
          fgColor: { rgb: "F3E5F5" },
          patternType: "solid"
        },
        border: {
          top: { style: "thick", color: { rgb: "7B1FA2" } },
          bottom: { style: "thick", color: { rgb: "7B1FA2" } }
        },
        alignment: { 
          horizontal: "center", 
          vertical: "center"
        }
      };
    }

    // 헤더 행들 스타일링
    for (let col = 0; col < 4; col++) {
      // 카테고리 헤더 (2행)
      const cellAddress1 = XLSX.utils.encode_cell({ r: 2, c: col });
      if (worksheet[cellAddress1]) {
        worksheet[cellAddress1].s = {
          font: { 
            bold: true, 
            size: 11,
            color: { rgb: "FFFFFF" }
          },
          fill: { 
            fgColor: { rgb: "4472C4" },
            patternType: "solid"
          },
          border: {
            top: { style: "medium", color: { rgb: "2F528F" } },
            bottom: { style: "medium", color: { rgb: "2F528F" } },
            left: { style: "medium", color: { rgb: "2F528F" } },
            right: { style: "medium", color: { rgb: "2F528F" } }
          },
          alignment: { 
            horizontal: "center", 
            vertical: "center"
          }
        };
      }

      // 사용자 입력 섹션 헤더 (data.length + 3행)
      const cellAddress2 = XLSX.utils.encode_cell({ r: data.length + 2, c: col });
      if (worksheet[cellAddress2]) {
        worksheet[cellAddress2].s = {
          font: { 
            bold: true, 
            size: 11,
            color: { rgb: "FFFFFF" }
          },
          fill: { 
            fgColor: { rgb: "7B1FA2" },
            patternType: "solid"
          },
          border: {
            top: { style: "medium", color: { rgb: "4A148C" } },
            bottom: { style: "medium", color: { rgb: "4A148C" } },
            left: { style: "medium", color: { rgb: "4A148C" } },
            right: { style: "medium", color: { rgb: "4A148C" } }
          },
          alignment: { 
            horizontal: "center", 
            vertical: "center"
          }
        };
      }
    }

    // 데이터 행들 스타일링
    for (let row = 3; row < data.length; row++) {
      for (let col = 0; col < 4; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellAddress]) {
          const isEvenRow = row % 2 === 0;
          worksheet[cellAddress].s = {
            font: { 
              size: 10,
              color: { rgb: "333333" }
            },
            fill: { 
              fgColor: { rgb: isEvenRow ? "F8F9FA" : "FFFFFF" },
              patternType: "solid"
            },
            border: {
              top: { style: "thin", color: { rgb: "E0E0E0" } },
              bottom: { style: "thin", color: { rgb: "E0E0E0" } },
              left: { style: "thin", color: { rgb: "E0E0E0" } },
              right: { style: "thin", color: { rgb: "E0E0E0" } }
            },
            alignment: { 
              horizontal: "left", 
              vertical: "center"
            }
          };
        }
      }
    }

    // 구분선 추가
    for (let row = 8; row < data.length; row += 5) {
      for (let col = 0; col < 4; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            border: {
              top: { style: "thick", color: { rgb: "9E9E9E" } },
              bottom: { style: "thick", color: { rgb: "9E9E9E" } }
            }
          };
        }
      }
    }

    return worksheet;
  };

  // 사용설명서 시트 생성
  const createGuideSheet = () => {
    const data = [
      ['📖 상품 등록 사용설명서'],
      [''],
      ['📋 시트 구성'],
      ['• 상품정보: 실제 상품 데이터를 입력하는 메인 시트'],
      ['• 카테고리가이드: 상품 분류 기준 및 예시'],
      ['• 사용설명서: 이 파일의 사용법 안내'],
      [''],
      ['💡 상품정보 시트 사용법'],
      ['1. 상품명*: 고객에게 표시될 상품 이름 (필수 입력)'],
      ['2. 카테고리*: 드롭다운에서 선택 (필수 입력)'],
      ['3. 브랜드: 상품 브랜드명 (선택 입력)'],
      ['4. 제조사: 제조 회사명 (선택 입력)'],
      ['5. 단위*: 판매 단위 - 개, 봉, kg, L 등 (필수 입력)'],
      ['6. 바코드: 13자리 숫자 (선택 입력)'],
      ['7. 판매가*: 상품 판매 가격 (필수 입력)'],
      ['8. 원가: 상품 원가 (수익률 계산용, 선택 입력)'],
      ['9. 세율: 부가세율 (기본값: 0.10 = 10%, 선택 입력)'],
      ['10. 상품설명: 상품에 대한 설명 (선택 입력)'],
      ['11. 조리필요여부: true(필요) 또는 false(불필요) (선택 입력)'],
      ['12. 조리시간: 분 단위 (조리필요여부가 true일 때 입력, 선택)'],
      ['13. 활성상태*: true(활성) 또는 false(비활성) (필수 입력)'],
      [''],
      ['⚠️ 주의사항'],
      ['• 필수 입력 항목은 반드시 입력해야 합니다'],
      ['• 카테고리는 카테고리가이드 시트를 참고하세요'],
      ['• true/false는 소문자로 입력하세요'],
      ['• 숫자 필드는 숫자만 입력하세요'],
      ['• 이미지는 별도 업로드 시스템을 사용하세요'],
      ['• 영양정보는 별도 관리 시스템을 사용하세요'],
      ['• 알레르기정보는 별도 관리 시스템을 사용하세요'],
      [''],
      ['🔄 업로드 후 관리'],
      ['• 일괄 등록 후 개별 상품 수정 가능'],
      ['• 상품 상태 변경 (활성/비활성) 가능'],
      ['• 카테고리 변경 시 기존 상품 영향 없음'],
      ['• 가격 변경 시 즉시 반영'],
      [''],
      ['📞 문의사항'],
      ['• 기술적 문제: IT팀 (it@company.com)'],
      ['• 상품 관련: 상품팀 (product@company.com)'],
      ['• 시스템 문의: 시스템팀 (system@company.com)']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // 열 너비 설정
    worksheet['!cols'] = [
      { width: 80 }  // 설명
    ];

    // 제목 행 스타일링
    const titleCell = worksheet['A1'];
    if (titleCell) {
      titleCell.s = {
        font: { 
          bold: true, 
          size: 16,
          color: { rgb: "FF6B35" }
        },
        fill: { 
          fgColor: { rgb: "FFF3E0" },
          patternType: "solid"
        },
        border: {
          top: { style: "thick", color: { rgb: "FFA500" } },
          bottom: { style: "thick", color: { rgb: "FFA500" } }
        },
        alignment: { 
          horizontal: "center", 
          vertical: "center"
        }
      };
    }

    // 섹션 제목들 스타일링
    const sections = [
      { row: 3, title: '📋 시트 구성' },
      { row: 8, title: '💡 상품정보 시트 사용법' },
      { row: 22, title: '⚠️ 주의사항' },
      { row: 31, title: '🔄 업로드 후 관리' },
      { row: 37, title: '📞 문의사항' }
    ];

    sections.forEach(section => {
      const cellAddress = XLSX.utils.encode_cell({ r: section.row, c: 0 });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { 
            bold: true, 
            size: 12,
            color: { rgb: "1976D2" }
          },
          fill: { 
            fgColor: { rgb: "E3F2FD" },
            patternType: "solid"
          },
          border: {
            top: { style: "medium", color: { rgb: "000000" } },
            bottom: { style: "medium", color: { rgb: "000000" } }
          },
          alignment: { 
            horizontal: "left", 
            vertical: "center"
          }
        };
      }
    });

    // 번호가 있는 행들 스타일링
    for (let row = 9; row <= 21; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
      if (worksheet[cellAddress]) {
        const isEvenRow = row % 2 === 0;
        worksheet[cellAddress].s = {
          font: { 
            size: 10,
            color: { rgb: "333333" }
          },
          fill: { 
            fgColor: { rgb: isEvenRow ? "F8F9FA" : "FFFFFF" },
            patternType: "solid"
          },
          border: {
            top: { style: "thin", color: { rgb: "E0E0E0" } },
            bottom: { style: "thin", color: { rgb: "E0E0E0" } },
            left: { style: "thin", color: { rgb: "E0E0E0" } },
            right: { style: "thin", color: { rgb: "E0E0E0" } }
          },
          alignment: { 
            horizontal: "left", 
            vertical: "center"
          }
        };
      }
    }

    // 주의사항 및 관리 행들 스타일링
    for (let row = 23; row <= 30; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
      if (worksheet[cellAddress]) {
        const isEvenRow = row % 2 === 0;
        worksheet[cellAddress].s = {
          font: { 
            size: 10,
            color: { rgb: "333333" }
          },
          fill: { 
            fgColor: { rgb: isEvenRow ? "FFF3E0" : "FFFFFF" },
            patternType: "solid"
          },
          border: {
            top: { style: "thin", color: { rgb: "E0E0E0" } },
            bottom: { style: "thin", color: { rgb: "E0E0E0" } },
            left: { style: "thin", color: { rgb: "E0E0E0" } },
            right: { style: "thin", color: { rgb: "E0E0E0" } }
          },
          alignment: { 
            horizontal: "left", 
            vertical: "center"
          }
        };
      }
    }

    // 업로드 후 관리 행들 스타일링
    for (let row = 32; row <= 36; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
      if (worksheet[cellAddress]) {
        const isEvenRow = row % 2 === 0;
        worksheet[cellAddress].s = {
          font: { 
            size: 10,
            color: { rgb: "333333" }
          },
          fill: { 
            fgColor: { rgb: isEvenRow ? "E8F5E8" : "FFFFFF" },
            patternType: "solid"
          },
          border: {
            top: { style: "thin", color: { rgb: "E0E0E0" } },
            bottom: { style: "thin", color: { rgb: "E0E0E0" } },
            left: { style: "thin", color: { rgb: "E0E0E0" } },
            right: { style: "thin", color: { rgb: "E0E0E0" } }
          },
          alignment: { 
            horizontal: "left", 
            vertical: "center"
          }
        };
      }
    }

    // 문의사항 행들 스타일링
    for (let row = 38; row <= 41; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
      if (worksheet[cellAddress]) {
        const isEvenRow = row % 2 === 0;
        worksheet[cellAddress].s = {
          font: { 
            size: 10,
            color: { rgb: "333333" }
          },
          fill: { 
            fgColor: { rgb: isEvenRow ? "E3F2FD" : "FFFFFF" },
            patternType: "solid"
          },
          border: {
            top: { style: "thin", color: { rgb: "E0E0E0" } },
            bottom: { style: "thin", color: { rgb: "E0E0E0" } },
            left: { style: "thin", color: { rgb: "E0E0E0" } },
            right: { style: "thin", color: { rgb: "E0E0E0" } }
          },
          alignment: { 
            horizontal: "left", 
            vertical: "center"
          }
        };
      }
    }

    return worksheet;
  };

  // 이미지 삽입 함수
  const addImagesToWorksheet = async (worksheet: XLSX.WorkSheet, data: any[][]) => {
    // 이미지가 들어갈 셀에 이미지 표시 안내 추가
    const imageColumnIndex = 13; // 상품이미지 열 (0-based, N열)
    
    // 이미지 삽입을 위한 배열
    const images: any[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const imageUrl = row[imageColumnIndex];
      
      if (imageUrl && imageUrl !== '' && imageUrl !== 'https://example.com/cola.jpg' && 
          imageUrl !== 'https://example.com/chip.jpg' && imageUrl !== 'https://example.com/milk.jpg') {
        
        try {
          // 이미지를 Base64로 변환
          const base64Image = await convertImageToBase64(imageUrl);
          
          if (base64Image) {
            // 이미지 객체 생성 (XLSX 라이브러리 형식에 맞게)
            const image = {
              name: `image_${i}`,
              data: base64Image,
              opts: {
                base64: true,
                ext: 'png'
              }
            };
            
            images.push(image);
            
            // 이미지가 삽입될 셀에 시각적 표시 추가
            const cellAddress = XLSX.utils.encode_cell({ r: i + 2, c: imageColumnIndex });
            if (worksheet[cellAddress]) {
              worksheet[cellAddress].s = {
                ...worksheet[cellAddress].s,
                fill: { 
                  fgColor: { rgb: "E8F5E8" },
                  patternType: "solid"
                },
                font: {
                  size: 9,
                  color: { rgb: "2E7D32" },
                  italic: true
                },
                alignment: {
                  horizontal: "center",
                  vertical: "center"
                }
              };
              
              // 이미지 삽입 안내 텍스트
              worksheet[cellAddress].v = `🖼️ 이미지 삽입됨`;
            }
          }
        } catch (error) {
          console.warn(`이미지 변환 실패 (${imageUrl}):`, error);
          
          // 실패한 경우 기본 표시
          const cellAddress = XLSX.utils.encode_cell({ r: i + 2, c: imageColumnIndex });
          if (worksheet[cellAddress]) {
            // 로컬 파일 경로인 경우 특별한 안내
            if (imageUrl.startsWith('C:\\') || imageUrl.startsWith('/') || imageUrl.startsWith('file://')) {
              worksheet[cellAddress].v = `⚠️ 로컬 파일 경로는 지원되지 않습니다`;
              worksheet[cellAddress].s = {
                ...worksheet[cellAddress].s,
                fill: { 
                  fgColor: { rgb: "FFEBEE" },
                  patternType: "solid"
                },
                font: {
                  size: 9,
                  color: { rgb: "C62828" },
                  italic: true
                }
              };
            } else {
              worksheet[cellAddress].v = `🖼️ 이미지: ${imageUrl}`;
            }
          }
        }
      } else {
        // 샘플 데이터인 경우 기본 표시
        const cellAddress = XLSX.utils.encode_cell({ r: i + 2, c: imageColumnIndex });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].v = `🖼️ 이미지: ${imageUrl}`;
        }
      }
    }

    // 이미지 열 헤더에 특별한 스타일 적용
    const imageHeaderCell = XLSX.utils.encode_cell({ r: 0, c: imageColumnIndex });
    if (worksheet[imageHeaderCell]) {
      worksheet[imageHeaderCell].s = {
        ...worksheet[imageHeaderCell].s,
        fill: { 
          fgColor: { rgb: "E8F5E8" },
          patternType: "solid"
        },
        font: {
          ...worksheet[imageHeaderCell].s?.font,
          color: { rgb: "2E7D32" }
        }
      };
    }

    // 이미지 가이드 행에도 특별한 스타일 적용
    const imageGuideCell = XLSX.utils.encode_cell({ r: 1, c: imageColumnIndex });
    if (worksheet[imageGuideCell]) {
      worksheet[imageGuideCell].s = {
        ...worksheet[imageGuideCell].s,
        fill: { 
          fgColor: { rgb: "F1F8E9" },
          patternType: "solid"
        },
        font: {
          ...worksheet[imageGuideCell].s?.font,
          color: { rgb: "388E3C" }
        }
      };
    }

    // 워크시트에 이미지 배열 추가
    if (images.length > 0) {
      worksheet['!images'] = images;
      console.log(`이미지 ${images.length}개 삽입 완료:`, images);
    }
  };

  // 이미지를 Base64로 변환하는 함수 (로컬 파일과 웹 URL 모두 지원)
  const convertImageToBase64 = async (imageUrl: string): Promise<string | null> => {
    try {
      // 로컬 파일 경로인 경우
      if (imageUrl.startsWith('C:\\') || imageUrl.startsWith('/') || imageUrl.startsWith('file://')) {
        console.log('로컬 파일 경로 감지:', imageUrl);
        
        // 로컬 파일은 직접 접근할 수 없으므로 안내 메시지 반환
        return null;
      }
      
      // 웹 URL인 경우
      console.log('웹 URL에서 이미지 다운로드 중:', imageUrl);
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Base64 데이터에서 헤더 제거
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('이미지 변환 오류:', error);
      return null;
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto ${className}`}>
      {/* 헤더 섹션 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          📊 엑셀 템플릿 다운로드
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          상품 정보를 일괄 등록할 수 있는 엑셀 템플릿을 다운로드하세요.
          기존 모달과 동일한 필드 구성으로 쉽게 사용할 수 있습니다.
        </p>
      </div>

      {/* 새로운 기능 안내 */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
          <span className="mr-2">✨</span>
          기존 모달과 동일한 구성 + 이미지 기능
        </h2>
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>상품명, 카테고리, 단위, 판매가, 활성상태 (필수)</span>
          </div>
          <div className="flex items-start">
            <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>브랜드, 제조사, 바코드, 원가, 세율 (선택)</span>
          </div>
          <div className="flex items-start">
            <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>상품설명, 조리필요여부, 조리시간 (선택)</span>
          </div>
          <div className="flex items-start">
            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>🖼️ 상품이미지 URL 입력 시 엑셀에 이미지 삽입 (선택)</span>
          </div>
          <div className="text-xs text-amber-600 mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <strong>📝 이미지 URL 안내:</strong><br/>
            • 웹 URL만 지원: https://example.com/image.jpg<br/>
            • 로컬 파일 경로는 지원되지 않음: C:\Pictures\image.png<br/>
            • 이미지가 공개적으로 접근 가능해야 함
          </div>
          <div className="flex items-start">
            <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>이미지, 영양정보, 알레르기정보는 별도 관리</span>
          </div>
        </div>
      </div>

      {/* 에러 메시지 표시 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-white text-sm">!</span>
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={tryAlternativeDownload}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  다시 시도
                </button>
                <button
                  onClick={downloadCSV}
                  className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                >
                  CSV로 다운로드
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={downloadTemplate}
        disabled={isDownloading}
        className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
          isDownloading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isDownloading ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span className="text-lg">다운로드 중...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-lg">엑셀 템플릿 다운로드</span>
          </>
        )}
      </button>

      {/* 대체 다운로드 옵션 */}
      <div className="mt-6 space-y-3">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">다운로드에 문제가 있나요?</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={tryAlternativeDownload}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              직접 다운로드
            </button>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              CSV 템플릿
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-center">
          <span className="text-blue-600 text-sm font-medium">
            💡 다운로드 후 카테고리가이드를 참고하여 상품 정보를 입력하세요
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExcelTemplateDownload;
