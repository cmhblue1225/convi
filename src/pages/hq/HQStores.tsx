import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../stores/common/authStore';

interface Store {
  id: string;
  name: string;
  owner_id: string | null;
  address: string;
  phone: string;
  business_hours: any;
  delivery_available: boolean | null;
  pickup_available: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  owner?: {
    full_name: string;
    email: string;
  };
}

const HQStores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const { user } = useAuthStore();

  // 실시간 구독 설정
  useEffect(() => {
    fetchStores();

    // 실시간 구독
    const subscription = supabase
      .channel('stores_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stores' }, 
        (payload) => {
          console.log('🔄 지점 데이터 변경 감지:', payload);
          fetchStores(); // 데이터 새로고침
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      
      // 지점 목록 조회 (소유자 정보 없이)
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (storesError) {
        console.error('❌ 지점 목록 조회 실패:', storesError);
        return;
      }

      // 기본 소유자 정보 설정
      const storesWithOwners = (storesData || []).map((store) => ({
        ...store,
        owner: {
          full_name: store.owner_id ? '점주' : '미지정',
          email: store.owner_id ? '***@***.***' : 'N/A'
        }
      }));

      setStores(storesWithOwners);
    } catch (error) {
      console.error('❌ 지점 목록 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setShowEditModal(true);
  };

  const handleDeleteStore = (store: Store) => {
    setStoreToDelete(store);
    setShowDeleteModal(true);
  };

  const updateStore = async (updatedData: Partial<Store>) => {
    if (!editingStore) return;

    try {
      const { error } = await supabase
        .from('stores')
        .update(updatedData)
        .eq('id', editingStore.id);

      if (error) {
        console.error('❌ 지점 수정 실패:', error);
        alert('지점 수정에 실패했습니다.');
        return;
      }

      console.log('✅ 지점 수정 완료');
      setShowEditModal(false);
      setEditingStore(null);
      fetchStores();
    } catch (error) {
      console.error('❌ 지점 수정 중 오류:', error);
      alert('지점 수정 중 오류가 발생했습니다.');
    }
  };

  const deleteStore = async () => {
    if (!storeToDelete) return;

    try {
      // 관련 데이터 확인
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('store_id', storeToDelete.id)
        .limit(1);

      if (orders && orders.length > 0) {
        alert('주문 내역이 있는 지점은 삭제할 수 없습니다.');
        return;
      }

      // 지점 삭제 (CASCADE로 관련 데이터도 함께 삭제됨)
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeToDelete.id);

      if (error) {
        console.error('❌ 지점 삭제 실패:', error);
        alert('지점 삭제에 실패했습니다.');
        return;
      }

      console.log('✅ 지점 삭제 완료');
      setShowDeleteModal(false);
      setStoreToDelete(null);
      fetchStores();
    } catch (error) {
      console.error('❌ 지점 삭제 중 오류:', error);
      alert('지점 삭제 중 오류가 발생했습니다.');
    }
  };

  const toggleStoreStatus = async (store: Store) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ is_active: !store.is_active })
        .eq('id', store.id);

      if (error) {
        console.error('❌ 지점 상태 변경 실패:', error);
        alert('지점 상태 변경에 실패했습니다.');
        return;
      }

      console.log('✅ 지점 상태 변경 완료');
      fetchStores();
    } catch (error) {
      console.error('❌ 지점 상태 변경 중 오류:', error);
      alert('지점 상태 변경 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">지점 관리</h1>
        <p className="text-gray-600">전체 지점을 관리하고 모니터링합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">전체 지점</div>
          <div className="text-2xl font-bold text-gray-900">{stores.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">운영 중</div>
          <div className="text-2xl font-bold text-green-600">
            {stores.filter(s => s.is_active).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">운영 중단</div>
          <div className="text-2xl font-bold text-red-600">
            {stores.filter(s => !s.is_active).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">배송 가능</div>
          <div className="text-2xl font-bold text-blue-600">
            {stores.filter(s => s.delivery_available).length}
          </div>
        </div>
      </div>

      {/* 지점 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">지점 목록</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  지점명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  점주
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주소
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연락처
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  서비스
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{store.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{store.owner?.full_name || '미지정'}</div>
                    <div className="text-sm text-gray-500">{store.owner?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{store.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{store.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      store.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {store.is_active ? '운영중' : '운영중단'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {store.delivery_available && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          배송
                        </span>
                      )}
                      {store.pickup_available && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          픽업
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {store.created_at ? new Date(store.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleStoreStatus(store)}
                        className={`px-3 py-1 text-xs rounded ${
                          store.is_active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {store.is_active ? '중단' : '재개'}
                      </button>
                      <button
                        onClick={() => handleEditStore(store)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteStore(store)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 수정 모달 */}
      {showEditModal && editingStore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">지점 정보 수정</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateStore({
                  name: formData.get('name') as string,
                  address: formData.get('address') as string,
                  phone: formData.get('phone') as string,
                  delivery_available: formData.get('delivery_available') === 'on',
                  pickup_available: formData.get('pickup_available') === 'on',
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">지점명</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingStore.name}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">주소</label>
                    <input
                      type="text"
                      name="address"
                      defaultValue={editingStore.address}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">연락처</label>
                    <input
                      type="text"
                      name="phone"
                      defaultValue={editingStore.phone}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="delivery_available"
                        defaultChecked={editingStore.delivery_available ?? false}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">배송 가능</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="pickup_available"
                        defaultChecked={editingStore.pickup_available ?? false}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">픽업 가능</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    수정
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && storeToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">지점 삭제 확인</h3>
              <p className="text-sm text-gray-600 mb-4">
                정말로 "{storeToDelete.name}" 지점을 삭제하시겠습니까?<br />
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={deleteStore}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HQStores; 