// 지점 owner_id 업데이트 스크립트
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

// 점주 계정 정보
const storeOwners = [
  {
    email: 'gangnam@test.com',
    password: 'password123',
    name: '강남점',
    storeId: 'd18ff50c-135e-4249-838e-165f78be9965'
  },
  {
    email: 'hongdae@test.com',
    password: 'password123',
    name: '홍대점',
    storeId: '0f73f114-9fc7-4a46-8f94-67ff3dc06477'
  },
  {
    email: 'jamsil@test.com',
    password: 'password123',
    name: '잠실점',
    storeId: '3b51f8ea-d2bd-456f-8b24-256def94e3d6'
  }
];

async function updateStoreOwners() {
  console.log('🔧 지점 owner_id 업데이트 시작...');
  console.log('📡 Supabase URL:', supabaseUrl);

  try {
    for (const owner of storeOwners) {
      console.log(`\n📋 ${owner.email} 처리 중...`);
      
      // 1. 로그인하여 UUID 확인
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: owner.email,
        password: owner.password
      });

      if (authError) {
        console.error(`❌ ${owner.email} 로그인 실패:`, authError);
        continue;
      }

      if (authData?.user) {
        console.log(`✅ ${owner.email} 로그인 성공, UUID: ${authData.user.id}`);
        
        // 2. 지점 owner_id 업데이트
        const { error: storeError } = await supabase
          .from('stores')
          .update({ owner_id: authData.user.id })
          .eq('id', owner.storeId);

        if (storeError) {
          console.error(`❌ 지점 업데이트 실패:`, storeError);
        } else {
          console.log(`✅ 지점 할당 완료: ${owner.name} -> ${authData.user.id}`);
        }

        // 로그아웃
        await supabase.auth.signOut();
      }
    }

    // 3. 업데이트된 지점 정보 확인
    console.log('\n🏪 업데이트된 지점 정보 확인...');
    const { data: stores, error: storeCheckError } = await supabase
      .from('stores')
      .select('*');

    if (storeCheckError) {
      console.error('❌ 지점 확인 실패:', storeCheckError);
    } else {
      console.log('✅ 업데이트된 지점 데이터:');
      stores?.forEach(store => {
        console.log(`  - ${store.name}: ${store.owner_id}`);
      });
    }

    console.log('\n🎉 지점 owner_id 업데이트 완료!');

  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류:', error);
  }
}

// 스크립트 실행
updateStoreOwners().catch(console.error); 