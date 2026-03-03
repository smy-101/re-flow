import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '@/components/layout/Sidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { vi } from 'vitest';

// Mock the hook
vi.mock('@/hooks/useSidebar');

const mockUseSidebar = useSidebar as ReturnType<typeof vi.mocked<typeof useSidebar>>;

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

describe('Sidebar', () => {
  beforeEach(() => {
    mockUseSidebar.mockReturnValue({
      collapsed: false,
      toggle: vi.fn(),
      expand: vi.fn(),
      collapse: vi.fn(),
    });
  });

  it('渲染所有导航项', () => {
    render(<Sidebar />);

    expect(screen.getByText('我的订阅')).toBeInTheDocument();
    expect(screen.getByText('我的阅读')).toBeInTheDocument();
  });

  it('渲染折叠/展开按钮', () => {
    render(<Sidebar />);

    const toggleButton = screen.getByRole('button', { name: /折叠/ });
    expect(toggleButton).toBeInTheDocument();
  });

  it('点击折叠按钮调用 toggle', async () => {
    const user = userEvent.setup();
    const toggle = vi.fn();
    mockUseSidebar.mockReturnValue({
      collapsed: false,
      toggle,
      expand: vi.fn(),
      collapse: vi.fn(),
    });

    render(<Sidebar />);

    const toggleButton = screen.getByRole('button', { name: /折叠/ });
    await user.click(toggleButton);

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('展开状态显示完整文字标签', () => {
    mockUseSidebar.mockReturnValue({
      collapsed: false,
      toggle: vi.fn(),
      expand: vi.fn(),
      collapse: vi.fn(),
    });

    render(<Sidebar />);

    expect(screen.getByText('我的订阅')).toBeInTheDocument();
    expect(screen.getByText('我的阅读')).toBeInTheDocument();
  });

  it('折叠状态不显示文字标签', () => {
    mockUseSidebar.mockReturnValue({
      collapsed: true,
      toggle: vi.fn(),
      expand: vi.fn(),
      collapse: vi.fn(),
    });

    const { container } = render(<Sidebar />);

    // Check for span elements (text labels), not any element containing the text
    const textLabels = container.querySelectorAll('span');
    expect(textLabels.length).toBe(0);
  });

  it('折叠按钮在展开状态显示正确的标签', () => {
    mockUseSidebar.mockReturnValue({
      collapsed: false,
      toggle: vi.fn(),
      expand: vi.fn(),
      collapse: vi.fn(),
    });

    render(<Sidebar />);

    const toggleButton = screen.getByRole('button', { name: /折叠边栏/ });
    expect(toggleButton).toBeInTheDocument();
  });

  it('折叠按钮在收起状态显示正确的标签', () => {
    mockUseSidebar.mockReturnValue({
      collapsed: true,
      toggle: vi.fn(),
      expand: vi.fn(),
      collapse: vi.fn(),
    });

    render(<Sidebar />);

    const toggleButton = screen.getByRole('button', { name: /展开边栏/ });
    expect(toggleButton).toBeInTheDocument();
  });

  it('侧边栏有正确的 aria-label', () => {
    const { container } = render(<Sidebar />);

    const aside = container.querySelector('aside');
    expect(aside).toHaveAttribute('aria-label', '主导航');
  });

  it('导航区域有正确的 aria-label', () => {
    const { container } = render(<Sidebar />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveAttribute('aria-label', '主要导航');
  });
});
