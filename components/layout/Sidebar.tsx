'use client';

import { usePathname } from 'next/navigation';
import { navigationItems, getActiveNavigationItem } from '@/lib/config/navigation';
import { useSidebar } from '@/hooks/useSidebar';
import SidebarItem from './SidebarItem';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const activeItemId = getActiveNavigationItem(pathname);

  return (
    <aside
      className={`
        hidden md:flex flex-col border-r border-gray-200 dark:border-zinc-700
        bg-white dark:bg-zinc-950
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
      `}
      aria-label="主导航"
    >
      {/* 折叠/展开按钮 */}
      <div className="flex items-center justify-end p-3">
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label={collapsed ? '展开边栏' : '折叠边栏'}
          title={collapsed ? '展开' : '折叠'}
        >
          {collapsed ? (
            <ChevronsRight className="text-gray-500 dark:text-gray-400" size={18} />
          ) : (
            <ChevronsLeft className="text-gray-500 dark:text-gray-400" size={18} />
          )}
        </button>
      </div>

      {/* 导航列表 */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto" aria-label="主要导航">
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.id}
            label={item.label}
            href={item.href}
            icon={item.icon}
            isActive={activeItemId === item.id}
            collapsed={collapsed}
            disabled={item.disabled}
          />
        ))}
      </nav>
    </aside>
  );
}
