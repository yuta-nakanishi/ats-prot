import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CompanyDashboard from './CompanyDashboard';

interface PageProps {
  params: {
    id: string;
  };
}

export default function CompanyDashboardPage({ params }: PageProps) {
  const { id } = params;
  
  if (!id) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <CompanyDashboard companyId={id} />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded mb-6 w-1/3"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-40 bg-gray-200 rounded"></div>
        ))}
      </div>
      
      <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
      <div className="h-64 bg-gray-200 rounded mb-6"></div>
    </div>
  );
} 