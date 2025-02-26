import { use } from 'react';
import Link from 'next/link';
import { getTenantById } from '../../../../lib/api/tenant';
import { getCurrentUser } from '../../../../lib/api/auth';
import { formatDate } from '../../../../lib/utils/format';

interface CompanyDashboardProps {
  companyId: string;
}

export default function CompanyDashboard({ companyId }: CompanyDashboardProps) {
  const company = use(getTenantById(companyId));
  const currentUser = use(getCurrentUser());
  
  const isCompanyAdmin = currentUser.isCompanyAdmin;
  
  // 統計データ（実際はAPIから取得）
  const stats = {
    activeRecruitments: 5,
    totalCandidates: 38,
    interviewsThisWeek: 12,
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{company.name} ダッシュボード</h1>
        
        {isCompanyAdmin && (
          <div className="flex space-x-3">
            <Link
              href={`/dashboard/company/${companyId}/settings`}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              会社設定
            </Link>
            <Link
              href={`/dashboard/company/${companyId}/users`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              ユーザー管理
            </Link>
          </div>
        )}
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">公開中の求人</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.activeRecruitments}</p>
          <div className="mt-4">
            <Link
              href={`/dashboard/company/${companyId}/jobs`}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              求人を管理する →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">候補者</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalCandidates}</p>
          <div className="mt-4">
            <Link
              href={`/dashboard/company/${companyId}/candidates`}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              候補者を確認する →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">今週の面接</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.interviewsThisWeek}</p>
          <div className="mt-4">
            <Link
              href={`/dashboard/company/${companyId}/interviews`}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              面接予定を確認する →
            </Link>
          </div>
        </div>
      </div>

      {/* 最近の応募者 */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">最近の応募者</h3>
        </div>
        <div className="p-6">
          {/* サンプルデータ表示 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">応募職種</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">応募日</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* サンプルデータ */}
                {[
                  { id: '1', name: '山田太郎', position: 'フロントエンドエンジニア', date: '2024-03-15', status: 'reviewing' },
                  { id: '2', name: '佐藤花子', position: 'UIデザイナー', date: '2024-03-14', status: 'interviewed' },
                  { id: '3', name: '鈴木一郎', position: 'バックエンドエンジニア', date: '2024-03-13', status: 'new' }
                ].map((candidate) => (
                  <tr key={candidate.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{candidate.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{candidate.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(candidate.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(candidate.status)}`}>
                        {getStatusLabel(candidate.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/dashboard/company/${companyId}/candidates/${candidate.id}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-right">
            <Link
              href={`/dashboard/company/${companyId}/candidates`}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              全ての応募者を見る →
            </Link>
          </div>
        </div>
      </div>

      {/* 企業情報 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">企業情報</h3>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">会社名</dt>
              <dd className="mt-1 text-gray-900">{company.name}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">業種</dt>
              <dd className="mt-1 text-gray-900">{company.industry || '未設定'}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Webサイト</dt>
              <dd className="mt-1">
                {company.website ? (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {company.website}
                  </a>
                ) : (
                  <span className="text-gray-500">未設定</span>
                )}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">従業員数</dt>
              <dd className="mt-1 text-gray-900">{company.employeeCount || '未設定'}</dd>
            </div>
          </dl>
          
          {isCompanyAdmin && (
            <div className="mt-6 text-right">
              <Link
                href={`/dashboard/company/${companyId}/settings`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                企業情報を編集する →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ステータスに応じたラベルを返す
function getStatusLabel(status: string): string {
  switch (status) {
    case 'new': return '新規';
    case 'reviewing': return '書類選考中';
    case 'interviewed': return '面接済み';
    case 'offered': return '内定';
    case 'rejected': return '不採用';
    default: return status;
  }
}

// ステータスに応じた色クラスを返す
function getStatusColor(status: string): string {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'reviewing': return 'bg-yellow-100 text-yellow-800';
    case 'interviewed': return 'bg-purple-100 text-purple-800';
    case 'offered': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
} 