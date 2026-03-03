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

  it('从 LocalStorage 读取持久化状态', () => {
    localStorage.setItem('sidebar-collapsed', 'true');

    const { result } = renderHook(() => useSidebar());

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
});
