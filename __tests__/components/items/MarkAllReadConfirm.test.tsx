import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MarkAllReadConfirm from '@/components/items/MarkAllReadConfirm';

describe('MarkAllReadConfirm', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <MarkAllReadConfirm
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        count={5}
        scope="all"
      />,
    );

    expect(container.querySelector('.fixed')).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <MarkAllReadConfirm
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        count={5}
        scope="all"
      />,
    );

    expect(screen.getByText(/共 5 篇未读文章/)).toBeInTheDocument();
  });

  it('should display correct message for all scope', () => {
    render(
      <MarkAllReadConfirm
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        count={15}
        scope="all"
      />,
    );

    expect(screen.getByText('共 15 篇未读文章将被标记为已读')).toBeInTheDocument();
  });

  it('should display correct message for feed scope with title', () => {
    render(
      <MarkAllReadConfirm
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        count={5}
        scope="feed"
        feedTitle="Tech Blog"
      />,
    );

    expect(screen.getByText('本订阅 "Tech Blog" 共 5 篇未读文章将被标记为已读')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    render(
      <MarkAllReadConfirm
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        count={5}
        scope="all"
      />,
    );

    const confirmButton = screen.getByRole('button', { name: /确认标记为已读/ });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <MarkAllReadConfirm
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        count={5}
        scope="all"
      />,
    );

    const cancelButton = screen.getByRole('button', { name: '取消' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show loading state when isLoading is true', () => {
    render(
      <MarkAllReadConfirm
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        count={5}
        scope="all"
        isLoading={true}
      />,
    );

    expect(screen.getByText('标记中...')).toBeInTheDocument();
  });

  it('should disable buttons when isLoading is true', () => {
    render(
      <MarkAllReadConfirm
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        count={5}
        scope="all"
        isLoading={true}
      />,
    );

    const confirmButton = screen.getByRole('button', { name: /标记中/ });
    const cancelButton = screen.getByRole('button', { name: '取消' });

    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });
});
