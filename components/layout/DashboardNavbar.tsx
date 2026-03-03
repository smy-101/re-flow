'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import UserMenu from './UserMenu';
import { useMobileDrawer } from '@/hooks/useMobileDrawer';
import MobileDrawer from './MobileDrawer';

export default function DashboardNavbar() {
  const router = useRouter();
  const { open: openDrawer } = useMobileDrawer();

  const handleLogout = () => {
    // Clear auth cookie
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <>
      <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/feeds" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 5c7.18 0 13 5.82 13 13M6 11c4.97 0 9 4.03 9 9M6 17c1.66 0 3 1.34 3 3"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-50 hidden sm:block">
                RSS Reader
              </span>
            </Link>

            {/* Search (placeholder) */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <input
                  type="search"
                  placeholder="搜索订阅或文章..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-50 placeholder-gray-400"
                  disabled
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <UserMenu onLogout={handleLogout} />
            </div>

            {/* Mobile menu button (hamburger) */}
            <button
              type="button"
              className="md:hidden ml-2 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
              onClick={openDrawer}
              aria-label="打开导航菜单"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileDrawer />
    </>
  );
}
