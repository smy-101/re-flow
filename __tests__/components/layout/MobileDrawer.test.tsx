import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MobileDrawer from '@/components/layout/MobileDrawer';
import { useMobileDrawer } from '@/hooks/useMobileDrawer';
import { vi } from 'vitest';

// Mock the hook
vi.mock('@/hooks/useMobileDrawer', () => ({
  useMobileDrawer: vi.fn(),
}));

const mockUseMobileDrawer = vi.mocked(useMobileDrawer);

// Mock navigation config
vi.mock('@/lib/config/navigation', () => ({
  navigationItems: [
    { id: 'feeds', label: '我的订阅', href: '/feeds', icon: () => null, disabled: false },
    { id: 'items', label: '我的阅读', href: '/items', icon: () => null, disabled: false },
  ],
  getActiveNavigationItem: () => 'feeds',
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/feeds',
}));

describe('MobileDrawer', () => {
  beforeEach(() => {
    mockUseMobileDrawer.mockReturnValue({
      isOpen: false,
      open: vi.fn(),
      close: vi.fn(),
      toggle: vi.fn(),
    });
  });

  it('抽屉打开时渲染遮罩层', () => {
    mockUseMobileDrawer.mockReturnValue({
      isOpen: true,
      open: vi.fn(),
      close: vi.fn(),
      toggle: vi.fn(),
    });

    const { container } = render(<MobileDrawer />);

    const overlay = container.querySelector('.fixed.inset-0');
    expect(overlay).toBeInTheDocument();
  });

  it('抽屉打开时渲染抽屉内容', () => {
    mockUseMobileDrawer.mockReturnValue({
      isOpen: true,
      open: vi.fn(),
      close: vi.fn(),
      toggle: vi.fn(),
    });

    render(<MobileDrawer />);

    expect(screen.getByText('导航')).toBeInTheDocument();
    expect(screen.getByText('我的订阅')).toBeInTheDocument();
    expect(screen.getByText('我的阅读')).toBeInTheDocument();
  });

  it('点击关闭按钮调用 close', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    mockUseMobileDrawer.mockReturnValue({
      isOpen: true,
      open: vi.fn(),
      close,
      toggle: vi.fn(),
    });

    render(<MobileDrawer />);

    const closeButton = screen.getByRole('button', { name: /关闭导航/ });
    await user.click(closeButton);

    // close should be called at least once
    expect(close).toHaveBeenCalled();
  });

  it('点击遮罩层调用 close', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    mockUseMobileDrawer.mockReturnValue({
      isOpen: true,
      open: vi.fn(),
      close,
      toggle: vi.fn(),
    });

    const { container } = render(<MobileDrawer />);

    const overlay = container.querySelector('.fixed.inset-0');
    await user.click(overlay!);

    // close should be called at least once
    expect(close).toHaveBeenCalled();
  });

  it('按 ESC 键调用 close', async () => {
    const close = vi.fn();
    mockUseMobileDrawer.mockReturnValue({
      isOpen: true,
      open: vi.fn(),
      close,
      toggle: vi.fn(),
    });

    render(<MobileDrawer />);

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    await waitFor(() => {
      // close should be called at least once
      expect(close).toHaveBeenCalled();
    });
  });

  it('抽屉有正确的 aria-label', () => {
    mockUseMobileDrawer.mockReturnValue({
      isOpen: true,
      open: vi.fn(),
      close: vi.fn(),
      toggle: vi.fn(),
    });

    const { container } = render(<MobileDrawer />);

    const aside = container.querySelector('aside');
    expect(aside).toHaveAttribute('aria-label', '移动端导航');
  });

  it('导航区域有正确的 aria-label', () => {
    mockUseMobileDrawer.mockReturnValue({
      isOpen: true,
      open: vi.fn(),
      close: vi.fn(),
      toggle: vi.fn(),
    });

    const { container } = render(<MobileDrawer />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveAttribute('aria-label', '主要导航');
  });
});
