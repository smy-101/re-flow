'use client';

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  collapsed: boolean;
  disabled?: boolean;
  count?: number;
}

export default function SidebarItem({
  label,
  href,
  icon: Icon,
  isActive,
  collapsed,
  disabled = false,
  count,
}: SidebarItemProps) {
  const pathname = usePathname();
  const isCurrentPage = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex w-full items-center rounded-lg border border-transparent px-3 py-2.5 transition-colors duration-200',
        disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-secondary/70',
        isActive
          ? 'bg-sidebar-foreground/6 text-foreground'
          : 'text-sidebar-foreground/82'
      )}
      aria-current={isCurrentPage ? 'page' : undefined}
      {...(disabled && { onClick: (e) => e.preventDefault(), tabIndex: -1 })}
    >
      {isActive ? (
        <div className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      ) : null}

      <Icon
        className={cn(
          'shrink-0 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )}
        size={20}
      />

      {!collapsed ? (
        <div className="ml-3 flex min-w-0 flex-1 items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{label}</span>
          {count !== undefined ? <Badge variant={isActive ? 'primary' : 'default'}>{count}</Badge> : null}
        </div>
      ) : null}

      {collapsed && !disabled ? (
        <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          {label}
        </div>
      ) : null}
    </Link>
  );
}
