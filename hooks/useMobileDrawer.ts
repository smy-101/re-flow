import { useState, useEffect } from 'react';

/**
 * 移动端抽屉状态管理 Hook
 * 提供抽屉的打开/关闭状态管理
 */
export function useMobileDrawer() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // 打开抽屉
  const open = () => setIsOpen(true);

  // 关闭抽屉
  const close = () => setIsOpen(false);

  // 切换抽屉状态
  const toggle = () => setIsOpen((prev) => !prev);

  // 抽屉打开时，点击 ESC 键关闭抽屉
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // 抽屉打开时，禁用 body 滚动
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
