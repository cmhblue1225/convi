// 점주 계정 수정 및 프로필 생성 스크립트
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

// 점주 계정 정보 (UUID는 실제 로그인 후 확인 필요)
const storeOwners = [
  {
    email: 'shopowner@test.com',
    password: 'password123',
    name: '강남점',
    storeId: 'd18ff50c-135e-4249-838e-165f78be9965'
  },
  {
    email: 'shopowner2@test.com',
    password: 'password123',
    name: '홍대점',
    storeId: '0f73f114-9fc7-4a46-8f94-67ff3dc06477'
  },
  {
    email: 'shopowner3@test.com',
    password: 'password123',
    name: '잠실점',
    storeId: '3b51f8ea-d2bd-456f-8b24-256def94e3d6'
  }
];

async function fixStoreOwners() {
  console.log('🔧 점주 계정 수정 및 프로필 생성 시작...');
  console.log('📡 Supabase URL:', supabaseUrl);

  try {
    // 1. 먼저 각 점주 계정으로 로그인하여 UUID 확인
    console.log('\n🔍 점주 계정 UUID 확인 중...');
    
    for (const owner of storeOwners) {
      console.log(`\n📋 ${owner.email} 로그인 시도...`);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: owner.email,
        password: owner.password
      });

      if (authError) {
        console.error(`❌ ${owner.email} 로그인 실패:`, authError);
        continue;
      }

      if (authData?.user) {
        owner.userId = authData.user.id;
        console.log(`✅ ${owner.email} 로그인 성공, UUID: ${authData.user.id}`);
        
        // 2. 프로필 생성
        const profileData = {
          id: authData.user.id,
          role: 'store_owner',
          full_name: `${owner.name} 점주`,
          phone: '02-1234-5678', // 기본값
          avatar_url: null,
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([profileData], { onConflict: 'id' });

        if (profileError) {
          console.error(`❌ 프로필 생성 실패:`, profileError);
        } else {
          console.log(`✅ 프로필 생성 완료`);
        }

        // 3. 지점 owner_id 업데이트
        const { error: storeError } = await supabase
          .from('stores')
          .update({ owner_id: authData.user.id })
          .eq('id', owner.storeId);

        if (storeError) {
          console.error(`❌ 지점 업데이트 실패:`, storeError);
        } else {
          console.log(`✅ 지점 할당 완료: ${owner.name}`);
        }

        // 로그아웃
        await supabase.auth.signOut();
      }
    }

    console.log('\n🎉 점주 계정 수정 완료!');
    console.log('\n📝 설정된 점주 정보:');
    storeOwners.forEach(owner => {
      if (owner.userId) {
        console.log(`- ${owner.name}: ${owner.email} (${owner.userId})`);
      }
    });

  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류:', error);
  }
}

// 스크립트 실행
fixStoreOwners().catch(console.error); 