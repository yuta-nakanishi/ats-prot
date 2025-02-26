import { Suspense } from 'react';
import Link from 'next/link';
import EditTenantForm from './EditTenantForm';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditTenantPage({ params }: PageProps) {
  const { id } = params;
  
  if (!id) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center">
        <Link href={`/admin/tenants/${id}`} className="text-indigo-600 hover:text-indigo-800 mr-4">
          ← テナント詳細に戻る
        </Link>
        <h1 className="text-3xl font-bold">テナント編集</h1>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <Suspense fallback={<EditFormSkeleton />}>
          <EditTenantForm id={id} />
        </Suspense>
      </div>
    </div>
  );
}

function EditFormSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded mb-4 w-1/2"></div>
      <div className="space-y-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-12 bg-gray-200 rounded w-full"></div>
        ))}
        <div className="h-10 bg-gray-200 rounded w-40 ml-auto"></div>
      </div>
    </div>
  );
} 