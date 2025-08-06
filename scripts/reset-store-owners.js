// 점주 계정 비밀번호 재설정 및 지점 할당 스크립트
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

async function resetStoreOwners() {
  console.log('🔧 점주 계정 비밀번호 재설정 및 지점 할당 시작...');
  console.log('📡 Supabase URL:', supabaseUrl);

  try {
    // 1. 먼저 각 점주 계정으로 로그인 시도 (비밀번호 재설정을 위해)
    console.log('\n🔍 점주 계정 로그인 시도...');
    
    for (const owner of storeOwners) {
      console.log(`\n📋 ${owner.email} 처리 중...`);
      
      // 먼저 로그인 시도
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: owner.email,
        password: owner.password
      });

      if (authError) {
        console.log(`⚠️  ${owner.email} 로그인 실패: ${authError.message}`);
        
        // 비밀번호 재설정 시도
        console.log(`🔄 ${owner.email} 비밀번호 재설정 시도...`);
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(owner.email, {
          redirectTo: `${supabaseUrl}/auth/reset-password`
        });

        if (resetError) {
          console.error(`❌ 비밀번호 재설정 실패:`, resetError);
        } else {
          console.log(`✅ 비밀번호 재설정 이메일 발송됨: ${owner.email}`);
        }
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

        // 3. 프로필 생성 시도
        const profileData = {
          id: authData.user.id,
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

        // 로그아웃
        await supabase.auth.signOut();
      }
    }

    console.log('\n🎉 점주 계정 설정 완료!');
    console.log('\n📝 다음 단계:');
    console.log('1. 각 점주 계정으로 로그인하여 프로필이 제대로 설정되었는지 확인');
    console.log('2. 지점 관리 기능이 정상적으로 작동하는지 테스트');
    console.log('3. RLS 정책이 제대로 적용되어 다른 지점 데이터에 접근할 수 없는지 확인');
    console.log('\n⚠️  비밀번호 재설정이 필요한 계정들은 이메일을 확인하여 비밀번호를 재설정해주세요.');

  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류:', error);
  }
}

// 스크립트 실행
resetStoreOwners().catch(console.error); 