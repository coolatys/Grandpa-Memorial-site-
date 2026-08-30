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
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row pt-16">
      {/* Sidebar / Topbar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-stone-200 p-4 md:p-6 flex md:flex-col md:h-[calc(100vh-64px)] sticky top-16 z-40 overflow-x-auto shadow-sm md:shadow-none">
        <h2 className="hidden md:block text-xl font-serif text-primary mb-8">Admin Panel</h2>
        <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 flex-1 min-w-max">
          <Link href="/admin" className="block py-2 px-3 rounded hover:bg-stone-50 text-stone-700 whitespace-nowrap">Dashboard</Link>
          <Link href="/admin/tributes" className="block py-2 px-3 rounded hover:bg-stone-50 text-stone-700 whitespace-nowrap">Tributes</Link>
          <Link href="/admin/memories" className="block py-2 px-3 rounded hover:bg-stone-50 text-stone-700 whitespace-nowrap">Memories</Link>
          <Link href="/admin/family-tree" className="block py-2 px-3 rounded hover:bg-stone-50 text-stone-700 whitespace-nowrap">Family</Link>
          
          <button 
            onClick={() => supabase.auth.signOut()}
            className="md:hidden py-2 px-3 rounded text-red-600 hover:bg-red-50 whitespace-nowrap ml-4 border border-red-100"
          >
            Sign Out
          </button>
        </nav>
        
        <button 
          onClick={() => supabase.auth.signOut()}
          className="hidden md:block mt-auto text-left py-2 px-3 rounded text-red-600 hover:bg-red-50"
        >
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
