import { useState } from 'react';

const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';

// 初始化：从 LocalStorage 读取状态，如果不存在则默认 false（展开状态）
function getInitialCollapsedState(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === 'true';
  } catch {
    // 隐私模式下 LocalStorage 可能不可用，降级使用默认值
    return false;
  }
}

// 保存状态到 LocalStorage
function saveCollapsedState(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  } catch {
    // 隐私模式下忽略写入错误
  }
}

/**
 * 边栏状态管理 Hook
 * 提供边栏展开/收起状态管理，使用 LocalStorage 持久化
 */
export function useSidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(getInitialCollapsedState);

  // 切换边栏状态
  const toggle = () => {
    setCollapsed((prev) => {
      const newState = !prev;
      saveCollapsedState(newState);
      return newState;
    });
  };

  // 展开边栏
  const expand = () => {
    setCollapsed(() => {
      saveCollapsedState(false);
      return false;
    });
  };

  // 收起边栏
  const collapse = () => {
    setCollapsed(() => {
      saveCollapsedState(true);
      return true;
    });
  };

  return {
    collapsed,
    toggle,
    expand,
    collapse,
  };
}
