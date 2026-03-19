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
        'group/item relative flex w-full items-center rounded-xl transition-all duration-300',
        collapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-3',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'hover:bg-card/50 active:scale-[0.98]'
      )}
      aria-current={isCurrentPage ? 'page' : undefined}
      {...(disabled && { onClick: (e) => e.preventDefault(), tabIndex: -1 })}
    >
      {/* Background card for active state */}
      {isActive ? (
        <div
          className={cn(
            'absolute inset-0 rounded-xl transition-all duration-300',
            'bg-gradient-to-r from-primary/8 via-card/80 to-primary/5',
            'backdrop-blur-sm border border-primary/15',
            'shadow-[0_2px_12px_hsl(var(--primary)/0.08),inset_0_1px_0_hsl(var(--card)/0.8)]'
          )}
        />
      ) : null}

      {/* Hover background */}
      {!disabled && !isActive ? (
        <div
          className={cn(
            'absolute inset-0 rounded-xl border border-transparent opacity-0 transition-all duration-300',
            'group-hover/item:opacity-100',
            'group-hover/item:bg-card/40 group-hover/item:border-border/30',
            'group-hover/item:shadow-sm'
          )}
        />
      ) : null}

      {/* Icon container */}
      <div
        className={cn(
          'relative z-10 flex items-center justify-center transition-all duration-300',
          collapsed ? 'h-9 w-9' : 'h-8 w-8',
          isActive
            ? 'text-primary'
            : 'text-muted-foreground group-hover/item:text-foreground'
        )}
      >
        {/* Icon glow for active state */}
        {isActive ? (
          <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md" />
        ) : null}
        <Icon
          size={collapsed ? 20 : 18}
          strokeWidth={isActive ? 2 : 1.75}
          className="relative z-10 transition-all duration-200"
        />
      </div>

      {/* Label and count */}
      {!collapsed ? (
        <div className="relative z-10 ml-3 flex min-w-0 flex-1 items-center justify-between gap-2">
          <span
            className={cn(
              'truncate text-sm font-medium transition-all duration-200',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground group-hover/item:text-foreground'
            )}
          >
            {label}
          </span>
          {count !== undefined ? (
            <Badge
              variant={isActive ? 'primary' : 'default'}
              className={cn(
                'shrink-0 transition-all duration-200',
                isActive
                  ? 'bg-primary/15 text-primary hover:bg-primary/20'
                  : 'bg-card/60 text-muted-foreground'
              )}
            >
              {count}
            </Badge>
          ) : null}
        </div>
      ) : null}

      {/* Collapsed state - floating tooltip */}
      {collapsed && !disabled ? (
        <div
          className={cn(
            'pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap',
            'rounded-lg border border-border/50 bg-card/95 backdrop-blur-md',
            'px-3 py-2 text-sm font-medium text-foreground',
            'opacity-0 shadow-lg shadow-black/5 transition-all duration-200',
            'group-hover/item:ml-4 group-hover/item:opacity-100'
          )}
        >
          {label}
          {/* Tooltip arrow */}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-border/50" />
          <div className="absolute left-0 top-1/2 -translate-x-[2px] -translate-y-1/2 border-4 border-transparent border-r-card/95" />
        </div>
      ) : null}

      {/* Disabled overlay text for collapsed state */}
      {collapsed && disabled ? (
        <div
          className={cn(
            'pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap',
            'rounded-lg border border-border/30 bg-card/90 backdrop-blur-md',
            'px-3 py-2 text-sm text-muted-foreground',
            'opacity-0 transition-all duration-200',
            'group-hover/item:ml-4 group-hover/item:opacity-60'
          )}
        >
          {label}
          <span className="ml-2 text-xs opacity-70">(即将推出)</span>
        </div>
      ) : null}
    </Link>
  );
}
