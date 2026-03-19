'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import SidebarItem from './SidebarItem';
import ThemeToggle from './ThemeToggle';
import { useMobileDrawer } from '@/hooks/useMobileDrawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { navigationItems, getActiveNavigationItem } from '@/lib/config/navigation';

export default function MobileDrawer() {
  const pathname = usePathname();
  const { isOpen, close } = useMobileDrawer();
  const activeItemId = getActiveNavigationItem(pathname);

  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="left" className="w-[22rem] bg-background text-foreground md:hidden">
        <SheetHeader className="border-b border-border/60 pb-4 pr-10">
          <SheetTitle>导航</SheetTitle>
        </SheetHeader>

        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 py-2">
          <div>
            <p className="text-sm font-medium text-foreground">主题</p>
            <p className="text-xs text-muted-foreground">切换浅色与深色模式</p>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="主要导航">
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.id}
              label={item.label}
              href={item.href}
              icon={item.icon}
              isActive={activeItemId === item.id}
              collapsed={false}
              disabled={item.disabled}
            />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
