# 지도 API 마이그레이션 가이드

## 📍 개요
네이버 지도 API에서 Google Maps API로 마이그레이션하여 CORS 문제를 해결하고 Render 배포에 최적화

## 🔄 변경 사항

### 이전 (네이버 지도)
- **API**: 네이버 지도 API
- **문제점**:
  - CORS 정책으로 직접 호출 불가
  - localhost:3001 프록시 서버 필수
  - API 키 하드코딩 보안 문제
  - Render 배포 시 별도 프록시 서버 운영 필요

### 이후 (Google Maps)
- **API**: Google Maps JavaScript API + Geocoding API
- **장점**:
  - CORS 문제 없음, 직접 클라이언트 호출 가능
  - 프록시 서버 불필요
  - 환경변수로 API 키 보안 관리
  - 전 세계 정확한 지오코딩
  - Render 배포에 최적화

## 🛠️ 설치 및 설정

### 1. 패키지 설치
```bash
npm install @googlemaps/react-wrapper @googlemaps/js-api-loader
```

### 2. Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 다음 API 활성화:
   - Maps JavaScript API
   - Geocoding API
   - Places API (선택사항)
4. API 키 생성:
   - 사용자 인증 정보 → API 키 생성
   - API 키 제한 설정 (HTTP 리퍼러, IP 주소 등)

### 3. 환경변수 설정
```env
# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
VITE_GOOGLE_GEOCODING_API_KEY=your_actual_api_key_here
```

## 📂 파일 구조

### 새로 추가된 파일
```
src/
├── components/map/
│   └── GoogleMap.tsx                 # Google Maps React 컴포넌트
├── lib/geocoding/
│   └── google-geocoding.ts          # Google Geocoding API 서비스
└── backup/legacy-naver-map/         # 기존 네이버 지도 백업
    ├── MapLocation.tsx
    └── geocoding.ts
```

### 수정된 파일
```
src/pages/customer/StoreSelection.tsx  # Google Maps 통합
.env                                   # API 키 설정 업데이트
package.json                          # 새 패키지 추가
```

## 🎯 주요 기능

### GoogleMap 컴포넌트
- **위치**: `src/components/map/GoogleMap.tsx`
- **기능**:
  - 반응형 Google Maps 렌더링
  - 사용자 위치 및 지점 마커 표시
  - 지점 클릭 시 정보 창 표시
  - 지점 선택 콜백 지원
  - API 키 유효성 검사
  - 로딩 및 에러 상태 처리

### Google Geocoding 서비스
- **위치**: `src/lib/geocoding/google-geocoding.ts`
- **기능**:
  - 주소 → 좌표 변환 (geocodeAddress)
  - 좌표 → 주소 변환 (reverseGeocode)
  - 일괄 주소 변환 (geocodeAddresses)
  - 메모리 캐싱 (30분 유효)
  - 백업 좌표 시스템
  - 거리 계산 유틸리티

## 📊 성능 최적화

### 캐싱 시스템
```typescript
// 메모리 캐시로 API 호출 최소화
const geocodingCache = new Map<string, GeocodingResult>();
const CACHE_DURATION = 30 * 60 * 1000; // 30분
```

### 배치 처리
```typescript
// 여러 주소를 병렬로 처리하되 API 제한 고려
const batchSize = 5;
const batches = addresses.slice(0, batchSize);
```

### 백업 시스템
```typescript
// API 실패 시 한국 주요 지역 좌표 제공
const fallbackMap: Record<string, Coordinates> = {
  '서울': { lat: 37.5665, lng: 126.9780 },
  '포천': { lat: 37.8947, lng: 127.2003 },
  // ... 더 많은 지역
};
```

## 🌐 배포 설정

### Render 환경변수
```
VITE_GOOGLE_MAPS_API_KEY=your_production_api_key
VITE_GOOGLE_GEOCODING_API_KEY=your_production_geocoding_key
```

### API 키 보안
1. **제한 설정**: HTTP 리퍼러 제한으로 도메인 보안
2. **환경별 키**: 개발/스테이징/프로덕션 별도 키 사용
3. **모니터링**: Google Cloud Console에서 사용량 모니터링

## 🧪 테스트 방법

### 1. 로컬 테스트
```bash
# 환경변수 설정 후
npm run dev
```

### 2. 기능 테스트 체크리스트
- [ ] 지도가 정상적으로 로드되는지
- [ ] 사용자 위치가 표시되는지
- [ ] 지점 마커들이 표시되는지
- [ ] 마커 클릭 시 정보창이 나타나는지
- [ ] 지점 선택이 정상 작동하는지
- [ ] 거리 계산이 정확한지
- [ ] API 키 없을 때 경고 메시지가 나타나는지

### 3. 성능 테스트
- [ ] 페이지 로딩 시간 확인
- [ ] 지오코딩 캐시 동작 확인
- [ ] 메모리 사용량 모니터링

## 🚨 트러블슈팅

### API 키 관련 문제
```typescript
// .env 파일에서 키 확인
VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_KEY_HERE

// 브라우저 콘솔에서 확인
console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
```

### CORS 문제 (해결됨)
- Google Maps API는 CORS 문제가 없음
- 프록시 서버 불필요

### 지오코딩 실패
- 백업 좌표 시스템이 자동으로 작동
- 콘솔에서 오류 로그 확인

### 성능 문제
- 캐싱 시스템으로 API 호출 최소화
- 배치 처리로 동시 요청 제한

## 📈 모니터링

### Google Cloud Console
1. **사용량 모니터링**: API 호출 수, 할당량 확인
2. **오류 분석**: 실패한 요청 분석
3. **비용 관리**: API 사용 비용 추적

### 애플리케이션 로그
```typescript
// 콘솔에서 확인할 수 있는 로그
console.log('✅ Google Geocoding API 성공');
console.warn('⚠️ 백업 좌표 시스템 사용');
console.error('❌ Google Maps 로딩 실패');
```

## 🔮 향후 개선 사항

### 1. 고급 기능
- Places API 연동으로 POI 검색
- 실시간 교통 정보 표시
- 경로 안내 기능

### 2. 성능 개선
- Service Worker로 오프라인 지도 캐싱
- 지점 클러스터링으로 대량 마커 최적화
- 지도 타일 사전 로딩

### 3. 사용자 경험
- 지점 검색 및 필터링
- 즐겨찾기 지점 기능
- 지도 스타일 커스터마이징

---

**마이그레이션 완료일**: 2025-08-13  
**담당자**: Claude Code Assistant  
**다음 검토일**: 2025-09-13