import { renderHook, act } from '@testing-library/react';
import { useMobileDrawer } from '@/hooks/useMobileDrawer';

describe('useMobileDrawer', () => {
  beforeEach(() => {
    // Reset document body style before each test
    document.body.style.overflow = '';
  });

  it('默认抽屉为关闭状态', () => {
    const { result } = renderHook(() => useMobileDrawer());

    expect(result.current.isOpen).toBe(false);
  });

  it('可以打开抽屉', () => {
    const { result } = renderHook(() => useMobileDrawer());

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('可以关闭抽屉', () => {
    const { result } = renderHook(() => useMobileDrawer());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('可以切换抽屉状态', () => {
    const { result } = renderHook(() => useMobileDrawer());

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('抽屉打开时禁用 body 滚动', () => {
    const { result } = renderHook(() => useMobileDrawer());

    act(() => {
      result.current.open();
    });

    expect(document.body.style.overflow).toBe('hidden');

    act(() => {
      result.current.close();
    });

    expect(document.body.style.overflow).toBe('');
  });

  it('按 ESC 键关闭抽屉', () => {
    const { result } = renderHook(() => useMobileDrawer());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('其他键盘事件不影响抽屉状态', () => {
    const { result } = renderHook(() => useMobileDrawer());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);
    });

    expect(result.current.isOpen).toBe(true);
  });
});
