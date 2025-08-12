import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
  className?: string;
  maxWidth?: number;  // 최대 너비 제한
  maxHeight?: number; // 최대 높이 제한
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onClear,
  width = 200,  // Excel F열 너비보다 작게 설정 (여유 공간 확보)
  height = 60,  // Excel 행 높이보다 작게 설정 (여유 공간 확보)
  penColor = '#000000',
  backgroundColor = '#ffffff',
  className = '',
  maxWidth = 250,
  maxHeight = 80
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 초기화
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [width, height, backgroundColor, penColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    setHasSignature(false);
    
    if (onClear) {
      onClear();
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    // 서명 이미지만 추출하여 배경 제거
    const signatureCanvas = document.createElement('canvas');
    const signatureCtx = signatureCanvas.getContext('2d');
    
    if (!signatureCtx) return;

    // 원본 Canvas에서 서명 영역만 추출
    const imageData = canvas.getContext('2d')?.getImageData(0, 0, width, height);
    if (!imageData) return;

    // 서명이 있는 영역만 찾기 (투명 배경)
    const { data, width: imgWidth, height: imgHeight } = imageData;
    let minX = imgWidth, minY = imgHeight, maxX = 0, maxY = 0;
    
    for (let y = 0; y < imgHeight; y++) {
      for (let x = 0; x < imgWidth; x++) {
        const index = (y * imgWidth + x) * 4;
        const alpha = data[index + 3]; // 알파값
        
        if (alpha > 0) { // 서명이 있는 픽셀
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    // 서명 영역 크기 계산
    const signatureWidth = maxX - minX + 1;
    const signatureHeight = maxY - minY + 1;
    
    // 서명만 추출한 Canvas 생성
    signatureCanvas.width = signatureWidth;
    signatureCanvas.height = signatureHeight;
    
    // 투명 배경으로 설정
    signatureCtx.clearRect(0, 0, signatureWidth, signatureHeight);
    
    // 서명 영역만 복사
    signatureCtx.drawImage(
      canvas, 
      minX, minY, signatureWidth, signatureHeight, 
      0, 0, signatureWidth, signatureHeight
    );
    
    // Excel 셀 크기에 맞게 최적화
    const cellWidth = Math.min(width, maxWidth);
    const cellHeight = Math.min(height, maxHeight);
    
    const optimizedCanvas = document.createElement('canvas');
    const optimizedCtx = optimizedCanvas.getContext('2d');
    
    if (!optimizedCtx) return;
    
    optimizedCanvas.width = cellWidth;
    optimizedCanvas.height = cellHeight;
    
    // 투명 배경으로 설정
    optimizedCtx.clearRect(0, 0, cellWidth, cellHeight);
    
    // 서명을 셀 중앙에 배치
    const scale = Math.min(cellWidth / signatureWidth, cellHeight / signatureHeight) * 0.8; // 80% 크기로 여백 확보
    const scaledWidth = signatureWidth * scale;
    const scaledHeight = signatureHeight * scale;
    const x = (cellWidth - scaledWidth) / 2;
    const y = (cellHeight - scaledHeight) / 2;
    
    optimizedCtx.drawImage(signatureCanvas, x, y, scaledWidth, scaledHeight);
    
    // 최적화된 서명을 base64 이미지로 변환 (투명 배경 유지)
    const signatureData = optimizedCanvas.toDataURL('image/png', 0.9);
    onSave(signatureData);
  };

  return (
    <div className={`signature-pad ${className}`}>
      <div className="mb-2 text-sm text-gray-600">
        아래 영역에 마우스로 서명해주세요
      </div>
      
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ touchAction: 'none' }}
        />
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={clearSignature}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          지우기
        </button>
        <button
          onClick={saveSignature}
          disabled={!hasSignature}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            hasSignature
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          서명 저장
        </button>
      </div>
      
      {hasSignature && (
        <div className="mt-2 text-xs text-green-600">
          ✓ 서명이 완료되었습니다
        </div>
      )}
    </div>
  );
};

export default SignaturePad;

