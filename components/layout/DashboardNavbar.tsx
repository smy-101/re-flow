'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Rss, Search } from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import { useMobileDrawer } from '@/hooks/useMobileDrawer';
import { cn } from '@/lib/utils';

export default function DashboardNavbar() {
  const router = useRouter();
  const { open: openDrawer } = useMobileDrawer();

  const handleLogout = () => {
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <>
      <nav className="group sticky top-0 z-40 h-16">
        {/* Multi-layer background */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/98 to-background/95" />
          <div className="absolute inset-0 backdrop-blur-2xl" />
          {/* Bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center gap-3 px-4 md:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            type="button"
            className={cn(
              'inline-flex rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-2.5 text-muted-foreground',
              'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              'hover:border-border/70 hover:bg-card/80 hover:text-foreground hover:shadow-sm',
              'active:scale-95 md:hidden'
            )}
            onClick={openDrawer}
            aria-label="打开导航菜单"
          >
            <Menu className="size-5" />
          </button>

          {/* Logo */}
          <Link
            href="/feeds"
            className="group/logo flex min-w-0 items-center gap-3 transition-opacity duration-200 hover:opacity-80"
          >
            <div
              className={cn(
                'relative flex size-11 items-center justify-center rounded-2xl',
                'bg-gradient-to-br from-primary via-primary to-primary/90',
                'text-primary-foreground shadow-lg shadow-primary/25',
                'transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                'group-hover/logo:shadow-xl group-hover/logo:shadow-primary/30'
              )}
            >
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent" />
              <Rss className="relative z-10 size-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                ReFlow
              </div>
              <div className="hidden text-base font-semibold text-foreground sm:block">
                阅读工作台
              </div>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden flex-1 lg:flex">
            <div className="relative mx-auto w-full max-w-xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground/60">
                <Search className="size-4" strokeWidth={1.75} />
              </div>
              <div
                className={cn(
                  'relative h-11 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm',
                  'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                  'focus-within:border-border/60 focus-within:bg-card/70 focus-within:shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
                )}
              >
                <input
                  type="search"
                  placeholder="搜索订阅或文章..."
                  className="h-full w-full bg-transparent pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <UserMenu onLogout={handleLogout} />
          </div>
        </div>
      </nav>

      <MobileDrawer />
    </>
  );
}
