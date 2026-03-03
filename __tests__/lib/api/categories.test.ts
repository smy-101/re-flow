import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCategories } from '@/lib/api/categories';

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const DEFAULT_CATEGORIES = ['技术', '设计', '新闻', '博客', '科学', '金融', '娱乐', '体育'];

describe('lib/api/categories', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getCategories', () => {
    it('请求成功时返回服务端分类列表', async () => {
      const serverCategories = ['技术', '科学', '自定义'];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => serverCategories,
      });

      const result = await getCategories();

      expect(mockFetch).toHaveBeenCalledWith('/api/categories');
      expect(result).toEqual(serverCategories);
    });

    it('响应 ok 为 false 时返回默认分类', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Unauthorized' }),
      });

      const result = await getCategories();

      expect(result).toEqual(DEFAULT_CATEGORIES);
    });

    it('网络异常（fetch 抛出）时返回默认分类', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getCategories();

      expect(result).toEqual(DEFAULT_CATEGORIES);
    });

    it('默认分类包含 8 个预定义项', async () => {
      mockFetch.mockRejectedValueOnce(new Error('offline'));

      const result = await getCategories();

      expect(result).toHaveLength(8);
      expect(result).toContain('技术');
      expect(result).toContain('体育');
    });
  });
});
