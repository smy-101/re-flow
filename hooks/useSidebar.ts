import { useState, useEffect, useCallback } from 'react';

const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';

/**
 * 从 LocalStorage 读取状态
 */
function readCollapsedStateFromStorage(): boolean {
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

/**
 * 保存状态到 LocalStorage
 */
function saveCollapsedStateToStorage(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  } catch {
    // 隐私模式下忽略写入错误
  }
}

/**
 * 边栏状态管理 Hook
 * 提供边栏展开/收起状态管理，使用 LocalStorage 持久化
 *
 * 设计说明：
 * - 初始状态始终为 false（展开），避免 SSR hydration mismatch
 * - 在 useEffect 中读取 localStorage 并同步状态
 * - 这确保服务端和客户端初始渲染一致
 */
export function useSidebar() {
  // 初始状态始终为 false（展开），确保 SSR 一致性
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // 在客户端 hydration 后同步 localStorage 状态
  useEffect(() => {
    const storedState = readCollapsedStateFromStorage();
    if (storedState !== collapsed) {
      setCollapsed(storedState);
    }
    setIsHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 切换边栏状态
  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const newState = !prev;
      saveCollapsedStateToStorage(newState);
      return newState;
    });
  }, []);

  // 展开边栏
  const expand = useCallback(() => {
    setCollapsed(() => {
      saveCollapsedStateToStorage(false);
      return false;
    });
  }, []);

  // 收起边栏
  const collapse = useCallback(() => {
    setCollapsed(() => {
      saveCollapsedStateToStorage(true);
      return true;
    });
  }, []);

  return {
    collapsed,
    isHydrated,
    toggle,
    expand,
    collapse,
  };
}
