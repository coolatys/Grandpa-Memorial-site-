'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const NAV_LINKS = [
  { name: 'Home', href: '/#hero' },
  { name: 'Biography', href: '/#biography' },
  { name: 'Timeline', href: '/#timeline' },
  { name: 'Gallery', href: '/#gallery' },
  { name: 'Tribute', href: '/#tribute' },
  { name: 'Family Tree', href: '/family-tree' },
  { name: 'Service', href: '/#service' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-stone-900/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-serif text-white tracking-wider">
              GM
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative py-2 text-sm text-stone-300 hover:text-white transition-colors uppercase tracking-widest"
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
