import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// __dirname 설정 (ESM 환경에서 필요)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS 설정
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://your-app.onrender.com'],
  credentials: true
}));

app.use(express.json());

// 네이버 Geocoding API 프록시 엔드포인트
app.get('/api/geocode', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: '주소 쿼리가 필요합니다.'
      });
    }

    const clientId = process.env.VITE_NAVER_CLIENT_ID || process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.VITE_NAVER_CLIENT_SECRET || process.env.NAVER_CLIENT_SECRET;

    console.log('🔑 API 키 확인:', { 
      clientId: clientId ? `${clientId.substring(0, 3)}***` : 'NOT_SET',
      clientSecret: clientSecret ? `${clientSecret.substring(0, 3)}***` : 'NOT_SET'
    });

    if (!clientId || !clientSecret) {
      console.error('❌ 네이버 API 키가 설정되지 않았습니다.');
      return res.status(401).json({
        success: false,
        error: '서버 설정 오류: API 키가 없습니다.'
      });
    }

    console.log('📍 네이버 Geocoding API 호출:', query);

    const response = await fetch(
      `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'x-ncp-apigw-api-key-id': clientId,
          'x-ncp-apigw-api-key': clientSecret
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('네이버 API 요청 실패:', response.status, response.statusText, errorText);
      
      return res.status(response.status).json({
        success: false,
        error: `Geocoding API 요청 실패: ${response.status} ${response.statusText}`
      });
    }

    const data = await response.json();
    console.log('✅ 네이버 API 응답 성공:', data.addresses?.length || 0, '개 결과');

    if (!data.addresses || data.addresses.length === 0) {
      return res.json({
        success: false,
        error: '주소를 찾을 수 없습니다.'
      });
    }

    const addressInfo = data.addresses[0];
    const coordinates = {
      lat: parseFloat(addressInfo.y),
      lng: parseFloat(addressInfo.x)
    };

    console.log('📍 좌표 변환 성공:', query, '->', coordinates);

    res.json({
      success: true,
      coordinates,
      originalResponse: data
    });

  } catch (error) {
    console.error('❌ Geocoding 프록시 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류'
    });
  }
});

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Geocoding Proxy Server'
  });
});

// --- 정적 파일 서빙 (Vite build 결과) ---
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Geocoding 프록시 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📍 Geocoding 엔드포인트: http://localhost:${PORT}/api/geocode`);
  console.log(`❤️  헬스체크: http://localhost:${PORT}/health`);
});