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
        'group relative hidden shrink-0 overflow-hidden md:flex md:h-full md:flex-col',
        'transition-[width] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
        collapsed ? 'w-[88px]' : 'w-72'
      )}
      aria-label="主导航"
    >
      {/* Decorative background layers */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95" />

        {/* Glass overlay with blur effect */}
        <div className="absolute inset-0 backdrop-blur-xl" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--sidebar-foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--sidebar-foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient glow at top */}
        <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-sidebar-glow/8 blur-3xl" />

        {/* Side accent line */}
        <div className="absolute bottom-0 left-0 top-0 w-px bg-gradient-to-b from-transparent via-sidebar-border/50 to-transparent" />

        {/* Right border */}
        <div className="absolute bottom-0 right-0 top-0 w-px bg-gradient-to-b from-sidebar-border/30 via-sidebar-border/50 to-sidebar-border/30" />
      </div>

      {/* Toggle button header */}
      <div className="relative z-10 flex items-center border-b border-sidebar-border/40 px-4 py-5">
        <div
          className={cn(
            'flex w-full items-center transition-all duration-500',
            collapsed ? 'justify-center' : 'justify-end'
          )}
        >
          <button
            onClick={toggle}
            className={cn(
              'group/toggle relative flex h-10 w-10 items-center justify-center rounded-xl',
              'bg-sidebar-card/60 backdrop-blur-sm',
              'border border-sidebar-border/50',
              'text-sidebar-muted transition-all duration-300',
              'hover:border-sidebar-accent/30 hover:bg-sidebar-card-hover hover:text-sidebar-accent',
              'hover:shadow-[0_0_20px_hsl(var(--sidebar-glow)/0.15)]',
              'active:scale-95'
            )}
            aria-label={collapsed ? '展开边栏' : '折叠边栏'}
            title={collapsed ? '展开' : '折叠'}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-sidebar-glow/10 to-transparent opacity-0 transition-opacity duration-300 group-hover/toggle:opacity-100" />
            {collapsed ? (
              <ChevronsRight size={18} strokeWidth={1.75} className="relative z-10" />
            ) : (
              <ChevronsLeft size={18} strokeWidth={1.75} className="relative z-10" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation section */}
      <nav
        className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4"
        aria-label="主要导航"
      >
        <div className="space-y-1.5">
          {navigationItems.map((item, index) => (
            <div
              key={item.id}
              className="animate-[fadeSlideIn_0.4s_ease-out_forwards] opacity-0"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <SidebarItem
                label={item.label}
                href={item.href}
                icon={item.icon}
                isActive={activeItemId === item.id}
                collapsed={collapsed}
                disabled={item.disabled}
                count={item.id === 'favorites' ? favoriteCount : undefined}
              />
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom decorative element */}
      <div className="relative z-10 border-t border-sidebar-border/30 px-4 py-4">
        <div
          className={cn(
            'mx-auto h-1 rounded-full transition-all duration-500',
            collapsed ? 'w-8' : 'w-24',
            'bg-gradient-to-r from-transparent via-sidebar-accent/20 to-transparent'
          )}
        />
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
}
