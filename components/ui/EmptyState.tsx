'use client';

import { type LucideIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  size?: 'default' | 'lg';
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = 'default',
  className,
}: EmptyStateProps) {
  const ActionIcon = action?.icon;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'border border-border/50 bg-card/70 backdrop-blur-xl',
        'shadow-md',
        className
      )}
    >
      <div
        className={cn(
          'relative z-10 flex flex-col items-center text-center',
          size === 'lg' ? 'py-20' : 'py-16'
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-2xl',
            'bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40',
            'backdrop-blur-sm border border-border/30',
            size === 'lg' ? 'mb-6 size-20 rounded-3xl' : 'mb-5 size-16 rounded-2xl'
          )}
        >
          <Icon
            className={cn(
              'text-muted-foreground/60',
              size === 'lg' ? 'size-9' : 'size-8'
            )}
            strokeWidth={1.5}
          />
        </div>
        <h3
          className={cn(
            'font-semibold text-foreground',
            size === 'lg' ? 'mb-3 text-xl' : 'mb-2 text-lg'
          )}
        >
          {title}
        </h3>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {action && (
          <div className="mt-6">
            {action.href ? (
              <Link href={action.href}>
                <Button size={size === 'lg' ? 'lg' : 'md'} className="gap-2">
                  {ActionIcon && <ActionIcon className="size-5" strokeWidth={1.75} />}
                  {action.label}
                </Button>
              </Link>
            ) : action.onClick ? (
              <Button onClick={action.onClick} size={size === 'lg' ? 'lg' : 'md'} className="gap-2">
                {ActionIcon && <ActionIcon className="size-5" strokeWidth={1.75} />}
                {action.label}
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
