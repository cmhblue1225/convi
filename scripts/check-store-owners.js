// 점주 계정 상태 확인 스크립트
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env 파일 읽기
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    return envVars;
  }
  return {};
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStoreOwners() {
  console.log('🔍 점주 계정 상태 확인 중...');
  console.log('📡 Supabase URL:', supabaseUrl);

  try {
    // 1. 프로필 테이블 확인
    console.log('\n📋 프로필 테이블 확인...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .or('email.eq.shopowner@test.com,email.eq.shopowner2@test.com,email.eq.shopowner3@test.com');

    if (profileError) {
      console.error('❌ 프로필 조회 실패:', profileError);
    } else {
      console.log('✅ 프로필 데이터:', profiles);
    }

    // 2. 지점 테이블 확인
    console.log('\n🏪 지점 테이블 확인...');
    const { data: stores, error: storeError } = await supabase
      .from('stores')
      .select('*');

    if (storeError) {
      console.error('❌ 지점 조회 실패:', storeError);
    } else {
      console.log('✅ 지점 데이터:', stores);
    }

    // 3. 모든 프로필 확인
    console.log('\n👥 모든 프로필 확인...');
    const { data: allProfiles, error: allProfileError } = await supabase
      .from('profiles')
      .select('*');

    if (allProfileError) {
      console.error('❌ 전체 프로필 조회 실패:', allProfileError);
    } else {
      console.log('✅ 전체 프로필 수:', allProfiles?.length);
      allProfiles?.forEach(profile => {
        console.log(`  - ID: ${profile.id}, Role: ${profile.role}, Name: ${profile.full_name}`);
      });
    }

  } catch (error) {
    console.error('❌ 확인 중 오류:', error);
  }
}

// 스크립트 실행
checkStoreOwners().catch(console.error); 