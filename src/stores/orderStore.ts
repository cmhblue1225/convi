import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase/client';
import type { Product, StoreProduct } from '../types/common';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discountRate: number;
  subtotal: number;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  address: string;
  detailAddress: string;
  memo?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  orderType: 'pickup' | 'delivery';
  items: OrderItem[];
  deliveryAddress?: DeliveryAddress;
  paymentMethod: 'card' | 'cash' | 'mobile' | 'toss' | 'naver' | 'payco';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  // 포인트 정보 추가
  pointsUsed?: number;
  pointsDiscountAmount?: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  addOrder: (order: Omit<Order, 'id' | 'updatedAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  fetchOrders: () => Promise<void>;
  subscribeToOrders: () => void;
  unsubscribeFromOrders: () => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: Order['status']) => Order[];
  clearOrders: () => void;
}

let orderSubscription: any = null;

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      error: null,

      addOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('📝 Supabase에 주문 저장 중...', orderData);
          console.log('🔍 paymentMethod 값:', orderData.paymentMethod);
          console.log('🔍 paymentMethod 타입:', typeof orderData.paymentMethod);
          console.log('🔍 orderData 전체 구조:', JSON.stringify(orderData, null, 2));

          // 현재 로그인한 사용자 ID 가져오기
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          console.log('🔐 인증 상태 확인:', { user: user?.id, email: user?.email, authError });
          
          if (!user) {
            console.error('❌ 로그인되지 않은 사용자');
            throw new Error('로그인이 필요합니다.');
          }
          
          console.log('✅ 인증된 사용자:', user.id);

          // 결제 방법을 스키마에 맞게 매핑
          const mapPaymentMethod = (method: string): string => {
            const mapping: Record<string, string> = {
              'card': 'card',
              'cash': 'cash',
              'toss': 'toss_pay',
              'naver': 'card', // 네이버페이는 카드로 매핑
              'payco': 'card', // 페이코는 카드로 매핑
              'mobile': 'card', // 휴대폰 결제는 카드로 매핑
            };
            console.log('🔍 결제 방법 매핑:', { 원본: method, 매핑됨: mapping[method] || 'card' });
            return mapping[method] || 'card';
          };

          // 주문 데이터 준비
          const insertData = {
            order_number: orderData.orderNumber,
            customer_id: user.id, // 현재 로그인한 사용자 ID
            store_id: orderData.storeId,
            type: orderData.orderType, // order_type → type
            delivery_address: orderData.deliveryAddress ? JSON.stringify(orderData.deliveryAddress) : null,
            payment_method: mapPaymentMethod(orderData.paymentMethod),
            subtotal: orderData.subtotal,
            tax_amount: orderData.taxAmount,
            delivery_fee: orderData.deliveryFee,
            total_amount: orderData.totalAmount,
            // 포인트 정보 추가
            points_used: (orderData as any).pointsUsed || 0,
            points_discount_amount: (orderData as any).pointsDiscountAmount || 0,
            status: orderData.status,
            payment_status: 'paid', // 결제 성공 페이지에서 호출되므로 paid로 설정
            payment_data: null, // paymentResult 필드 제거됨
          };

          console.log('📦 Supabase에 삽입할 데이터:', insertData);
          console.log('🔍 원본 paymentMethod:', orderData.paymentMethod);
          console.log('🔍 매핑된 paymentMethod:', mapPaymentMethod(orderData.paymentMethod));

          // Supabase에 주문 저장 (데이터베이스 스키마에 맞춤)
          const { data, error } = await supabase
            .from('orders')
            .insert(insertData)
            .select()
            .single();

          if (error) {
            console.error('❌ 주문 저장 실패:', error);
            console.error('❌ 에러 상세:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            throw error;
          }

          console.log('✅ 주문 저장 성공:', data);

          // 주문 아이템들을 order_items 테이블에 저장하고 재고 차감
          if (orderData.items && orderData.items.length > 0) {
            const orderItems = orderData.items.map(item => ({
              order_id: data.id,
              product_id: item.productId,
              product_name: item.productName,
              quantity: item.quantity,
              unit_price: item.price,
              discount_amount: (item.price * item.discountRate * item.quantity),
              subtotal: item.subtotal
            }));

            const { error: itemsError } = await supabase
              .from('order_items')
              .insert(orderItems);

            if (itemsError) {
              console.error('❌ 주문 아이템 저장 실패:', itemsError);
              console.error('❌ 아이템 에러 상세:', {
                message: itemsError.message,
                details: itemsError.details,
                hint: itemsError.hint,
                code: itemsError.code
              });
              // 주문 아이템 저장 실패해도 주문은 계속 진행
            } else {
              console.log('✅ 주문 아이템 저장 성공:', orderItems.length, '개');
            }

            // 재고 차감 처리
            console.log('📦 재고 차감 시작...');
            for (const item of orderData.items) {
              try {
                // 현재 재고 확인
                const { data: currentStock, error: stockError } = await supabase
                  .from('store_products')
                  .select('stock_quantity')
                  .eq('store_id', orderData.storeId)
                  .eq('product_id', item.productId)
                  .single();

                if (stockError) {
                  console.error(`❌ 재고 조회 실패 (상품: ${item.productName}):`, stockError);
                  console.log(`⚠️ 재고 조회 실패로 인해 재고 차감을 건너뜁니다. (상품: ${item.productName})`);
                  continue; // 재고 조회 실패해도 주문은 계속 진행
                }

                const newStockQuantity = currentStock.stock_quantity - item.quantity;
                
                if (newStockQuantity < 0) {
                  console.warn(`⚠️ 재고 부족 (상품: ${item.productName}): 현재 ${currentStock.stock_quantity}, 요청 ${item.quantity}`);
                  // 재고가 부족해도 주문은 진행 (실제로는 재고 확인을 먼저 해야 함)
                }

                // 재고 업데이트
                const { error: updateError } = await supabase
                  .from('store_products')
                  .update({ 
                    stock_quantity: Math.max(0, newStockQuantity),
                    updated_at: new Date().toISOString()
                  })
                  .eq('store_id', orderData.storeId)
                  .eq('product_id', item.productId);

                if (updateError) {
                  console.error(`❌ 재고 업데이트 실패 (상품: ${item.productName}):`, updateError);
                  console.log(`⚠️ 재고 업데이트 실패로 인해 재고 차감을 건너뜁니다. (상품: ${item.productName})`);
                } else {
                  console.log(`✅ 재고 차감 완료 (상품: ${item.productName}): ${currentStock.stock_quantity} → ${Math.max(0, newStockQuantity)}`);
                }

                // 재고 변동 이력 기록 (선택적)
                try {
                  // store_products에서 ID를 먼저 조회
                  const { data: storeProductData, error: storeProductError } = await supabase
                    .from('store_products')
                    .select('id')
                    .eq('store_id', orderData.storeId)
                    .eq('product_id', item.productId)
                    .single();

                  if (storeProductError || !storeProductData) {
                    console.error(`❌ store_product ID 조회 실패 (상품: ${item.productName}):`, storeProductError);
                  } else {
                    const { error: logError } = await supabase
                      .from('inventory_transactions')
                      .insert({
                        store_product_id: storeProductData.id,
                        transaction_type: 'out',
                        quantity: item.quantity,
                        previous_quantity: currentStock.stock_quantity,
                        new_quantity: Math.max(0, newStockQuantity),
                        reference_type: 'order',
                        reference_id: data.id,
                        reason: `주문 #${orderData.orderNumber}로 인한 재고 차감`,
                        created_by: user.id
                      });

                    if (logError) {
                      console.error(`❌ 재고 이력 기록 실패 (상품: ${item.productName}):`, logError);
                      // 이력 기록 실패는 주문 진행에 영향을 주지 않음
                    }
                  }
                } catch (logError) {
                  console.error(`❌ 재고 이력 기록 중 예외 발생 (상품: ${item.productName}):`, logError);
                  // 이력 기록 실패는 주문 진행에 영향을 주지 않음
                }
              } catch (error) {
                console.error(`❌ 재고 처리 중 오류 (상품: ${item.productName}):`, error);
                console.log(`⚠️ 재고 처리 오류로 인해 재고 차감을 건너뜁니다. (상품: ${item.productName})`);
                // 재고 처리 실패해도 주문은 계속 진행
              }
            }
            console.log('📦 재고 차감 완료');
          }

          // 포인트 차감 처리
          const pointsUsed = (orderData as any).pointsUsed || 0;
          if (pointsUsed > 0) {
            console.log('💰 포인트 차감 시작:', pointsUsed, '포인트');
            try {
              // 포인트 차감 레코드 생성
              const { error: pointError } = await supabase
                .from('points')
                .insert({
                  user_id: user.id,
                  amount: -pointsUsed, // 차감이므로 음수
                  type: 'used',
                  description: `주문 #${orderData.orderNumber}에서 포인트 사용`,
                  order_id: data.id
                });

              if (pointError) {
                console.error('❌ 포인트 차감 실패:', pointError);
                console.error('❌ 포인트 차감 오류 상세:', {
                  message: pointError.message,
                  details: pointError.details,
                  hint: pointError.hint,
                  code: pointError.code
                });
                // 포인트 차감 실패해도 주문은 계속 진행 (이미 결제 완료됨)
              } else {
                console.log('✅ 포인트 차감 완료:', pointsUsed, '포인트');
              }
            } catch (error) {
              console.error('❌ 포인트 차감 중 예외 발생:', error);
              // 포인트 차감 실패해도 주문은 계속 진행
            }
          }

          // 로컬 상태에 추가
          const newOrder: Order = {
            id: data.id,
            orderNumber: data.order_number,
            storeId: data.store_id,
            storeName: orderData.storeName,
            orderType: data.type, // order_type → type
            items: orderData.items, // 원본 데이터 사용 (Supabase에서 items가 제대로 저장되지 않을 수 있음)
            deliveryAddress: data.delivery_address ? JSON.parse(data.delivery_address) : undefined,
            paymentMethod: data.payment_method,
            paymentStatus: data.payment_status,
            subtotal: data.subtotal,
            taxAmount: data.tax_amount,
            deliveryFee: data.delivery_fee,
            totalAmount: data.total_amount,
            // 포인트 정보 추가
            pointsUsed: data.points_used || 0,
            pointsDiscountAmount: data.points_discount_amount || 0,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            completedAt: data.completed_at,
          };

          set((state) => ({
            orders: [newOrder, ...state.orders],
            isLoading: false
          }));

          console.log('🎉 주문 생성 완료 - 새로운 주문이 추가되었습니다:', newOrder.id);
          console.log('📊 현재 총 주문 수:', get().orders.length);

          // 주문 생성 후 즉시 주문 목록 새로고침 (실시간 동기화)
          setTimeout(() => {
            console.log('🔄 주문 목록 새로고침 시작...');
            get().fetchOrders();
          }, 1000);

          return newOrder;
        } catch (error) {
          console.error('❌ 주문 생성 실패:', error);
          console.error('❌ 오류 타입:', typeof error);
          console.error('❌ 오류 스택:', error instanceof Error ? error.stack : 'No stack trace');
          
          const errorMessage = error instanceof Error ? error.message : '주문 생성에 실패했습니다.';
          console.error('❌ 최종 에러 메시지:', errorMessage);
          
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw error;
        }
      },

      updateOrderStatus: async (orderId, status) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log(`🔄 주문 상태 업데이트: ${orderId} → ${status}`);

          const { data, error } = await supabase
            .from('orders')
            .update({ 
              status,
              updated_at: new Date().toISOString(),
              completed_at: status === 'completed' ? new Date().toISOString() : null
            })
            .eq('id', orderId)
            .select()
            .single();

          if (error) {
            console.error('❌ 주문 상태 업데이트 실패:', error);
            throw error;
          }

          console.log('✅ 주문 상태 업데이트 성공:', data);

          // 주문 상태 히스토리 추가
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error: historyError } = await supabase
              .from('order_status_history')
              .insert({
                order_id: orderId,
                status: status,
                changed_by: user.id,
                notes: `주문 상태가 ${status}로 변경되었습니다.`
              });

            if (historyError) {
              console.error('❌ 주문 히스토리 저장 실패:', historyError);
              // 히스토리 저장 실패해도 주문 상태 업데이트는 계속 진행
            } else {
              console.log('✅ 주문 히스토리 저장 성공');
            }
          }

          // 주문 취소 시 재고 복구
          if (status === 'cancelled') {
            console.log('🔄 주문 취소로 인한 재고 복구 시작...');
            
            try {
              // 주문 아이템 조회
              const { data: orderItems, error: itemsError } = await supabase
                .from('order_items')
                .select('product_id, quantity')
                .eq('order_id', orderId);

              if (itemsError) {
                console.error('❌ 주문 아이템 조회 실패:', itemsError);
              } else if (orderItems && orderItems.length > 0) {
                // 주문 정보 조회 (store_id 필요)
                const { data: orderInfo, error: orderError } = await supabase
                  .from('orders')
                  .select('store_id')
                  .eq('id', orderId)
                  .single();

                if (orderError) {
                  console.error('❌ 주문 정보 조회 실패:', orderError);
                } else {
                  // 각 상품의 재고 복구
                  for (const item of orderItems) {
                    try {
                      // 현재 재고 확인
                      const { data: currentStock, error: stockError } = await supabase
                        .from('store_products')
                        .select('stock_quantity')
                        .eq('store_id', orderInfo.store_id)
                        .eq('product_id', item.product_id)
                        .single();

                      if (stockError) {
                        console.error(`❌ 재고 조회 실패 (상품 ID: ${item.product_id}):`, stockError);
                        continue;
                      }

                      const newStockQuantity = currentStock.stock_quantity + item.quantity;

                      // 재고 업데이트
                      const { error: updateError } = await supabase
                        .from('store_products')
                        .update({ 
                          stock_quantity: newStockQuantity,
                          updated_at: new Date().toISOString()
                        })
                        .eq('store_id', orderInfo.store_id)
                        .eq('product_id', item.product_id);

                      if (updateError) {
                        console.error(`❌ 재고 복구 실패 (상품 ID: ${item.product_id}):`, updateError);
                      } else {
                        console.log(`✅ 재고 복구 완료 (상품 ID: ${item.product_id}): ${currentStock.stock_quantity} → ${newStockQuantity}`);
                      }

                      // 재고 변동 이력 기록 - store_product ID 먼저 조회
                      const { data: storeProductData, error: storeProductError } = await supabase
                        .from('store_products')
                        .select('id')
                        .eq('store_id', orderInfo.store_id)
                        .eq('product_id', item.product_id)
                        .single();

                      if (storeProductError || !storeProductData) {
                        console.error(`❌ store_product ID 조회 실패 (상품 ID: ${item.product_id}):`, storeProductError);
                      } else {
                        const { error: logError } = await supabase
                          .from('inventory_transactions')
                          .insert({
                            store_product_id: storeProductData.id,
                            transaction_type: 'in',
                            quantity: item.quantity,
                            previous_quantity: currentStock.stock_quantity,
                            new_quantity: newStockQuantity,
                            reference_type: 'order',
                            reference_id: orderId,
                            reason: `주문 취소로 인한 재고 복구`,
                            created_by: user.id
                          });

                        if (logError) {
                          console.error(`❌ 재고 이력 기록 실패 (상품 ID: ${item.product_id}):`, logError);
                        }
                      }
                    } catch (error) {
                      console.error(`❌ 재고 복구 처리 중 오류 (상품 ID: ${item.product_id}):`, error);
                    }
                  }
                  console.log('🔄 재고 복구 완료');
                }
              }
            } catch (error) {
              console.error('❌ 재고 복구 중 오류:', error);
            }
          }

          // 로컬 상태 업데이트
          set((state) => ({
            orders: state.orders.map(order => 
              order.id === orderId 
                ? { 
                    ...order, 
                    status, 
                    updatedAt: data.updated_at,
                    completedAt: data.completed_at
                  }
                : order
            ),
            isLoading: false
          }));
        } catch (error) {
          console.error('❌ 주문 상태 업데이트 실패:', error);
          set({ 
            error: error instanceof Error ? error.message : '주문 상태 업데이트에 실패했습니다.',
            isLoading: false 
          });
          throw error;
        }
      },

      fetchOrders: async () => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('📡 Supabase에서 주문 목록 조회 중...');

          // 현재 로그인한 사용자 정보 가져오기
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          if (authError || !user) {
            console.error('❌ 사용자 인증 정보 없음:', authError);
            set({ orders: [], isLoading: false });
            return;
          }

          console.log('🔐 인증된 사용자:', user.id);

          // 사용자 프로필 정보 가져오기
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('❌ 프로필 조회 실패:', profileError);
            set({ orders: [], isLoading: false });
            return;
          }

          console.log('👤 사용자 역할:', profile.role);

          let query = supabase
            .from('orders')
            .select(`
              *,
              stores (
                name
              ),
              order_items (
                product_id,
                product_name,
                quantity,
                unit_price,
                discount_amount,
                subtotal
              )
            `);

          // 점주인 경우 자신의 지점 주문만 조회
          if (profile.role === 'store_owner') {
            console.log('🏪 점주 - 자신의 지점 주문만 조회');
            
            // 점주의 지점 ID 가져오기
            const { data: storeData, error: storeError } = await supabase
              .from('stores')
              .select('id')
              .eq('owner_id', user.id)
              .single();

            if (storeError || !storeData) {
              console.error('❌ 점주의 지점 정보 조회 실패:', storeError);
              set({ orders: [], isLoading: false });
              return;
            }

            console.log('🏪 점주 지점 ID:', storeData.id);
            query = query.eq('store_id', storeData.id);
          } else if (profile.role === 'hq_admin' || profile.role === 'headquarters') {
            console.log('🏢 본사 관리자 - 모든 지점 주문 조회');
            // 본사는 모든 주문 조회 (필터링 없음)
          } else if (profile.role === 'customer') {
            console.log('👤 고객 - 자신의 주문만 조회');
            query = query.eq('customer_id', user.id);
          } else {
            console.log('👤 알 수 없는 역할 - 주문 조회 불가:', profile.role);
            set({ orders: [], isLoading: false });
            return;
          }

          const { data, error } = await query.order('created_at', { ascending: false });

          if (error) {
            console.error('❌ 주문 목록 조회 실패:', error);
            throw error;
          }

          console.log('✅ 주문 목록 조회 성공:', data?.length, '개');

          const orders: Order[] = (data || []).map(item => ({
            id: item.id,
            orderNumber: item.order_number,
            storeId: item.store_id,
            storeName: item.stores?.name || '알 수 없는 지점',
            orderType: item.type, // order_type → type
            items: (item.order_items || []).map((orderItem: any) => ({
              productId: orderItem.product_id,
              productName: orderItem.product_name,
              quantity: orderItem.quantity,
              price: orderItem.unit_price,
              discountRate: orderItem.discount_amount / (orderItem.unit_price * orderItem.quantity) || 0,
              subtotal: orderItem.subtotal
            })),
            deliveryAddress: item.delivery_address ? 
              (typeof item.delivery_address === 'string' ? 
                JSON.parse(item.delivery_address) : 
                item.delivery_address) : 
              undefined,
            paymentMethod: item.payment_method,
            paymentStatus: item.payment_status,
            subtotal: item.subtotal,
            taxAmount: item.tax_amount,
            deliveryFee: item.delivery_fee,
            totalAmount: item.total_amount,
            // 포인트 정보 추가
            pointsUsed: item.points_used || 0,
            pointsDiscountAmount: item.points_discount_amount || 0,
            status: item.status,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            completedAt: item.completed_at,
          }));

          set({ orders, isLoading: false });
        } catch (error) {
          console.error('❌ 주문 목록 조회 실패:', error);
          set({ 
            error: error instanceof Error ? error.message : '주문 목록 조회에 실패했습니다.',
            isLoading: false 
          });
        }
      },

      subscribeToOrders: () => {
        console.log('🔔 주문 실시간 구독 시작...');
        
        if (orderSubscription) {
          orderSubscription.unsubscribe();
        }

        orderSubscription = supabase
          .channel('orders')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'orders' 
            }, 
            (payload) => {
              console.log('🔄 주문 실시간 업데이트:', payload);
              
              // 주문 목록 새로고침
              get().fetchOrders();
            }
          )
          .subscribe();
      },

      unsubscribeFromOrders: () => {
        console.log('🔕 주문 실시간 구독 해제...');
        
        if (orderSubscription) {
          orderSubscription.unsubscribe();
          orderSubscription = null;
        }
      },

      getOrderById: (orderId) => {
        return get().orders.find(order => order.id === orderId);
      },

      getOrdersByStatus: (status) => {
        return get().orders.filter(order => order.status === status);
      },

      clearOrders: async () => {
        console.log('🚀 clearOrders 함수 시작');
        set({ isLoading: true, error: null });
        
        try {
          console.log('🗑️ 모든 주문 내역 삭제 시작...');

          // 현재 로그인한 사용자 ID 가져오기
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('로그인이 필요합니다.');
          }

          console.log('✅ 인증된 사용자:', user.id);

          // 주문 삭제 (CASCADE로 관련 데이터도 함께 삭제됨)
          const { error: deleteError } = await supabase
            .from('orders')
            .delete()
            .eq('customer_id', user.id);

          if (deleteError) {
            console.error('❌ 주문 삭제 실패:', deleteError);
            throw deleteError;
          }

          console.log('✅ 주문 삭제 완료');

          // localStorage에서 주문 데이터 제거 (persist 미들웨어 우회)
          const storageKey = 'convenience-store-orders';
          if (typeof window !== 'undefined') {
            localStorage.removeItem(storageKey);
            console.log('🗑️ localStorage에서 주문 데이터 제거 완료');
          }

          // 로컬 상태 초기화
          set({ orders: [], isLoading: false, error: null });
          
          // persist 미들웨어가 즉시 저장하도록 강제 실행 (여러 번 시도)
          const clearStorage = () => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem(storageKey);
              console.log('🔄 persist 미들웨어 동기화 완료');
            }
          };
          
          // 즉시 실행
          clearStorage();
          
          // 약간의 지연 후 다시 실행 (persist 미들웨어가 다시 저장할 수 있으므로)
          setTimeout(clearStorage, 50);
          setTimeout(clearStorage, 200);
          
          console.log('✅ 모든 주문 내역 삭제 완료');
        } catch (error) {
          console.error('❌ 주문 내역 삭제 실패:', error);
          set({ 
            error: error instanceof Error ? error.message : '주문 내역 삭제에 실패했습니다.',
            isLoading: false 
          });
          throw error;
        }
      }
    }),
    {
      name: 'convenience-store-orders',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 주문이 비어있으면 아무것도 저장하지 않음 (삭제 시 localStorage에서 완전히 제거)
        ...(state.orders.length > 0 && { orders: state.orders })
      }),
      // persist 미들웨어가 상태 변경을 즉시 반영하도록 설정
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // 버전 마이그레이션 로직 (필요시)
        return persistedState;
      }
    }
  )
);