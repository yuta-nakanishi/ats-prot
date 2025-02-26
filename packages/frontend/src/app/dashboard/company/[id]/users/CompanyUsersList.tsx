import { use } from 'react';
import Link from 'next/link';
import { getCompanyUsers } from '../../../../../lib/api/users';
import { formatDate } from '../../../../../lib/utils/format';
import { UserRole } from '../../../../../types';

interface CompanyUsersListProps {
  companyId: string;
}

export default function CompanyUsersList({ companyId }: CompanyUsersListProps) {
  // 実際はAPIから取得するが、現時点ではモックデータを使用
  // const users = use(getCompanyUsers(companyId));
  
  // モックデータ
  const users = [
    {
      id: '1',
      name: '山田部長',
      email: 'yamada@example.com',
      role: UserRole.HIRING_MANAGER,
      jobTitle: '人事部長',
      department: { id: '1', name: '人事部' },
      team: null,
      isActive: true,
      isCompanyAdmin: true,
      lastLoginAt: '2024-03-15T10:30:00Z',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-03-15T10:30:00Z'
    },
    {
      id: '2',
      name: '鈴木リクルーター',
      email: 'suzuki@example.com',
      role: UserRole.RECRUITER,
      jobTitle: '採用担当',
      department: { id: '1', name: '人事部' },
      team: { id: '1', name: '採用チーム' },
      isActive: true,
      isCompanyAdmin: false,
      lastLoginAt: '2024-03-16T09:45:00Z',
      createdAt: '2024-02-10T00:00:00Z',
      updatedAt: '2024-03-16T09:45:00Z'
    },
    {
      id: '3',
      name: '佐藤面接官',
      email: 'sato@example.com',
      role: UserRole.INTERVIEWER,
      jobTitle: 'シニアエンジニア',
      department: { id: '2', name: '開発部' },
      team: null,
      isActive: true,
      isCompanyAdmin: false,
      lastLoginAt: '2024-03-14T15:20:00Z',
      createdAt: '2024-02-15T00:00:00Z',
      updatedAt: '2024-03-14T15:20:00Z'
    }
  ];

  // ロール名の日本語表示用マッピング
  const roleLabels = {
    [UserRole.COMPANY_ADMIN]: '管理者',
    [UserRole.HIRING_MANAGER]: '採用マネージャー',
    [UserRole.RECRUITER]: 'リクルーター',
    [UserRole.INTERVIEWER]: '面接官',
    [UserRole.READONLY]: '閲覧専用'
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">ユーザー一覧</h2>
        <p className="text-gray-600">企業に所属するユーザーを管理します。新しいユーザーを追加したり、権限を変更できます。</p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">ユーザーが登録されていません</p>
          <Link
            href={`/dashboard/company/${companyId}/users/new`}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            最初のユーザーを作成する
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">メールアドレス</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">役職</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">所属</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">権限</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最終ログイン</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.jobTitle || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.department?.name || '-'}
                    {user.team?.name ? ` / ${user.team.name}` : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {roleLabels[user.role] || user.role}
                    </span>
                    {user.isCompanyAdmin && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        管理者
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'アクティブ' : '無効'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/company/${companyId}/users/${user.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 