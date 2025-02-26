'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTenantById, updateTenant, UpdateTenantDto } from '../../../../../lib/api/tenant';
import { Company } from '../../../../../types';

interface EditTenantFormProps {
  id: string;
}

export default function EditTenantForm({ id }: EditTenantFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tenant, setTenant] = useState<Company | null>(null);
  
  const [formData, setFormData] = useState<UpdateTenantDto>({
    name: '',
    description: '',
    industry: '',
    employeeCount: undefined,
    website: '',
  });

  // テナント情報の取得
  useEffect(() => {
    async function fetchTenant() {
      try {
        const data = await getTenantById(id);
        setTenant(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          industry: data.industry || '',
          employeeCount: data.employeeCount,
          website: data.website || '',
        });
      } catch (err) {
        setError('テナント情報の取得に失敗しました');
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    }

    fetchTenant();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'employeeCount') {
      setFormData({
        ...formData,
        employeeCount: value ? parseInt(value, 10) : undefined,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await updateTenant(id, formData);
      setSuccess(true);
      
      // 2秒後に詳細ページにリダイレクト
      setTimeout(() => {
        router.push(`/admin/tenants/${id}`);
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'テナント情報の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div>テナント情報を読み込み中...</div>;
  }

  if (!tenant) {
    return <div className="text-red-600">テナント情報の取得に失敗しました。</div>;
  }

  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-green-800 mb-4">更新完了</h2>
        <p>テナント情報が正常に更新されました。詳細ページにリダイレクトします...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* テナント名 */}
        <div className="col-span-2">
          <label htmlFor="name" className="block mb-1 font-medium">
            テナント名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* 業種 */}
        <div>
          <label htmlFor="industry" className="block mb-1 font-medium">
            業種
          </label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Webサイト */}
        <div>
          <label htmlFor="website" className="block mb-1 font-medium">
            Webサイト
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="https://example.com"
          />
        </div>

        {/* 従業員数 */}
        <div>
          <label htmlFor="employeeCount" className="block mb-1 font-medium">
            従業員数
          </label>
          <input
            type="number"
            id="employeeCount"
            name="employeeCount"
            min="1"
            value={formData.employeeCount || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* テナントID（読み取り専用） */}
        <div>
          <label htmlFor="tenantId" className="block mb-1 font-medium">
            テナントID
          </label>
          <input
            type="text"
            id="tenantId"
            value={tenant.tenantId}
            readOnly
            disabled
            className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-gray-500"
          />
        </div>

        {/* 説明 */}
        <div className="col-span-2">
          <label htmlFor="description" className="block mb-1 font-medium">
            説明
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? '更新中...' : '更新する'}
        </button>
      </div>
    </form>
  );
} 