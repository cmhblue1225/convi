-- 배송지 테이블 생성
CREATE TABLE "public"."delivery_addresses" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "name" text NOT NULL,
    "address" text NOT NULL,
    "detail_address" text,
    "postal_code" text,
    "is_default" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("user_id") REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Row Level Security (RLS) 정책 설정
ALTER TABLE "public"."delivery_addresses" ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 배송지만 조회/추가/수정/삭제 가능
CREATE POLICY "사용자는 자신의 배송지만 조회 가능" 
    ON "public"."delivery_addresses" 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 배송지만 추가 가능" 
    ON "public"."delivery_addresses" 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 배송지만 수정 가능" 
    ON "public"."delivery_addresses" 
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 배송지만 삭제 가능" 
    ON "public"."delivery_addresses" 
    FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);

-- 기본 배송지 설정을 위한 트리거 함수
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default THEN
        -- 다른 배송지의 기본 설정을 해제
        UPDATE delivery_addresses
        SET is_default = false
        WHERE user_id = NEW.user_id
        AND id != NEW.id
        AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER ensure_single_default_address_trigger
    BEFORE INSERT OR UPDATE ON delivery_addresses
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_address();

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
CREATE TRIGGER update_delivery_addresses_updated_at
    BEFORE UPDATE ON delivery_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
