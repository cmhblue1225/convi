import * as ExcelJS from 'exceljs';

export interface SignatureData {
  approverName: string;
  approvalDate: string;
  signatureImage: string; // base64 이미지 데이터
}

/**
 * 엑셀 워크시트에 서명 정보를 추가하는 함수
 */
export const addSignatureToExcel = async (
  worksheet: ExcelJS.Worksheet,
  signatureData: SignatureData,
  startRow: number,
  startCol: number = 2
) => {
  try {
    // 승인자 정보 행
    const approverRow = startRow;
    worksheet.getCell(approverRow, startCol).value = '승인자';
    worksheet.getCell(approverRow, startCol + 1).value = signatureData.approverName;
    worksheet.getCell(approverRow, startCol + 2).value = '승인일시';
    worksheet.getCell(approverRow, startCol + 3).value = signatureData.approvalDate;

    // 승인자 정보 스타일
    for (let col = startCol; col <= startCol + 3; col++) {
      const cell = worksheet.getCell(approverRow, col);
      if (col === startCol || col === startCol + 2) {
        cell.font = { name: '맑은 고딕', size: 10, bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      } else {
        cell.font = { name: '맑은 고딕', size: 10 };
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: col === startCol || col === startCol + 2 ? 'center' : 'left' };
    }

    // 셀 병합
    worksheet.mergeCells(approverRow, startCol + 1, approverRow, startCol + 1);
    worksheet.mergeCells(approverRow, startCol + 3, approverRow, startCol + 3);

    // 서명 이미지 행
    const signatureRow = startRow + 1;
    worksheet.getCell(signatureRow, startCol).value = '서명';
    
    // 서명 이미지 추가
    if (signatureData.signatureImage) {
      try {
        // base64 이미지를 ExcelJS Image 객체로 변환
        const imageId = worksheet.workbook.addImage({
          base64: signatureData.signatureImage.split(',')[1], // base64 데이터 부분만 추출
          extension: 'png',
        });

        // 서명 이미지 위치 설정 (승인자 이름 아래)
        worksheet.addImage(imageId, {
          tl: { col: startCol + 1, row: signatureRow - 0.2 },
          br: { col: startCol + 3, row: signatureRow + 0.8 }
        });

        // 서명 이미지 영역 셀 병합
        worksheet.mergeCells(signatureRow, startCol + 1, signatureRow + 1, startCol + 3);
        
        // 서명 라벨 셀 스타일
        const labelCell = worksheet.getCell(signatureRow, startCol);
        labelCell.font = { name: '맑은 고딕', size: 10, bold: true };
        labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
        labelCell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        labelCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // 서명 이미지 영역 테두리
        for (let row = signatureRow; row <= signatureRow + 1; row++) {
          for (let col = startCol + 1; col <= startCol + 3; col++) {
            const cell = worksheet.getCell(row, col);
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } }
            };
          }
        }

      } catch (imageError) {
        console.warn('서명 이미지 추가 실패:', imageError);
        // 이미지 추가 실패 시 텍스트로 대체
        worksheet.getCell(signatureRow, startCol + 1).value = '[서명 이미지]';
        worksheet.mergeCells(signatureRow, startCol + 1, signatureRow + 1, startCol + 3);
      }
    }

    // 행 높이 조정 (서명 이미지를 위해)
    worksheet.getRow(signatureRow).height = 60;
    worksheet.getRow(signatureRow + 1).height = 60;

    return true;
  } catch (error) {
    console.error('서명 추가 중 오류:', error);
    return false;
  }
};

/**
 * 승인자 정보만 추가하는 함수 (서명 없이)
 */
export const addApproverInfoToExcel = (
  worksheet: ExcelJS.Worksheet,
  approverName: string,
  approvalDate: string,
  startRow: number,
  startCol: number = 2
) => {
  // 승인자 정보 행
  worksheet.getCell(startRow, startCol).value = '승인자';
  worksheet.getCell(startRow, startCol + 1).value = approverName;
  worksheet.getCell(startRow, startCol + 2).value = '승인일시';
  worksheet.getCell(startRow, startCol + 3).value = approvalDate;

  // 승인자 정보 스타일
  for (let col = startCol; col <= startCol + 3; col++) {
    const cell = worksheet.getCell(startRow, col);
    if (col === startCol || col === startCol + 2) {
      cell.font = { name: '맑은 고딕', size: 10, bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    } else {
      cell.font = { name: '맑은 고딕', size: 10 };
    }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
    cell.alignment = { vertical: 'middle', horizontal: col === startCol || col === startCol + 2 ? 'center' : 'left' };
  }

  // 셀 병합
  worksheet.mergeCells(startRow, startCol + 1, startRow, startCol + 1);
  worksheet.mergeCells(startRow, startCol + 3, startRow, startCol + 3);
};

