'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Rss, Search } from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import { useMobileDrawer } from '@/hooks/useMobileDrawer';

export default function DashboardNavbar() {
  const router = useRouter();
  const { open: openDrawer } = useMobileDrawer();

  const handleLogout = () => {
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 md:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
            onClick={openDrawer}
            aria-label="打开导航菜单"
          >
            <Menu className="size-5" />
          </button>

          <Link href="/feeds" className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <Rss className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                ReFlow
              </div>
              <div className="hidden text-base font-semibold text-foreground sm:block">
                阅读工作台
              </div>
            </div>
          </Link>

          <div className="hidden flex-1 lg:flex">
            <div className="relative mx-auto w-full max-w-xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Search className="size-4" />
              </div>
              <input
                type="search"
                placeholder="搜索订阅或文章..."
                className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-muted-foreground shadow-xs outline-none"
                disabled
              />
            </div>
          </div>

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
