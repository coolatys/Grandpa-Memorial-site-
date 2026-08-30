'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const NavLinks = () => (
    <>
      <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 md:py-2 px-4 md:px-3 rounded-lg hover:bg-stone-100 text-stone-700 font-medium">Dashboard</Link>
      <Link href="/admin/tributes" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 md:py-2 px-4 md:px-3 rounded-lg hover:bg-stone-100 text-stone-700 font-medium">Manage Tributes</Link>
      <Link href="/admin/memories" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 md:py-2 px-4 md:px-3 rounded-lg hover:bg-stone-100 text-stone-700 font-medium">Moderate Memories</Link>
      <Link href="/admin/family-tree" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 md:py-2 px-4 md:px-3 rounded-lg hover:bg-stone-100 text-stone-700 font-medium">Moderate Family</Link>
    </>
  );

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-stone-200 p-4 flex justify-between items-center sticky top-0 z-40">
        <Link href="/" className="text-xl font-serif text-primary">GM Admin</Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white shadow-2xl z-50 flex flex-col p-6 md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif text-primary">Admin Panel</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-stone-500 hover:bg-stone-100 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="space-y-2 flex-1">
                <NavLinks />
              </nav>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="mt-auto w-full text-left py-3 px-4 rounded-lg text-red-600 font-medium hover:bg-red-50"
              >
                Sign Out
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-stone-200 p-6 flex-col min-h-screen sticky top-0">
        <div className="mb-8">
          <Link href="/" className="text-2xl font-serif text-primary hover:opacity-80 transition-opacity">GM Admin</Link>
        </div>
        <nav className="space-y-2 flex-1">
          <NavLinks />
        </nav>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="mt-auto text-left py-2 px-3 rounded-lg text-red-600 font-medium hover:bg-red-50 transition-colors"
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
