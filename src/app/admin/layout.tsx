'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session && !pathname.includes('/admin/login')) {
        router.push('/admin/login');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && !pathname.includes('/admin/login')) {
        router.push('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  if (loading) return <div className="p-12 text-center text-stone-500">Loading...</div>;

  if (!session && pathname.includes('/admin/login')) {
    return <>{children}</>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-stone-100 flex pt-16">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 p-6 flex flex-col h-[calc(100vh-64px)] sticky top-16">
        <h2 className="text-xl font-serif text-primary mb-8">Admin Panel</h2>
        <nav className="space-y-2 flex-1">
          <Link href="/admin" className="block py-2 px-3 rounded hover:bg-stone-50 text-stone-700">Dashboard</Link>
          <Link href="/admin/memory-wall" className="block py-2 px-3 rounded hover:bg-stone-50 text-stone-700">Moderate Tributes</Link>
          <Link href="/admin/family-tree" className="block py-2 px-3 rounded hover:bg-stone-50 text-stone-700">Moderate Family</Link>
        </nav>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="mt-auto text-left py-2 px-3 rounded text-red-600 hover:bg-red-50"
        >
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
