'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { navigationItems, getActiveNavigationItem } from '@/lib/config/navigation';
import { useMobileDrawer } from '@/hooks/useMobileDrawer';
import SidebarItem from './SidebarItem';
import { X } from 'lucide-react';

export default function MobileDrawer() {
  const pathname = usePathname();
  const { isOpen, close } = useMobileDrawer();
  const activeItemId = getActiveNavigationItem(pathname);

  // 当路由变化时关闭抽屉
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <>
      {/* 遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* 抽屉 */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-zinc-950
          border-r border-gray-200 dark:border-zinc-700 z-50
          transform transition-transform duration-300 ease-in-out md:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="移动端导航"
      >
        {/* 抽屉头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            导航
          </h2>
          <button
            onClick={close}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="关闭导航"
          >
            <X className="text-gray-500 dark:text-gray-400" size={20} />
          </button>
        </div>

        {/* 导航列表 */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="主要导航">
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.id}
              label={item.label}
              href={item.href}
              icon={item.icon}
              isActive={activeItemId === item.id}
              collapsed={false} // 抽屉中始终展开
              disabled={item.disabled}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
