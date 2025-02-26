import CreateTenantForm from './CreateTenantForm';

export default function NewTenantPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">新規テナント作成</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <CreateTenantForm />
      </div>
    </div>
  );
} 