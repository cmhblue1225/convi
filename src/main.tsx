// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 개발 환경에서 테스트 헬퍼 로드
if (import.meta.env.DEV) {
  import('./utils/testHelpers').then(() => {
    console.log('🧪 테스트 헬퍼 로드 완료');
    console.log('사용법: getTestInstructions() 실행');
  });
}

createRoot(document.getElementById('root')!).render(
  // StrictMode 임시 비활성화 (개발 중)
  // <StrictMode>
    <App />
  // </StrictMode>,
)
