# 찜(Wishlist) 기능 구현 문서

## 1. 데이터베이스 구조

### wishlists 테이블 생성
```sql
-- wishlists 테이블 생성
CREATE TABLE "public"."wishlists" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("user_id") REFERENCES auth.users(id) ON DELETE CASCADE,
    FOREIGN KEY ("product_id") REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE ("user_id", "product_id")
);

-- Row Level Security (RLS) 정책 설정
ALTER TABLE "public"."wishlists" ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 찜 목록만 조회/추가/삭제 가능
CREATE POLICY "사용자는 자신의 찜 목록만 조회 가능" 
    ON "public"."wishlists" 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 찜 목록에만 추가 가능" 
    ON "public"."wishlists" 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 찜 목록만 삭제 가능" 
    ON "public"."wishlists" 
    FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);
```

## 2. 프론트엔드 구현

### 2.1 WishlistButton 컴포넌트 (`src/components/common/WishlistButton.tsx`)
```typescript
interface WishlistButtonProps {
  productId: string;
  isWishlisted: boolean;
  onToggle: (newState: boolean) => void;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  isWishlisted,
  onToggle
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth/login');
      return;
    }

    try {
      setIsLoading(true);

      if (isWishlisted) {
        // 찜 취소
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('product_id', productId)
          .eq('user_id', user.id);

        if (error) throw error;
        onToggle(false);
      } else {
        // 찜하기
        const { error } = await supabase
          .from('wishlists')
          .insert({ product_id: productId, user_id: user.id });

        if (error) throw error;
        onToggle(true);
      }
    } catch (error) {
      console.error('찜하기 토글 중 오류:', error);
      alert('찜하기 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
};
```

### 2.2 찜 목록 조회 쿼리 (`src/pages/customer/CustomerProfile.tsx`)
```typescript
const { data: wishlistData, error: wishlistError } = await supabase
  .from('wishlists')
  .select(`
    id,
    product_id,
    created_at,
    products:product_id (
      id,
      name,
      image_urls,
      is_active,
      store_products!inner (
        price,
        discount_rate,
        is_available,
        stock_quantity
      )
    )
  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

### 2.3 찜 목록 데이터 구조 (`src/types/common.ts`)
```typescript
interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  price: number;
  original_price: number;
  discount_rate: number;
  is_available: boolean;
  stock_quantity: number;
  added_at: string;
}
```

## 3. 주요 변경사항 및 수정 내역

1. 데이터베이스 구조 설계
   - `wishlists` 테이블 생성
   - 사용자(`user_id`)와 상품(`product_id`) 간의 관계 설정
   - Row Level Security 정책 설정으로 보안 강화

2. 찜하기 버튼 구현
   - 하트 아이콘을 사용한 토글 버튼
   - 로그인 상태 확인 및 미로그인 시 로그인 페이지 리다이렉트
   - 찜하기/취소 기능 구현

3. 찜 목록 표시
   - 프로필 페이지에 찜 목록 섹션 추가
   - 상품 정보 표시 (이미지, 이름, 가격, 할인율, 재고 상태 등)
   - 찜 취소 및 장바구니 담기 기능 구현

4. 오류 수정 내역
   - `image_url` → `image_urls` 컬럼명 수정
   - `products` 테이블의 `price` 컬럼 제거 및 `store_products`의 가격 정보 사용
   - `store_products` 조인을 `!inner`로 변경하여 유효한 상품만 표시

## 4. 사용된 기술
- Supabase: 데이터베이스 및 인증
- React: 프론트엔드 UI 구현
- TypeScript: 타입 안정성 확보
- Tailwind CSS: UI 스타일링
- Heroicons: 아이콘 컴포넌트
