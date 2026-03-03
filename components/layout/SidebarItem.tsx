'use client';

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

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

  // 确定当前项是否激活
  const isCurrentPage = pathname === href;

  return (
    <Link
      href={href}
      className={`
        relative flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 group
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-zinc-800'}
        ${isActive ? 'bg-gray-100 dark:bg-zinc-800' : ''}
      `}
      aria-current={isCurrentPage ? 'page' : undefined}
      {...(disabled && { onClick: (e) => e.preventDefault(), tabIndex: -1 })}
    >
      {/* 激活状态的左侧彩色边框 */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
      )}

      {/* 图标 */}
      <Icon
        className={`
          flex-shrink-0 transition-colors
          ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}
        `}
        size={20}
      />

      {/* 文字标签（展开状态下显示） */}
      {!collapsed && (
        <span
          className={`
            ml-3 text-sm font-medium truncate transition-colors
            ${isActive ? 'text-gray-900 dark:text-gray-50' : 'text-gray-700 dark:text-gray-300'}
          `}
        >
          {label}
          {count !== undefined && (
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
              ({count})
            </span>
          )}
        </span>
      )}

      {/* 折叠状态下的悬停提示 */}
      {collapsed && !disabled && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </Link>
  );
}
