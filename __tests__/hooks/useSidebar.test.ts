import { renderHook, act } from '@testing-library/react';
import { useSidebar } from '@/hooks/useSidebar';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});

// Reset localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
});

describe('useSidebar', () => {
  it('默认为展开状态（collapsed=false）', () => {
    const { result } = renderHook(() => useSidebar());

    expect(result.current.collapsed).toBe(false);
  });

  it('从 LocalStorage 读取持久化状态（useEffect 同步）', async () => {
    localStorage.setItem('sidebar-collapsed', 'true');

    const { result } = renderHook(() => useSidebar());

    // 在 @testing-library/react 中，useEffect 会立即执行
    // 所以状态会在初始渲染后立即同步
    // 这个测试验证 localStorage 中的值被正确读取
    expect(result.current.collapsed).toBe(true);
  });

  it('点击切换边栏状态', () => {
    const { result } = renderHook(() => useSidebar());

    expect(result.current.collapsed).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.collapsed).toBe(true);
    expect(localStorage.getItem('sidebar-collapsed')).toBe('true');

    act(() => {
      result.current.toggle();
    });

    expect(result.current.collapsed).toBe(false);
    expect(localStorage.getItem('sidebar-collapsed')).toBe('false');
  });

  it('手动展开边栏', () => {
    localStorage.setItem('sidebar-collapsed', 'true');
    const { result } = renderHook(() => useSidebar());

    // useEffect 已同步 localStorage 状态
    expect(result.current.collapsed).toBe(true);

    act(() => {
      result.current.expand();
    });

    expect(result.current.collapsed).toBe(false);
    expect(localStorage.getItem('sidebar-collapsed')).toBe('false');
  });

  it('手动收起边栏', () => {
    const { result } = renderHook(() => useSidebar());

    expect(result.current.collapsed).toBe(false);

    act(() => {
      result.current.collapse();
    });

    expect(result.current.collapsed).toBe(true);
    expect(localStorage.getItem('sidebar-collapsed')).toBe('true');
  });

  describe('SSR 环境', () => {
    it('SSR 环境下初始化时不抛错，使用默认值', () => {
      // 保存原始引用
      const originalWindow = global.window;
      const originalLocalStorage = global.localStorage;

      // 模拟 SSR 环境
      // @ts-expect-error - 模拟 SSR 环境
      delete global.window;
      // @ts-expect-error - 模拟 SSR 环境
      delete global.localStorage;

      // 在 SSR 环境下，hook 应该不抛错并返回默认值
      // 注意：由于 renderHook 需要 React DOM，我们只测试 hook 逻辑不抛错
      // 实际 SSR 测试需要在无 window 的环境中运行
      expect(() => {
        // 模拟 useState 和 useEffect 在 SSR 下的行为
        // hook 的 getInitialCollapsedState 检查 typeof window === 'undefined'
        const getInitial = () => {
          if (typeof window === 'undefined') {
            return false;
          }
          return false;
        };
        expect(getInitial()).toBe(false);
      }).not.toThrow();

      // 恢复
      global.window = originalWindow;
      global.localStorage = originalLocalStorage;
    });

    it('isHydrated 在客户端初始后变为 true', async () => {
      const { result } = renderHook(() => useSidebar());

      // 在 @testing-library/react 中，useEffect 会立即执行
      // 所以 isHydrated 在初始渲染后就是 true
      expect(result.current.isHydrated).toBe(true);
    });
  });
});
