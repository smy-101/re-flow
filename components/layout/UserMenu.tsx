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

interface UserMenuProps {
  onLogout: () => void;
}

export default function UserMenu({ onLogout }: UserMenuProps) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" className="h-auto rounded-xl px-2 py-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UserRound className="size-4" />
          </div>
          <div className="hidden min-w-0 text-left sm:block">
            <div className="truncate text-sm font-medium text-foreground">当前用户</div>
            <div className="truncate text-xs text-muted-foreground">user@example.com</div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">当前用户</div>
            <div className="text-xs font-normal text-muted-foreground">user@example.com</div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          主题
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme ?? 'system'} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <SunMedium className="size-4" />
            浅色模式
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="size-4" />
            深色模式
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor className="size-4" />
            跟随系统
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onClick={onLogout}>
          <LogOut className="size-4" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
