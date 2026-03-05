import { type LucideIcon, Folder, BookOpen, Pin, Settings, ArrowRightLeft } from 'lucide-react';

export type NavigationItemId = 'feeds' | 'items' | 'favorites' | 'ai' | 'relay';

export interface NavigationItem {
  id: NavigationItemId;
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}

// 导航项配置
export const navigationItems: NavigationItem[] = [
  {
    id: 'feeds',
    label: '我的订阅',
    href: '/feeds',
    icon: Folder,
  },
  {
    id: 'items',
    label: '我的阅读',
    href: '/items',
    icon: BookOpen,
  },
  {
    id: 'favorites',
    label: '收藏',
    href: '/favorites',
    icon: Pin,
  },
  {
    id: 'ai',
    label: 'AI 设置',
    href: '/settings/ai',
    icon: Settings,
  },
  {
    id: 'relay',
    label: '中转',
    href: '/relay',
    icon: ArrowRightLeft,
    disabled: true, // 未来功能
  },
];

// 获取当前激活的导航项
export function getActiveNavigationItem(pathname: string): NavigationItemId | null {
  const activeItem = navigationItems.find((item) => pathname === item.href);
  return activeItem?.id || null;
}
