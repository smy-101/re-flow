import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCraftTemplates,
  getCraftTemplate,
  createCraftTemplate,
  updateCraftTemplate,
  deleteCraftTemplate,
  CraftTemplate,
  CreateCraftTemplateRequest,
  UpdateCraftTemplateRequest,
} from '@/lib/api/craft-templates';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('lib/api/craft-templates', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getCraftTemplates', () => {
    it('should return templates array on successful fetch', async () => {
      const mockTemplates: CraftTemplate[] = [
        {
          id: 1,
          userId: 1,
          name: 'Summary Template',
          description: 'Summarize articles',
          aiConfigId: 1,
          aiConfigName: 'OpenAI GPT-4',
          promptTemplate: 'Summarize: {{content}}',
          category: 'summarize',
          createdAt: 1640995200,
          updatedAt: 1640995200,
        },
        {
          id: 2,
          userId: 1,
          name: 'Translation Template',
          description: 'Translate to English',
          aiConfigId: 1,
          aiConfigName: 'OpenAI GPT-4',
          promptTemplate: 'Translate: {{content}}',
          category: 'translate',
          createdAt: 1640995300,
          updatedAt: 1640995300,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ templates: mockTemplates }),
      });

      const result = await getCraftTemplates();

      expect(mockFetch).toHaveBeenCalledWith('/api/craft-templates', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result).toEqual(mockTemplates);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(getCraftTemplates()).rejects.toThrow('Unauthorized');
    });

    it('should throw default error when error property is not present', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(getCraftTemplates()).rejects.toThrow('Request failed');
    });
  });

  describe('getCraftTemplate', () => {
    it('should return template on successful fetch', async () => {
      const mockTemplate: CraftTemplate = {
        id: 1,
        userId: 1,
        name: 'Summary Template',
        description: 'Summarize articles',
        aiConfigId: 1,
        aiConfigName: 'OpenAI GPT-4',
        promptTemplate: 'Summarize: {{content}}',
        category: 'summarize',
        createdAt: 1640995200,
        updatedAt: 1640995200,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemplate,
      });

      const result = await getCraftTemplate(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/craft-templates/1', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result).toEqual(mockTemplate);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not found' }),
      });

      await expect(getCraftTemplate(999)).rejects.toThrow('Not found');
    });
  });

  describe('createCraftTemplate', () => {
    it('should create template and return result', async () => {
      const newTemplate: CraftTemplate = {
        id: 3,
        userId: 1,
        name: 'Filter Template',
        description: 'Filter articles',
        aiConfigId: 1,
        aiConfigName: 'OpenAI GPT-4',
        promptTemplate: 'Filter: {{content}}',
        category: 'filter',
        createdAt: 1640995400,
        updatedAt: 1640995400,
      };

      const input: CreateCraftTemplateRequest = {
        name: 'Filter Template',
        description: 'Filter articles',
        aiConfigId: 1,
        promptTemplate: 'Filter: {{content}}',
        category: 'filter',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newTemplate,
      });

      const result = await createCraftTemplate(input);

      expect(mockFetch).toHaveBeenCalledWith('/api/craft-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(input),
      });
      expect(result).toEqual(newTemplate);
    });

    it('should create template with default category', async () => {
      const newTemplate: CraftTemplate = {
        id: 3,
        userId: 1,
        name: 'Custom Template',
        description: null,
        aiConfigId: 1,
        aiConfigName: 'OpenAI GPT-4',
        promptTemplate: 'Custom: {{content}}',
        category: 'custom',
        createdAt: 1640995400,
        updatedAt: 1640995400,
      };

      const input: CreateCraftTemplateRequest = {
        name: 'Custom Template',
        aiConfigId: 1,
        promptTemplate: 'Custom: {{content}}',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newTemplate,
      });

      const result = await createCraftTemplate(input);

      expect(result).toEqual(newTemplate);
    });

    it('should throw error on failed creation', async () => {
      const input: CreateCraftTemplateRequest = {
        name: 'ab', // Too short, validation should fail
        aiConfigId: 1,
        promptTemplate: 'Test',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '模板名称长度必须为 3-50 字符' }),
      });

      await expect(createCraftTemplate(input)).rejects.toThrow('模板名称长度必须为 3-50 字符');
    });
  });

  describe('updateCraftTemplate', () => {
    it('should update template and return result', async () => {
      const updatedTemplate: CraftTemplate = {
        id: 1,
        userId: 1,
        name: 'Updated Summary Template',
        description: 'Summarize articles (updated)',
        aiConfigId: 1,
        aiConfigName: 'OpenAI GPT-4',
        promptTemplate: 'Summarize: {{content}}',
        category: 'summarize',
        createdAt: 1640995200,
        updatedAt: 1640995500,
      };

      const input: UpdateCraftTemplateRequest = {
        name: 'Updated Summary Template',
        description: 'Summarize articles (updated)',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTemplate,
      });

      const result = await updateCraftTemplate(1, input);

      expect(mockFetch).toHaveBeenCalledWith('/api/craft-templates/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(input),
      });
      expect(result).toEqual(updatedTemplate);
    });

    it('should update template partially', async () => {
      const updatedTemplate: CraftTemplate = {
        id: 1,
        userId: 1,
        name: 'Summary Template',
        description: 'Summarize articles',
        aiConfigId: 1,
        aiConfigName: 'OpenAI GPT-4',
        promptTemplate: 'New summary: {{content}}',
        category: 'summarize',
        createdAt: 1640995200,
        updatedAt: 1640995500,
      };

      const input: UpdateCraftTemplateRequest = {
        promptTemplate: 'New summary: {{content}}',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTemplate,
      });

      const result = await updateCraftTemplate(1, input);

      expect(result).toEqual(updatedTemplate);
      expect(result.promptTemplate).toBe('New summary: {{content}}');
    });

    it('should throw error on failed update', async () => {
      const input: UpdateCraftTemplateRequest = {
        name: 'Updated Name',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not found' }),
      });

      await expect(updateCraftTemplate(999, input)).rejects.toThrow('Not found');
    });
  });

  describe('deleteCraftTemplate', () => {
    it('should delete template successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => undefined,
      });

      await expect(deleteCraftTemplate(1)).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledWith('/api/craft-templates/1', {
        method: 'DELETE',
        credentials: 'include',
      });
    });

    it('should throw error on failed deletion', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not found' }),
      });

      await expect(deleteCraftTemplate(999)).rejects.toThrow('Not found');
    });
  });
});
