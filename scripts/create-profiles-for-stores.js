// 현재 지점들의 owner_id를 기반으로 프로필 생성 스크립트
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

async function createProfilesForStores() {
  console.log('👥 지점 소유자 프로필 생성 시작...');
  console.log('📡 Supabase URL:', supabaseUrl);

  try {
    // 1. 현재 지점 정보 조회
    console.log('\n🏪 현재 지점 정보 조회...');
    const { data: stores, error: storeError } = await supabase
      .from('stores')
      .select('*');

    if (storeError) {
      console.error('❌ 지점 조회 실패:', storeError);
      return;
    }

    console.log('✅ 지점 데이터:', stores);

    // 2. 각 지점에 대해 프로필 생성
    for (const store of stores) {
      console.log(`\n📋 ${store.name} 점주 프로필 생성 중...`);
      console.log(`   Owner ID: ${store.owner_id}`);

      // 프로필 데이터 생성
      const profileData = {
        id: store.owner_id,
        role: 'store_owner',
        full_name: `${store.name} 점주`,
        phone: store.phone || '02-1234-5678',
        avatar_url: null,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: 'id' });

      if (profileError) {
        console.error(`❌ 프로필 생성 실패:`, profileError);
      } else {
        console.log(`✅ 프로필 생성 완료: ${store.name} 점주`);
      }
    }

    // 3. 생성된 프로필 확인
    console.log('\n👥 생성된 프로필 확인...');
    const { data: profiles, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*');

    if (profileCheckError) {
      console.error('❌ 프로필 확인 실패:', profileCheckError);
    } else {
      console.log('✅ 생성된 프로필:');
      profiles?.forEach(profile => {
        console.log(`  - ID: ${profile.id}, Role: ${profile.role}, Name: ${profile.full_name}`);
      });
    }

    console.log('\n🎉 프로필 생성 완료!');
    console.log('\n📝 다음 단계:');
    console.log('1. 각 점주 계정으로 로그인하여 프로필이 제대로 설정되었는지 확인');
    console.log('2. 지점 관리 기능이 정상적으로 작동하는지 테스트');
    console.log('3. RLS 정책이 제대로 적용되어 다른 지점 데이터에 접근할 수 없는지 확인');

  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류:', error);
  }
}

// 스크립트 실행
createProfilesForStores().catch(console.error); 