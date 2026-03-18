'use client';

import { LogOut, Monitor, Moon, SunMedium, UserRound } from 'lucide-react';
import { useTheme } from 'next-themes';
import Button from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  onLogout: () => void;
}

export default function UserMenu({ onLogout }: UserMenuProps) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'h-auto gap-2 rounded-xl px-2 py-2',
            'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
            'hover:bg-secondary/60'
          )}
        >
          <div
            className={cn(
              'flex size-9 items-center justify-center rounded-xl',
              'bg-gradient-to-br from-primary via-primary to-primary/90',
              'text-primary-foreground',
              'shadow-md shadow-primary/20',
              'transition-all duration-300',
              'group-hover:shadow-lg group-hover:shadow-primary/25'
            )}
          >
            <UserRound className="size-4" strokeWidth={2} />
          </div>
          <div className="hidden min-w-0 text-left sm:block">
            <div className="truncate text-sm font-medium text-foreground">当前用户</div>
            <div className="truncate text-xs text-muted-foreground">user@example.com</div>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(
          'w-64 rounded-2xl',
          'border border-border/50 bg-popover/95 backdrop-blur-2xl',
          'shadow-[0_8px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]'
        )}
      >
        <DropdownMenuLabel>
          <div className="space-y-1 py-1">
            <div className="text-sm font-semibold text-foreground">当前用户</div>
            <div className="text-xs text-muted-foreground">user@example.com</div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
          主题
        </DropdownMenuLabel>

        <DropdownMenuRadioGroup value={theme ?? 'system'} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <SunMedium className="size-4" strokeWidth={1.75} />
            浅色模式
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="size-4" strokeWidth={1.75} />
            深色模式
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor className="size-4" strokeWidth={1.75} />
            跟随系统
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem destructive onClick={onLogout}>
          <LogOut className="size-4" strokeWidth={1.75} />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
