// 새로운 점주 계정 생성 및 지점 할당 스크립트
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

// 새로운 점주 계정 정보
const newStoreOwners = [
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

async function createNewStoreOwners() {
  console.log('🏪 새로운 점주 계정 생성 및 지점 할당 시작...');
  console.log('📡 Supabase URL:', supabaseUrl);

  try {
    for (const owner of newStoreOwners) {
      console.log(`\n📋 ${owner.email} 계정 생성 중...`);

      // 1. 계정 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: owner.email,
        password: owner.password,
        options: {
          data: {
            role: 'store_owner',
            full_name: `${owner.name} 점주`,
            phone: '02-1234-5678'
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`✅ ${owner.email}는 이미 등록되어 있습니다.`);
          
          // 기존 계정으로 로그인
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: owner.email,
            password: owner.password
          });

          if (loginError) {
            console.error(`❌ ${owner.email} 로그인 실패:`, loginError);
            continue;
          }

          if (loginData?.user) {
            owner.userId = loginData.user.id;
            console.log(`✅ ${owner.email} 로그인 성공, UUID: ${loginData.user.id}`);
          }
        } else {
          console.error(`❌ 계정 생성 실패:`, authError);
          continue;
        }
      } else {
        console.log(`✅ ${owner.email} 계정 생성 완료`);
        if (authData?.user) {
          owner.userId = authData.user.id;
        }
      }

      // 2. 프로필 생성
      if (owner.userId) {
        const profileData = {
          id: owner.userId,
          role: 'store_owner',
          full_name: `${owner.name} 점주`,
          phone: '02-1234-5678',
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
          .update({ owner_id: owner.userId })
          .eq('id', owner.storeId);

        if (storeError) {
          console.error(`❌ 지점 업데이트 실패:`, storeError);
        } else {
          console.log(`✅ 지점 할당 완료: ${owner.name} -> ${owner.userId}`);
        }

        // 로그아웃
        await supabase.auth.signOut();
      }
    }

    console.log('\n🎉 새로운 점주 계정 생성 완료!');
    console.log('\n📝 로그인 정보:');
    newStoreOwners.forEach(owner => {
      console.log(`이메일: ${owner.email}, 비밀번호: ${owner.password}`);
    });

    console.log('\n📝 다음 단계:');
    console.log('1. 각 점주 계정으로 로그인하여 프로필이 제대로 설정되었는지 확인');
    console.log('2. 지점 관리 기능이 정상적으로 작동하는지 테스트');
    console.log('3. RLS 정책이 제대로 적용되어 다른 지점 데이터에 접근할 수 없는지 확인');

  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류:', error);
  }
}

// 스크립트 실행
createNewStoreOwners().catch(console.error); 