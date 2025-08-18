import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase/client';
import { useAuthStore } from '../../stores/common/authStore';
import { useToast } from '../../hooks/useToast';

interface ProductData {
  name: string;
  category: string;
  brand?: string;
  manufacturer?: string;
  unit?: string;
  barcode?: string;
  base_price: number;
  cost_price?: number;
  tax_rate?: number;
  description?: string;
  requires_preparation?: boolean;
  preparation_time?: number;
  is_active: boolean;
  image_urls?: string[];
  image_url?: string; // 단일 이미지 URL 추가
}

interface UploadResult {
  row: number;
  productName: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

interface ExcelUploadProps {
  className?: string;
  onUploadComplete: (results: UploadResult[]) => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ className = '', onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ProductData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { user } = useAuthStore();
  const { showSuccess, showWarning } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 디버깅 정보 조회
  const fetchDebugInfo = async () => {
    try {
      console.log('🔍 디버깅 정보 조회 중...');
      
      // 활성 지점 수
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id, name, is_active')
        .eq('is_active', true);
      
      // 활성 상품 수
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, is_active')
        .eq('is_active', true);
      
      // store_products 연결 수
      const { data: storeProducts, error: storeProductsError } = await supabase
        .from('store_products')
        .select('id, store_id, product_id, is_available');
      
      setDebugInfo({
        stores: stores || [],
        products: products || [],
        storeProducts: storeProducts || [],
        errors: {
          stores: storesError,
          products: productsError,
          storeProducts: storeProductsError
        }
      });
      
      console.log('디버깅 정보:', {
        stores: stores?.length || 0,
        products: products?.length || 0,
        storeProducts: storeProducts?.length || 0
      });
      
    } catch (error) {
      console.error('디버깅 정보 조회 실패:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    } else {
      alert('엑셀 파일(.xlsx)을 선택해주세요.');
    }
  };

  const parseExcelFile = async (file: File) => {
    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets['상품정보'];
      
      if (!worksheet) {
        alert('상품정보 시트를 찾을 수 없습니다. 템플릿을 다시 다운로드해주세요.');
        return;
      }

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 3) {
        alert('데이터가 없습니다.');
        return;
      }

      const headers = jsonData[0] as string[];
      // 1행(테두리가 있는 행)을 제외하고 2행부터 데이터 읽기
      const dataRows = jsonData.slice(2) as any[][];

      const products: ProductData[] = dataRows
        .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
        .map((row, index) => {
          const product: ProductData = {
            name: row[0] || '',
            category: row[1] || '',
            brand: row[2] || undefined,
            manufacturer: row[3] || undefined,
            unit: row[4] || undefined,
            barcode: row[5] || undefined,
            base_price: parseFloat(row[6]) || 0,
            cost_price: row[7] ? parseFloat(row[7]) : undefined,
            tax_rate: row[8] ? parseFloat(row[8]) : 0.1,
            description: row[9] || undefined,
            requires_preparation: row[10] === 'Y',
            preparation_time: row[11] ? parseInt(row[11]) : undefined,
            is_active: row[12] === 'Y',
            image_urls: [],
            image_url: row[13] || undefined // 새로운 이미지 열
          };

          // 이미지 URL 처리 (새로운 이미지 열 우선, 기존 3개 필드도 지원)
          const imageUrls = [];
          if (product.image_url && product.image_url.trim()) {
            imageUrls.push(product.image_url.trim());
          }
          // 기존 3개 이미지 필드도 지원 (하위 호환성)
          if (row[14] && row[14].trim()) imageUrls.push(row[14].trim());
          if (row[15] && row[15].trim()) imageUrls.push(row[15].trim());
          if (row[16] && row[16].trim()) imageUrls.push(row[16].trim());
          
          if (imageUrls.length > 0) {
            product.image_urls = imageUrls;
          }

          return product;
        });

      setPreviewData(products);
      setShowPreview(true);
    } catch (error) {
      console.error('엑셀 파일 파싱 오류:', error);
      alert('엑셀 파일을 읽는 중 오류가 발생했습니다.');
    }
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const parseNutritionalInfo = (info: string): any => {
    try {
      return JSON.parse(info);
    } catch {
      return null;
    }
  };

  const validateProduct = (product: ProductData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!product.name || product.name.trim().length < 2) {
      errors.push('상품명은 2글자 이상이어야 합니다.');
    }

    if (!product.category) {
      errors.push('카테고리는 필수입니다.');
    }

    if (product.base_price <= 0) {
      errors.push('기본가격은 0보다 커야 합니다.');
    }

    if (product.tax_rate && (product.tax_rate < 0 || product.tax_rate > 1)) {
      errors.push('세율은 0~1 사이의 값이어야 합니다.');
    }

    if (product.requires_preparation && (!product.preparation_time || product.preparation_time < 0)) {
      errors.push('조리가 필요한 상품은 조리시간을 입력해야 합니다.');
    }

    if (product.image_urls && product.image_urls.length > 3) {
      errors.push('이미지는 최대 3개까지 입력 가능합니다.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const uploadProducts = async (products: ProductData[]) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    setUploading(true);
    const uploadResults: UploadResult[] = [];

    try {
      // 모든 지점 ID 가져오기
      console.log('🔍 활성 지점 조회 중...');
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id, name, is_active')
        .eq('is_active', true);

      if (storesError) {
        console.error('지점 정보 조회 실패:', storesError);
        throw new Error('지점 정보를 가져올 수 없습니다.');
      }

      const storeIds = stores.map(store => store.id);
      console.log('활성 지점들:', stores);
      console.log('지점 ID 목록:', storeIds);

      if (storeIds.length === 0) {
        console.warn('⚠️ 활성 지점이 없습니다. store_products 생성이 불가능합니다.');
        throw new Error('활성 지점이 없어서 상품을 연결할 수 없습니다.');
      }

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        try {
          // 상품 데이터 검증
          const validation = validateProduct(product);
          if (!validation.isValid) {
            uploadResults.push({
              row: i + 3, // 0: header, 1: bordered row, 2+: data
              productName: product.name,
              status: 'error',
              message: validation.errors.join(', ')
            });
            continue;
          }

          // 카테고리 ID 가져오기 또는 생성
          let categoryId: string;
          try {
            categoryId = await getOrCreateCategory(product.category);
          } catch (categoryError) {
            console.error(`카테고리 처리 실패 (${product.name}):`, categoryError);
            uploadResults.push({
              row: i + 3,
              productName: product.name,
              status: 'error',
              message: `카테고리 처리 실패: ${categoryError instanceof Error ? categoryError.message : '알 수 없는 오류'}`
            });
            continue;
          }

          // 기존 상품 조회 (바코드로)
          let existingProduct = null;
          if (product.barcode && product.barcode.trim()) {
            const barcodeValue = product.barcode.trim();
            console.log(`바코드로 기존 상품 조회 중: "${barcodeValue}"`);
            
            try {
              const { data: existing, error: selectError } = await supabase
                .from('products')
                .select('*')
                .eq('barcode', barcodeValue)
                .maybeSingle();

              if (selectError) {
                console.error(`바코드 조회 오류 (${product.name}):`, selectError);
                // 바코드 조회 실패 시 새 상품으로 처리
                console.log(`바코드 조회 실패, 새 상품으로 처리: ${product.name}`);
              } else if (existing) {
                existingProduct = existing;
                console.log(`기존 상품 발견: ${product.name} (바코드: ${barcodeValue})`);
              } else {
                console.log(`새 상품: ${product.name} (바코드: ${barcodeValue})`);
              }
            } catch (error) {
              console.error(`바코드 조회 중 예외 발생 (${product.name}):`, error);
              // 예외 발생 시 새 상품으로 처리
              console.log(`바코드 조회 예외, 새 상품으로 처리: ${product.name}`);
            }
          } else {
            console.log(`바코드 없음, 새 상품으로 처리: ${product.name}`);
          }

          let insertedProduct;
          if (existingProduct) {
            // 기존 상품 업데이트
            console.log(`기존 상품 업데이트 중: ${product.name}`);
            const { data: updatedProduct, error: updateError } = await supabase
              .from('products')
              .update({
                name: product.name,
                category_id: categoryId,
                brand: product.brand,
                manufacturer: product.manufacturer,
                unit: product.unit,
                barcode: product.barcode,
                base_price: product.base_price,
                cost_price: product.cost_price,
                tax_rate: product.tax_rate,
                description: product.description,
                requires_preparation: product.requires_preparation,
                preparation_time: product.preparation_time,
                is_active: product.is_active,
                image_urls: product.image_urls || [],
                updated_at: new Date().toISOString()
              })
              .eq('id', existingProduct.id)
              .select()
              .single();

            if (updateError) {
              console.error(`상품 업데이트 실패 (${product.name}):`, updateError);
              uploadResults.push({
                row: i + 3,
                productName: product.name,
                status: 'error',
                message: `상품 업데이트 실패: ${updateError.message}`
              });
              continue;
            }

            insertedProduct = updatedProduct;
            console.log(`상품 업데이트 성공: ${product.name}`);
          } else {
            // 새 상품 삽입
            console.log(`새 상품 삽입 중: ${product.name}`);
            const { data: newProduct, error: insertError } = await supabase
              .from('products')
              .insert({
                name: product.name,
                category_id: categoryId,
                brand: product.brand,
                manufacturer: product.manufacturer,
                unit: product.unit,
                barcode: product.barcode,
                base_price: product.base_price,
                cost_price: product.cost_price,
                tax_rate: product.tax_rate,
                description: product.description,
                requires_preparation: product.requires_preparation,
                preparation_time: product.preparation_time,
                is_active: product.is_active,
                image_urls: product.image_urls || []
              })
              .select()
              .single();

            if (insertError) {
              console.error(`상품 삽입 실패 (${product.name}):`, insertError);
              uploadResults.push({
                row: i + 3,
                productName: product.name,
                status: 'error',
                message: `상품 삽입 실패: ${insertError.message}`
              });
              continue;
            }

            insertedProduct = newProduct;
            console.log(`상품 삽입 성공: ${product.name}`, insertedProduct);
          }

          if (insertedProduct) {
            console.log(`상품 처리 완료: ${product.name}`, insertedProduct);

            // store_products 처리
            if (existingProduct) {
              // 기존 상품인 경우: store_products가 이미 존재하는지 확인하고 업데이트
              console.log(`기존 상품의 store_products 확인 중: ${product.name}`);
              
              for (const storeId of storeIds) {
                // 기존 store_products 조회
                const { data: existingStoreProduct, error: selectError } = await supabase
                  .from('store_products')
                  .select('*')
                  .eq('store_id', storeId)
                  .eq('product_id', insertedProduct.id)
                  .single();

                if (selectError && selectError.code !== 'PGRST116') {
                  console.error(`store_products 조회 오류 (${product.name}, 지점: ${storeId}):`, selectError);
                  continue;
                }

                if (existingStoreProduct) {
                  // 기존 store_products 업데이트
                  const { error: updateError } = await supabase
                    .from('store_products')
                    .update({
                      price: product.base_price,
                      is_available: product.is_active,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', existingStoreProduct.id);

                  if (updateError) {
                    console.error(`store_products 업데이트 실패 (${product.name}, 지점: ${storeId}):`, updateError);
                  } else {
                    console.log(`store_products 업데이트 성공 (${product.name}, 지점: ${storeId})`);
                  }
                } else {
                  // 새 store_products 생성
                  const { error: insertError } = await supabase
                    .from('store_products')
                    .insert({
                      store_id: storeId,
                      product_id: insertedProduct.id,
                      price: product.base_price,
                      stock_quantity: 0,
                      safety_stock: 10,
                      max_stock: 100,
                      is_available: product.is_active,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    });

                  if (insertError) {
                    console.error(`store_products 생성 실패 (${product.name}, 지점: ${storeId}):`, insertError);
                  } else {
                    console.log(`store_products 생성 성공 (${product.name}, 지점: ${storeId})`);
                  }
                }
              }

              uploadResults.push({
                row: i + 3,
                productName: product.name,
                status: 'success',
                message: `기존 상품 업데이트 완료 - ${storeIds.length}개 지점 연결됨`
              });
            } else {
              // 새 상품인 경우: 모든 지점에 store_products 생성
              const storeProductInserts = storeIds.map(storeId => ({
                store_id: storeId,
                product_id: insertedProduct.id,
                price: product.base_price,
                stock_quantity: 0,
                safety_stock: 10,
                max_stock: 100,
                is_available: product.is_active,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }));

              console.log(`store_products 생성 시도:`, {
                productName: product.name,
                productId: insertedProduct.id,
                storeIds: storeIds,
                insertData: storeProductInserts
              });

              const { error: storeProductsError } = await supabase
                .from('store_products')
                .insert(storeProductInserts);

              if (storeProductsError) {
                console.error(`store_products 생성 실패 (${product.name}):`, storeProductsError);
                console.error('실패한 데이터:', storeProductInserts);
                uploadResults.push({
                  row: i + 3,
                  productName: product.name,
                  status: 'warning',
                  message: `상품 생성됨, 지점 연결 실패: ${storeProductsError.message}`
                });
              } else {
                console.log(`store_products 생성 성공: ${product.name} - ${storeIds.length}개 지점`);
                console.log('생성된 store_products:', storeProductInserts);
                uploadResults.push({
                  row: i + 3,
                  productName: product.name,
                  status: 'success',
                  message: `${storeIds.length}개 지점에 연결 완료`
                });
              }
            }
          }

        } catch (error) {
          console.error(`상품 처리 중 오류 (${product.name}):`, error);
          uploadResults.push({
            row: i + 3,
            productName: product.name,
            status: 'error',
            message: `처리 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
          });
        }
      }

      setResults(uploadResults);
      
      if (uploadResults.some(result => result.status === 'success')) {
        showSuccess('상품 업로드가 완료되었습니다!');
        // 성공한 상품이 있으면 상품 목록 새로고침
        if (onUploadComplete) {
          onUploadComplete(uploadResults);
        }
      } else {
        showWarning('업로드된 상품이 없습니다. 오류를 확인해주세요.');
      }

    } catch (error) {
      console.error('상품 업로드 중 오류:', error);
      alert(`업로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setUploading(false);
    }
  };

  const getOrCreateCategory = async (categoryName: string): Promise<string> => {
    try {
      console.log(`카테고리 처리 중: "${categoryName}"`);
      
      if (!categoryName || categoryName.trim() === '') {
        throw new Error('카테고리 이름이 비어있습니다.');
      }

      // 기존 카테고리 조회 (정확한 이름 매칭)
      const { data: existingCategory, error: selectError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName.trim())
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116: 결과가 없음
        console.error('카테고리 조회 오류:', selectError);
        throw selectError;
      }

      if (existingCategory) {
        console.log(`기존 카테고리 발견: ${categoryName} -> ${existingCategory.id}`);
        return existingCategory.id;
      }

      // 새 카테고리 생성
      console.log(`새 카테고리 생성 중: ${categoryName}`);
      const { data: newCategory, error: insertError } = await supabase
        .from('categories')
        .insert({
          name: categoryName.trim(),
          slug: categoryName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, ''),
          description: `${categoryName.trim()} 카테고리`,
          display_order: 0,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        console.error('카테고리 생성 오류:', insertError);
        throw insertError;
      }

      console.log(`새 카테고리 생성 완료: ${categoryName} -> ${newCategory.id}`);
      return newCategory.id;
    } catch (error) {
      console.error(`카테고리 처리 오류 (${categoryName}):`, error);
      throw new Error(`카테고리 "${categoryName}" 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewData([]);
    setShowPreview(false);
    setResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setFile(droppedFile);
      parseExcelFile(droppedFile);
    } else {
      alert('엑셀 파일(.xlsx)을 드롭해주세요.');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📤 엑셀 파일 업로드
        </h3>
        <p className="text-sm text-gray-600">
          상품 정보가 담긴 엑셀 파일을 업로드하세요
        </p>
        <p className="text-xs text-amber-600 mt-1">
          ⚠️ 1행(테두리가 있는 행)은 자동으로 제외됩니다
        </p>
        <p className="text-xs text-blue-600 mt-1">
          💡 카테고리는 자동으로 생성되거나 기존 카테고리와 연결됩니다
        </p>
        <button
          onClick={fetchDebugInfo}
          className="mt-2 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
        >
          🔍 데이터베이스 상태 확인
        </button>
      </div>

      {!file ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-lg text-gray-600 mb-2">
            클릭하여 파일 선택 또는 파일을 여기에 드롭
          </p>
          <p className="text-sm text-gray-500">
            .xlsx 파일만 지원됩니다
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {showPreview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">
                  📋 업로드 미리보기 ({previewData.length}개 상품)
                </h4>
                <div className="text-xs text-amber-600">
                  ⚠️ 1행(테두리) 제외됨
                </div>
                <button
                  onClick={() => uploadProducts(previewData)}
                  disabled={uploading || previewData.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? '업로드 중...' : `${previewData.length}개 상품 업로드`}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">행</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이미지</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {index + 2}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {product.base_price.toLocaleString()}원
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {product.image_urls && product.image_urls.length > 0 ? (
                            <span className="text-blue-600">
                              {product.image_urls.length}개
                            </span>
                          ) : (
                            <span className="text-gray-400">없음</span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.is_active ? '활성' : '비활성'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">
                📊 업로드 결과
              </h4>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.status === 'success'
                        ? 'bg-green-50 border-green-200'
                        : result.status === 'warning'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${
                          result.status === 'success' ? 'text-green-800' : 
                          result.status === 'warning' ? 'text-yellow-800' : 'text-red-800'
                        }`}>
                          {result.productName} (행 {result.row})
                        </p>
                        <p className={`text-sm ${
                          result.status === 'success' ? 'text-green-600' : 
                          result.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {result.message}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        result.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : result.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status === 'success' ? '성공' : 
                         result.status === 'warning' ? '경고' : '실패'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 디버깅 정보 표시 */}
          {debugInfo && (
            <div className="space-y-4 mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900">
                🔍 데이터베이스 상태
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">활성 지점</p>
                  <p className="text-blue-600">{debugInfo.stores.length}개</p>
                  {debugInfo.stores.map((store: any) => (
                    <p key={store.id} className="text-xs text-gray-600">
                      {store.name} ({store.id.slice(0, 8)}...)
                    </p>
                  ))}
                </div>
                <div>
                  <p className="font-medium">활성 상품</p>
                  <p className="text-green-600">{debugInfo.products.length}개</p>
                  {debugInfo.products.slice(0, 3).map((product: any) => (
                    <p key={product.id} className="text-xs text-gray-600">
                      {product.name} ({product.id.slice(0, 8)}...)
                    </p>
                  ))}
                </div>
                <div>
                  <p className="font-medium">지점-상품 연결</p>
                  <p className="text-purple-600">{debugInfo.storeProducts.length}개</p>
                  {debugInfo.storeProducts.slice(0, 3).map((sp: any) => (
                    <p key={sp.id} className="text-xs text-gray-600">
                      {sp.store_id.slice(0, 8)}... → {sp.product_id.slice(0, 8)}...
                    </p>
                  ))}
                </div>
              </div>
              {Object.values(debugInfo.errors).some((error: any) => error) && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs text-red-600 font-medium">오류 발생:</p>
                  {Object.entries(debugInfo.errors).map(([key, error]: [string, any]) => 
                    error && (
                      <p key={key} className="text-xs text-red-500">
                        {key}: {error.message}
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExcelUpload;
