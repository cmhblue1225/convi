import React, { forwardRef } from 'react';
import type { Order } from '../../stores/orderStore';

interface ReceiptProps {
  order: Order;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ 
  order, 
  storeName = "편의점",
  storeAddress = "",
  storePhone = ""
}, ref) => {
  // 디버깅을 위한 로그
  console.log('Receipt 컴포넌트에서 받은 order:', order);
  console.log('포인트 사용:', order.pointsUsed);
  console.log('쿠폰 할인:', order.couponDiscountAmount);
  console.log('세금:', order.taxAmount);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      'pending': '주문 접수',
      'confirmed': '주문 확인',
      'preparing': '준비 중',
      'ready': '픽업 대기',
      'completed': '완료',
      'cancelled': '취소됨'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap = {
      'card': '신용카드',
      'cash': '현금',
      'toss_pay': '토스페이',
      'kakao_pay': '카카오페이',
      'naver_pay': '네이버페이'
    };
    return methodMap[method as keyof typeof methodMap] || method;
  };

  const calculateSubtotal = () => {
    if (!order.items || order.items.length === 0) return 0;
    return order.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const isCompleted = order.status === 'completed';
  const isCancelled = order.status === 'cancelled';

  return (
    <div ref={ref} style={{
      backgroundColor: 'white',
      padding: '32px',
      maxWidth: '448px',
      margin: '0 auto',
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      lineHeight: '1.4',
      color: '#000'
    }}>
      {/* 영수증 헤더 */}
      <div style={{
        textAlign: 'center',
        borderBottom: '2px dashed #9ca3af',
        paddingBottom: '16px',
        marginBottom: '16px'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>{storeName}</h1>
        {storeAddress && <p style={{
          color: '#4b5563',
          fontSize: '12px'
        }}>{storeAddress}</p>}
        {storePhone && <p style={{
          color: '#4b5563',
          fontSize: '12px'
        }}>TEL: {storePhone}</p>}
        <div style={{ marginTop: '12px' }}>
          <p style={{
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            {isCancelled ? '취소 영수증' : '주문 영수증'}
          </p>
        </div>
      </div>

      {/* 주문 정보 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>주문번호:</span>
          <span style={{ fontWeight: 'bold' }}>{order.orderNumber}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>주문일시:</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>
        {order.completedAt && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>{isCancelled ? '취소일시:' : '완료일시:'}</span>
            <span>{formatDate(order.completedAt)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>상태:</span>
          <span style={{
            fontWeight: 'bold',
            color: isCompleted ? '#059669' : isCancelled ? '#dc2626' : '#2563eb'
          }}>
            {getStatusText(order.status)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>주문방식:</span>
          <span>{order.orderType === 'pickup' ? '픽업' : '배송'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>결제방법:</span>
          <span>{getPaymentMethodText(order.paymentMethod)}</span>
        </div>
      </div>

      {/* 배송 정보 (배송 주문인 경우) */}
      {order.orderType === 'delivery' && order.deliveryAddress && (
        <div style={{
          marginBottom: '16px',
          borderTop: '1px dashed #d1d5db',
          paddingTop: '8px'
        }}>
          <p style={{
            fontWeight: 'bold',
            marginBottom: '4px'
          }}>배송 정보</p>
          <div style={{ fontSize: '12px' }}>
            <div style={{ marginBottom: '4px' }}>받는분: {order.deliveryAddress.name}</div>
            <div style={{ marginBottom: '4px' }}>연락처: {order.deliveryAddress.phone}</div>
            <div style={{ marginBottom: '4px' }}>주소: {order.deliveryAddress.address}</div>
            {order.deliveryAddress.detailAddress && (
              <div style={{ marginBottom: '4px' }}>상세주소: {order.deliveryAddress.detailAddress}</div>
            )}
            {order.deliveryAddress.memo && (
              <div style={{ marginBottom: '4px' }}>메모: {order.deliveryAddress.memo}</div>
            )}
          </div>
        </div>
      )}

      {/* 주문 상품 */}
      <div style={{
        borderTop: '1px dashed #d1d5db',
        paddingTop: '8px',
        marginBottom: '16px'
      }}>
        <p style={{
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>주문 상품</p>
        <div>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500' }}>{item.productName}</div>
                    <div style={{
                      fontSize: '12px',
                      color: '#4b5563'
                    }}>
                      {(item.price || 0).toLocaleString()}원 × {item.quantity || 0}개
                      {item.discountRate && item.discountRate > 0 && (
                        <span style={{
                          color: '#dc2626',
                          marginLeft: '4px'
                        }}>
                          (-{((item.discountRate || 0) * 100).toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 'bold',
                    textAlign: 'right'
                  }}>
                    {(item.subtotal || 0).toLocaleString()}원
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#6b7280', 
              fontStyle: 'italic',
              padding: '16px'
            }}>
              상품 정보가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* 결제 정보 */}
      <div style={{
        borderTop: '2px solid #1f2937',
        paddingTop: '8px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px'
        }}>
          <span>상품금액:</span>
          <span>{Math.round(calculateSubtotal() || 0).toLocaleString()}원</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
          color: '#374151',
          fontWeight: 'bold'
        }}>
          <span>부가세 (10%):</span>
          <span>{Math.round(order.taxAmount || 0).toLocaleString()}원</span>
        </div>
        {order.deliveryFee && order.deliveryFee > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px'
          }}>
            <span>배송비:</span>
            <span>{Math.round(order.deliveryFee || 0).toLocaleString()}원</span>
          </div>
        )}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          borderTop: '1px solid #d1d5db',
          paddingTop: '8px',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          <span>소계 (부가세 포함):</span>
          <span>{(Math.round(calculateSubtotal() || 0) + Math.round(order.taxAmount || 0) + Math.round(order.deliveryFee || 0)).toLocaleString()}원</span>
        </div>
        
        {/* 할인 정보 섹션 */}
        <div style={{
          borderTop: '1px dashed #d1d5db',
          paddingTop: '8px',
          marginTop: '8px'
        }}>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#374151'
          }}>할인 정보</div>
          
          {/* 포인트 사용 */}
          {order.pointsUsed && order.pointsUsed > 0 ? (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              color: '#dc2626'
            }}>
              <span>포인트 사용:</span>
              <span>-{Math.round(order.pointsUsed || 0).toLocaleString()}P</span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              color: '#6b7280',
              fontSize: '12px'
            }}>
              <span>포인트 사용:</span>
              <span>없음</span>
            </div>
          )}
          
          {/* 쿠폰 할인 */}
          {order.couponDiscountAmount && order.couponDiscountAmount > 0 ? (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              color: '#dc2626'
            }}>
              <span>쿠폰 할인:</span>
              <span>-{Math.round(order.couponDiscountAmount || 0).toLocaleString()}원</span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              color: '#6b7280',
              fontSize: '12px'
            }}>
              <span>쿠폰 할인:</span>
              <span>없음</span>
            </div>
          )}
          
          {/* 쿠폰 정보 (쿠폰이 사용된 경우) */}
          {order.appliedCouponId && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              color: '#6b7280',
              fontSize: '11px'
            }}>
              <span>사용된 쿠폰:</span>
              <span>ID: {order.appliedCouponId.substring(0, 8)}...</span>
            </div>
          )}
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '18px',
          fontWeight: 'bold',
          borderTop: '1px solid #9ca3af',
          paddingTop: '4px'
        }}>
          <span>총 결제금액:</span>
          <span>{Math.round(order.totalAmount || 0).toLocaleString()}원</span>
        </div>
      </div>

      {/* 푸터 */}
      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px dashed #d1d5db'
      }}>
        <p>이용해 주셔서 감사합니다!</p>
        <p style={{ marginTop: '8px' }}>문의사항이 있으시면 고객센터로 연락해 주세요.</p>
        {isCancelled && (
          <p style={{
            marginTop: '8px',
            color: '#dc2626',
            fontWeight: 'bold'
          }}>※ 취소된 주문입니다 ※</p>
        )}
      </div>

    </div>
  );
});

Receipt.displayName = 'Receipt';

export default Receipt;