// 기존 점주 계정들에 대한 프로필과 지점 생성 스크립트
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
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseServiceKey ? '설정됨' : '설정되지 않음');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 점주 계정 정보 (이메일과 UUID 매핑)
const storeOwners = [
  {
    email: 'shopowner@test.com',
    name: '강남점',
    address: '서울특별시 강남구 강남대로 123',
    phone: '02-1234-5678',
    location: 'POINT(127.0276 37.4979)', // 강남역 근처
    // 실제 UUID는 Supabase에서 확인 후 설정
    userId: null
  },
  {
    email: 'shopowner2@test.com',
    name: '홍대점',
    address: '서울특별시 마포구 홍대로 456',
    phone: '02-2345-6789',
    location: 'POINT(126.9236 37.5563)', // 홍대입구역 근처
    userId: null
  },
  {
    email: 'shopowner3@test.com',
    name: '잠실점',
    address: '서울특별시 송파구 올림픽로 789',
    phone: '02-3456-7890',
    location: 'POINT(127.1002 37.5139)', // 잠실역 근처
    userId: null
  }
];

async function setupStoreOwners() {
  console.log('🏪 점주 계정 설정 시작...');
  console.log('📡 Supabase URL:', supabaseUrl);

  try {
    // 1. 먼저 기존 사용자들의 UUID를 조회
    console.log('\n🔍 기존 사용자 UUID 조회 중...');
    
    for (const owner of storeOwners) {
      // auth.users 테이블에서 직접 조회
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id, email')
        .eq('email', owner.email)
        .single();

      if (userError) {
        console.log(`⚠️  ${owner.email} 사용자를 찾을 수 없습니다. 새로 생성해야 합니다.`);
        continue;
      }

      if (userData) {
        owner.userId = userData.id;
        console.log(`✅ ${owner.email} 사용자 찾음: ${userData.id}`);
      }
    }

    // 2. 각 점주에 대해 프로필과 지점 설정
    for (const owner of storeOwners) {
      if (!owner.userId) {
        console.log(`\n⚠️  ${owner.email}는 아직 생성되지 않았습니다. 수동으로 로그인 후 다시 실행해주세요.`);
        continue;
      }

      console.log(`\n📋 ${owner.email} (${owner.userId}) 처리 중...`);

      // 2-1. 프로필 생성 또는 업데이트
      const profileData = {
        id: owner.userId,
        role: 'store_owner',
        full_name: `${owner.name} 점주`,
        phone: owner.phone,
        avatar_url: null,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: 'id' });

      if (profileError) {
        console.error(`❌ 프로필 생성 실패:`, profileError);
      } else {
        console.log(`✅ 프로필 생성/업데이트 완료`);
      }

      // 2-2. 지점 생성
      const storeData = {
        name: owner.name,
        owner_id: owner.userId,
        address: owner.address,
        phone: owner.phone,
        business_hours: {
          mon: { open: "07:00", close: "23:00" },
          tue: { open: "07:00", close: "23:00" },
          wed: { open: "07:00", close: "23:00" },
          thu: { open: "07:00", close: "23:00" },
          fri: { open: "07:00", close: "23:00" },
          sat: { open: "07:00", close: "23:00" },
          sun: { open: "07:00", close: "23:00" }
        },
        location: owner.location,
        delivery_available: true,
        pickup_available: true,
        is_active: true,
      };

      // 기존 지점이 있는지 확인
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', owner.userId)
        .single();

      if (existingStore) {
        console.log(`✅ 기존 지점이 있습니다: ${existingStore.id}`);
      } else {
        const { error: storeError } = await supabase
          .from('stores')
          .insert([storeData]);

        if (storeError) {
          console.error(`❌ 지점 생성 실패:`, storeError);
        } else {
          console.log(`✅ 지점 생성 완료: ${owner.name}`);
        }
      }
    }

    console.log('\n🎉 점주 계정 설정 완료!');
    console.log('\n📝 다음 단계:');
    console.log('1. 각 점주 계정으로 로그인하여 프로필이 제대로 설정되었는지 확인');
    console.log('2. 지점 관리 기능이 정상적으로 작동하는지 테스트');
    console.log('3. RLS 정책이 제대로 적용되어 다른 지점 데이터에 접근할 수 없는지 확인');

  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류:', error);
  }
}

// 스크립트 실행
setupStoreOwners().catch(console.error); 