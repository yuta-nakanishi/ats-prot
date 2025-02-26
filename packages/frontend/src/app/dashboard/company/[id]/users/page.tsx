import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CompanyUsersList from './CompanyUsersList';

interface PageProps {
  params: {
    id: string;
  };
}

export default function CompanyUsersPage({ params }: PageProps) {
  const { id } = params;
  
  if (!id) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link 
            href={`/dashboard/company/${id}`} 
            className="text-indigo-600 hover:text-indigo-800 mr-4"
          >
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-3xl font-bold">ユーザー管理</h1>
        </div>
        
        <Link
          href={`/dashboard/company/${id}/users/new`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          新規ユーザー作成
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <Suspense fallback={<UsersListSkeleton />}>
          <CompanyUsersList companyId={id} />
        </Suspense>
      </div>
    </div>
  );
}

function UsersListSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded mb-4"></div>
      {[...Array(5)].map((_, index) => (
        <div key={index} className="mb-4">
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
} 