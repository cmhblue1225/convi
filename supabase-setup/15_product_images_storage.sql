-- =====================================================
-- 15_product_images_storage.sql
-- 상품 이미지 스토리지 설정 및 RLS 정책
-- =====================================================

-- 1. Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,  -- 공개 읽기 허용
  5242880,  -- 5MB 제한
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 2. RLS 정책 설정
-- 2.1 모든 사용자가 이미지를 볼 수 있음
CREATE POLICY "Anyone can view product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- 2.2 본사 관리자만 이미지 업로드 가능
CREATE POLICY "Only HQ admins can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('headquarters', 'hq_admin')
  )
);

-- 2.3 본사 관리자만 이미지 업데이트 가능
CREATE POLICY "Only HQ admins can update product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('headquarters', 'hq_admin')
  )
);

-- 2.4 본사 관리자만 이미지 삭제 가능
CREATE POLICY "Only HQ admins can delete product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('headquarters', 'hq_admin')
  )
);

-- 3. 이미지 메타데이터를 위한 테이블 생성 (선택사항)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(product_id, display_order)
);

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(product_id, display_order);

-- 5. RLS 정책 (product_images 테이블)
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 이미지 메타데이터 조회 가능
CREATE POLICY "Anyone can view product image metadata" ON product_images
FOR SELECT USING (true);

-- 본사 관리자만 이미지 메타데이터 관리 가능
CREATE POLICY "Only HQ admins can manage product image metadata" ON product_images
FOR ALL USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('headquarters', 'hq_admin')
  )
);

-- 6. 이미지 URL 생성 함수
CREATE OR REPLACE FUNCTION get_product_image_urls(product_uuid UUID)
RETURNS TEXT[] AS $$
DECLARE
  image_urls TEXT[];
BEGIN
  SELECT ARRAY(
    SELECT 
      CASE 
        WHEN storage_path IS NOT NULL THEN 
          'https://your-project.supabase.co/storage/v1/object/public/product-images/' || storage_path
        ELSE NULL
      END
    FROM product_images
    WHERE product_id = product_uuid
    ORDER BY display_order ASC, created_at ASC
  ) INTO image_urls;
  
  RETURN COALESCE(image_urls, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 기본 이미지 설정 함수
CREATE OR REPLACE FUNCTION set_primary_product_image(product_uuid UUID, image_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- 기존 primary 이미지 해제
  UPDATE product_images 
  SET is_primary = false 
  WHERE product_id = product_uuid AND is_primary = true;
  
  -- 새로운 primary 이미지 설정
  UPDATE product_images 
  SET is_primary = true, display_order = 0
  WHERE id = image_uuid AND product_id = product_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 이미지 순서 재정렬 함수
CREATE OR REPLACE FUNCTION reorder_product_images(product_uuid UUID, image_orders JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  item JSONB;
BEGIN
  -- image_orders: [{"id": "uuid", "order": 0}, {"id": "uuid", "order": 1}, ...]
  FOR item IN SELECT * FROM jsonb_array_elements(image_orders)
  LOOP
    UPDATE product_images 
    SET display_order = (item->>'order')::INTEGER
    WHERE id = (item->>'id')::UUID AND product_id = product_uuid;
  END LOOP;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 사용하지 않는 이미지 정리 함수
CREATE OR REPLACE FUNCTION cleanup_orphaned_product_images()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- 상품이 삭제된 이미지 정리
  DELETE FROM product_images 
  WHERE product_id NOT IN (SELECT id FROM products);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 트리거: products 테이블의 image_urls 자동 업데이트
CREATE OR REPLACE FUNCTION sync_product_image_urls()
RETURNS TRIGGER AS $$
BEGIN
  -- product_images 테이블 변경 시 products.image_urls 자동 업데이트
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE products 
    SET image_urls = get_product_image_urls(NEW.product_id)
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products 
    SET image_urls = get_product_image_urls(OLD.product_id)
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_product_image_urls_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_images
  FOR EACH ROW EXECUTE FUNCTION sync_product_image_urls();

-- 11. 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 상품 이미지 스토리지 설정이 완료되었습니다!';
  RAISE NOTICE '📁 버킷: product-images (공개 읽기)';
  RAISE NOTICE '🔐 업로드 권한: 본사 관리자만';
  RAISE NOTICE '📊 메타데이터 테이블: product_images';
  RAISE NOTICE '🔧 유틸리티 함수: 6개 함수 생성됨';
END $$;
