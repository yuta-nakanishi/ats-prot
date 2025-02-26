'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTenant, CreateTenantDto, CreateTenantResponse } from '../../../../lib/api/tenant';

export default function CreateTenantForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CreateTenantResponse | null>(null);
  
  const [formData, setFormData] = useState<CreateTenantDto>({
    name: '',
    tenantId: '',
    description: '',
    industry: '',
    employeeCount: undefined,
    website: '',
    adminEmail: '',
  });

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
      const result = await createTenant(formData);
      setSuccess(result);
      
      // 5秒後に一覧ページにリダイレクト
      setTimeout(() => {
        router.push('/admin/tenants');
        router.refresh();
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '新規テナントの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-green-800 mb-4">テナント作成完了</h2>
        <p className="mb-2">テナント「{success.company.name}」が正常に作成されました。</p>
        
        {success.adminUser && (
          <div className="mb-4">
            <p className="font-medium">管理者ユーザー</p>
            <p>メールアドレス: {success.adminUser.email}</p>
            {success.temporaryPassword && (
              <div className="mt-2">
                <p className="font-medium text-red-600">一時パスワード</p>
                <p className="bg-gray-100 p-2 rounded font-mono">{success.temporaryPassword}</p>
                <p className="mt-1 text-sm text-gray-600">
                  この一時パスワードは表示されなくなります。必ずメモしてください。
                </p>
              </div>
            )}
          </div>
        )}
        
        <p className="text-sm text-gray-600 mt-4">5秒後にテナント一覧ページに移動します。</p>
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

        {/* テナントID */}
        <div>
          <label htmlFor="tenantId" className="block mb-1 font-medium">
            テナントID
          </label>
          <input
            type="text"
            id="tenantId"
            name="tenantId"
            value={formData.tenantId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="未入力の場合は自動生成されます"
          />
          <p className="text-sm text-gray-500 mt-1">
            半角英数字とハイフンのみ使用可能です。空白の場合は自動生成されます。
          </p>
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

        {/* 管理者メールアドレス */}
        <div className="col-span-2">
          <label htmlFor="adminEmail" className="block mb-1 font-medium">
            管理者メールアドレス
          </label>
          <input
            type="email"
            id="adminEmail"
            name="adminEmail"
            value={formData.adminEmail}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="admin@example.com"
          />
          <p className="text-sm text-gray-500 mt-1">
            指定すると、このメールアドレスで管理者アカウントが自動作成されます。
          </p>
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
          {isLoading ? '作成中...' : 'テナントを作成'}
        </button>
      </div>
    </form>
  );
} 