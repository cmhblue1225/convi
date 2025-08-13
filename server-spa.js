import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'dist')));

// CORS 헤더 추가
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // SPA를 위한 캐시 방지 헤더
  if (req.path === '/' || req.path.endsWith('.html')) {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
  }
  
  next();
});

// SPA 라우팅: 모든 경로를 index.html로 리다이렉트
app.get('*', (req, res) => {
  console.log(`🔍 SPA Route: ${req.method} ${req.url}`);
  
  // 정적 파일 요청은 그대로 처리
  if (req.url.startsWith('/assets/') || 
      req.url.startsWith('/vite.svg') || 
      req.url.endsWith('.js') || 
      req.url.endsWith('.css') || 
      req.url.endsWith('.ico') || 
      req.url.endsWith('.png') || 
      req.url.endsWith('.jpg') || 
      req.url.endsWith('.jpeg') || 
      req.url.endsWith('.gif') || 
      req.url.endsWith('.svg')) {
    return res.status(404).send('File not found');
  }
  
  // 모든 SPA 라우트를 index.html로 서빙
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      console.error('❌ Error serving index.html:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log(`✅ Served index.html for route: ${req.url}`);
    }
  });
});

// 포트 설정
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SPA Server running on port ${PORT}`);
  console.log(`📱 Access at: http://localhost:${PORT}`);
  console.log(`🌐 All routes will be served via React Router`);
});

// 에러 핸들링
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});