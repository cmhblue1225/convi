import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'dist')));

// SPA 라우팅을 위한 미들웨어
app.use((req, res, next) => {
  // API 요청이나 정적 파일 요청은 그대로 통과
  if (req.path.startsWith('/api/') || 
      req.path.includes('.') || 
      req.path.startsWith('/assets/')) {
    return next();
  }
  
  // SPA 라우트는 index.html로 리다이렉트
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 SPA 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`📱 애플리케이션: http://localhost:${PORT}`);
  console.log(`🔍 헬스체크: http://localhost:${PORT}/health`);
  console.log(`✅ SPA 라우팅이 활성화되었습니다`);
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error('❌ 서버 오류:', err);
  res.status(500).json({ error: '서버 내부 오류가 발생했습니다' });
});

// 404 처리
app.use('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'dist', 'index.html'));
});