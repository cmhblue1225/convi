/**
 * 원자적 재고 관리 시스템
 * Race Condition 방지 및 데이터 일관성 보장
 */

import { supabase } from '../supabase/client';

export interface InventoryItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface InventoryValidationResult {
  isValid: boolean;
  errors: string[];
  availableStock: Record<string, number>;
}

export interface InventoryTransactionResult {
  success: boolean;
  message: string;
  transactionIds: string[];
  errors?: string[];
}

/**
 * 재고 가용성 검증 (주문 전 사전 확인)
 */
export async function validateInventoryAvailability(
  storeId: string,
  items: InventoryItem[]
): Promise<InventoryValidationResult> {
  try {
    console.log('🔍 재고 가용성 검증 시작:', { storeId, itemCount: items.length });

    const errors: string[] = [];
    const availableStock: Record<string, number> = {};

    // 모든 상품의 현재 재고를 한 번에 조회
    const productIds = items.map(item => item.productId);
    const { data: stockData, error: stockError } = await supabase
      .from('store_products')
      .select('product_id, stock_quantity, products(name)')
      .eq('store_id', storeId)
      .in('product_id', productIds)
      .eq('is_available', true);

    if (stockError) {
      console.error('❌ 재고 조회 실패:', stockError);
      return {
        isValid: false,
        errors: ['재고 정보를 조회할 수 없습니다.'],
        availableStock: {}
      };
    }

    // 각 상품별 재고 검증
    for (const item of items) {
      const stockInfo = stockData?.find(s => s.product_id === item.productId);
      
      if (!stockInfo) {
        errors.push(`${item.productName}: 상품 정보를 찾을 수 없습니다.`);
        continue;
      }

      availableStock[item.productId] = stockInfo.stock_quantity;

      if (stockInfo.stock_quantity < item.quantity) {
        errors.push(
          `${item.productName}: 재고 부족 (요청: ${item.quantity}개, 재고: ${stockInfo.stock_quantity}개)`
        );
      }
    }

    const isValid = errors.length === 0;
    console.log(isValid ? '✅ 재고 검증 통과' : '❌ 재고 검증 실패:', { errors });

    return {
      isValid,
      errors,
      availableStock
    };

  } catch (error) {
    console.error('❌ 재고 검증 중 예외:', error);
    return {
      isValid: false,
      errors: ['재고 검증 중 오류가 발생했습니다.'],
      availableStock: {}
    };
  }
}

/**
 * 원자적 재고 차감 및 트랜잭션 기록
 * PostgreSQL 트랜잭션을 사용하여 데이터 일관성 보장
 */
export async function atomicInventoryDeduction(
  storeId: string,
  items: InventoryItem[],
  referenceType: string,
  referenceId: string,
  orderNumber: string,
  userId: string
): Promise<InventoryTransactionResult> {
  try {
    console.log('⚛️ 원자적 재고 차감 시작:', { 
      storeId, 
      itemCount: items.length, 
      referenceType, 
      orderNumber 
    });

    // 1. 먼저 재고 가용성 검증
    const validation = await validateInventoryAvailability(storeId, items);
    if (!validation.isValid) {
      return {
        success: false,
        message: '재고가 부족합니다.',
        transactionIds: [],
        errors: validation.errors
      };
    }

    // 2. PostgreSQL RPC 함수를 통한 원자적 재고 차감
    const rpcParams = {
      p_store_id: storeId,
      p_items: items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        product_name: item.productName
      })),
      p_reference_type: referenceType,
      p_reference_id: referenceId,
      p_order_number: orderNumber,
      p_user_id: userId
    };

    console.log('🔍 RPC 호출 파라미터:', JSON.stringify(rpcParams, null, 2));
    console.log('🔍 Store ID 타입:', typeof storeId, storeId);
    console.log('🔍 Items 상세:', items.map(item => ({
      productId: item.productId,
      productIdType: typeof item.productId,
      productName: item.productName,
      quantity: item.quantity
    })));

    const { data: result, error: rpcError } = await supabase
      .rpc('atomic_inventory_deduction', rpcParams);

    if (rpcError) {
      console.error('❌ 원자적 재고 차감 실패:', rpcError);
      return {
        success: false,
        message: `재고 차감 실패: ${rpcError.message}`,
        transactionIds: [],
        errors: [rpcError.message]
      };
    }

    console.log('✅ 원자적 재고 차감 성공:', result);
    return {
      success: true,
      message: `${items.length}개 상품의 재고가 성공적으로 차감되었습니다.`,
      transactionIds: result?.transaction_ids || []
    };

  } catch (error) {
    console.error('❌ 원자적 재고 차감 중 예외:', error);
    return {
      success: false,
      message: '재고 차감 중 오류가 발생했습니다.',
      transactionIds: [],
      errors: [error instanceof Error ? error.message : '알 수 없는 오류']
    };
  }
}

/**
 * 주문 취소 시 재고 복구
 */
export async function atomicInventoryRestoration(
  orderId: string,
  userId: string
): Promise<InventoryTransactionResult> {
  try {
    console.log('🔄 원자적 재고 복구 시작:', { orderId });

    const { data: result, error: rpcError } = await supabase
      .rpc('atomic_inventory_restoration', {
        p_order_id: orderId,
        p_user_id: userId
      });

    if (rpcError) {
      console.error('❌ 원자적 재고 복구 실패:', rpcError);
      return {
        success: false,
        message: `재고 복구 실패: ${rpcError.message}`,
        transactionIds: [],
        errors: [rpcError.message]
      };
    }

    console.log('✅ 원자적 재고 복구 성공:', result);
    return {
      success: true,
      message: '재고가 성공적으로 복구되었습니다.',
      transactionIds: result?.transaction_ids || []
    };

  } catch (error) {
    console.error('❌ 원자적 재고 복구 중 예외:', error);
    return {
      success: false,
      message: '재고 복구 중 오류가 발생했습니다.',
      transactionIds: [],
      errors: [error instanceof Error ? error.message : '알 수 없는 오류']
    };
  }
}

/**
 * 실시간 재고 조회 (장바구니에서 사용)
 */
export async function getRealTimeStock(
  storeId: string,
  productIds: string[]
): Promise<Record<string, number>> {
  try {
    const { data: stockData, error } = await supabase
      .from('store_products')
      .select('product_id, stock_quantity')
      .eq('store_id', storeId)
      .in('product_id', productIds)
      .eq('is_available', true);

    if (error) {
      console.error('❌ 실시간 재고 조회 실패:', error);
      return {};
    }

    const stockMap: Record<string, number> = {};
    stockData?.forEach(item => {
      stockMap[item.product_id] = item.stock_quantity;
    });

    return stockMap;

  } catch (error) {
    console.error('❌ 실시간 재고 조회 중 예외:', error);
    return {};
  }
}