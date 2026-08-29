'use client';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-serif text-stone-800 mb-6">Welcome back</h1>
      <p className="text-stone-600 mb-8">
        Manage the memorial site content and approve family submissions here.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
          <h3 className="font-medium text-lg mb-2">Tribute Moderation</h3>
          <p className="text-sm text-stone-500 mb-4">Review pending tributes and condolences.</p>
          <a href="/admin/tribute" className="text-primary hover:underline text-sm">Go to Moderation &rarr;</a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
          <h3 className="font-medium text-lg mb-2">Family Tree Submissions</h3>
          <p className="text-sm text-stone-500 mb-4">Approve new relatives adding themselves.</p>
          <a href="/admin/family-tree" className="text-primary hover:underline text-sm">Go to Submissions &rarr;</a>
        </div>
      </div>
    </div>
  );
}
