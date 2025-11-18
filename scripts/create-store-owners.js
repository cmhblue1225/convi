// 점주 계정 생성 스크립트
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
    email: 'shopowner@example.com',
    password: 'password123',
    name: '강남점',
    address: '서울특별시 강남구 강남대로 123',
    phone: '02-1234-5678',
    location: 'POINT(127.0276 37.4979)'
  },
  {
    email: 'shopowner2@example.com',
    password: 'password123',
    name: '홍대점',
    address: '서울특별시 마포구 홍대로 456',
    phone: '02-2345-6789',
    location: 'POINT(126.9236 37.5563)'
  },
  {
    email: 'shopowner3@example.com',
    password: 'password123',
    name: '잠실점',
    address: '서울특별시 송파구 올림픽로 789',
    phone: '02-3456-7890',
    location: 'POINT(127.1002 37.5139)'
  }
];

async function createStoreOwners() {
  console.log('🏪 점주 계정 생성 시작...');
  console.log('📡 Supabase URL:', supabaseUrl);

  for (const owner of storeOwners) {
    try {
      console.log(`\n📋 ${owner.email} 계정 생성 중...`);

      // 1. 계정 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: owner.email,
        password: owner.password,
        options: {
          data: {
            role: 'store_owner',
            full_name: `${owner.name} 점주`,
            phone: owner.phone
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`✅ ${owner.email}는 이미 등록되어 있습니다.`);
        } else {
          console.error(`❌ 계정 생성 실패:`, authError);
          continue;
        }
      } else {
        console.log(`✅ ${owner.email} 계정 생성 완료`);
      }

      // 2. 프로필 생성
      if (authData?.user) {
        const profileData = {
          id: authData.user.id,
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
          console.log(`✅ 프로필 생성 완료`);
        }

        // 3. 지점 생성
        const storeData = {
          name: owner.name,
          owner_id: authData.user.id,
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

        const { error: storeError } = await supabase
          .from('stores')
          .upsert([storeData], { onConflict: 'owner_id' });

        if (storeError) {
          console.error(`❌ 지점 생성 실패:`, storeError);
        } else {
          console.log(`✅ 지점 생성 완료: ${owner.name}`);
        }
      }

    } catch (error) {
      console.error(`❌ ${owner.email} 처리 중 오류:`, error);
    }
  }

  console.log('\n🎉 점주 계정 생성 완료!');
  console.log('\n📝 로그인 정보:');
  storeOwners.forEach(owner => {
    console.log(`이메일: ${owner.email}, 비밀번호: ${owner.password}`);
  });
}

// 스크립트 실행
createStoreOwners().catch(console.error); 