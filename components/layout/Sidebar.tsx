'use client';

import { usePathname } from 'next/navigation';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import SidebarItem from './SidebarItem';
import { useSidebar } from '@/hooks/useSidebar';
import { useFavoriteCount } from '@/lib/context/FavoriteContext';
import { navigationItems, getActiveNavigationItem } from '@/lib/config/navigation';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const activeItemId = getActiveNavigationItem(pathname);
  const { count: favoriteCount } = useFavoriteCount();

  return (
    <aside
      className={cn(
        'hidden shrink-0 overflow-hidden border-r border-border/70 bg-sidebar/95 text-sidebar-foreground md:flex md:h-full md:flex-col',
        'transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-72'
      )}
      aria-label="主导航"
    >
      <div className="flex items-center justify-end border-b border-border/60 px-4 py-4">
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={collapsed ? '展开边栏' : '折叠边栏'}
          title={collapsed ? '展开' : '折叠'}
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-4" aria-label="主要导航">
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.id}
            label={item.label}
            href={item.href}
            icon={item.icon}
            isActive={activeItemId === item.id}
            collapsed={collapsed}
            disabled={item.disabled}
            count={item.id === 'favorites' ? favoriteCount : undefined}
          />
        ))}
      </nav>
    </aside>
  );
}
