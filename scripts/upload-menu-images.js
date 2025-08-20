import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase 설정
const supabaseUrl = 'https://esbjgvnlqzseomhbsimz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY 또는 VITE_SUPABASE_ANON_KEY 환경변수가 필요합니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 업로드할 이미지 목록
const images = [
  {
    localPath: '고객 메뉴구조도.png',
    storagePath: 'customer-menu.png',
    description: '고객 메뉴구조도'
  },
  {
    localPath: '점주 메뉴구조도.png', 
    storagePath: 'store-menu.png',
    description: '점주 메뉴구조도'
  },
  {
    localPath: '본사 메뉴구조도.png',
    storagePath: 'hq-menu.png', 
    description: '본사 메뉴구조도'
  },
  {
    localPath: '공통 메뉴구조도.png',
    storagePath: 'common-menu.png',
    description: '공통 메뉴구조도'
  }
];

async function uploadImage(image) {
  const { localPath, storagePath, description } = image;
  const fullLocalPath = path.join(__dirname, '..', 'menu_source', localPath);
  
  try {
    // 파일 존재 확인
    if (!fs.existsSync(fullLocalPath)) {
      console.error(`❌ 파일을 찾을 수 없습니다: ${fullLocalPath}`);
      return false;
    }

    // 파일 읽기
    const fileBuffer = fs.readFileSync(fullLocalPath);
    
    console.log(`📤 업로드 중: ${description} (${(fileBuffer.length / 1024).toFixed(2)} KB)`);

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('menu-structures')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true // 기존 파일이 있으면 덮어쓰기
      });

    if (error) {
      console.error(`❌ 업로드 실패 (${description}):`, error.message);
      return false;
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from('menu-structures')
      .getPublicUrl(storagePath);

    console.log(`✅ 업로드 성공: ${description}`);
    console.log(`🔗 공개 URL: ${urlData.publicUrl}`);
    console.log('---');
    
    return true;
  } catch (err) {
    console.error(`❌ 에러 발생 (${description}):`, err.message);
    return false;
  }
}

async function uploadAllImages() {
  console.log('🚀 메뉴구조도 이미지 업로드 시작...\n');
  
  let successCount = 0;
  let failCount = 0;

  for (const image of images) {
    const success = await uploadImage(image);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // 각 업로드 사이에 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 업로드 결과:');
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${failCount}개`);
  
  if (successCount === images.length) {
    console.log('\n🎉 모든 이미지 업로드 완료!');
    
    // 업로드된 이미지 URL 목록 출력
    console.log('\n📋 업로드된 이미지 URL 목록:');
    images.forEach(image => {
      const { data } = supabase.storage
        .from('menu-structures')
        .getPublicUrl(image.storagePath);
      console.log(`${image.description}: ${data.publicUrl}`);
    });
  } else {
    console.log('\n⚠️ 일부 이미지 업로드가 실패했습니다.');
  }
}

// Storage bucket 존재 확인
async function checkBucket() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('❌ Storage bucket 확인 실패:', error.message);
      return false;
    }
    
    const menuBucket = data.find(bucket => bucket.id === 'menu-structures');
    if (!menuBucket) {
      console.error('❌ menu-structures bucket이 존재하지 않습니다.');
      console.log('📋 다음 SQL을 Supabase에서 실행해주세요:');
      console.log(`INSERT INTO storage.buckets (id, name, public) VALUES ('menu-structures', 'menu-structures', true);`);
      return false;
    }
    
    console.log('✅ menu-structures bucket 확인 완료');
    return true;
  } catch (err) {
    console.error('❌ bucket 확인 중 에러:', err.message);
    return false;
  }
}

// 메인 실행
async function main() {
  console.log('🔍 Supabase Storage 설정 확인 중...');
  
  const bucketExists = await checkBucket();
  if (!bucketExists) {
    process.exit(1);
  }
  
  await uploadAllImages();
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ 스크립트 실행 중 에러:', error.message);
    process.exit(1);
  });
}