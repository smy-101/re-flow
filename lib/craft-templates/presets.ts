import type { CreateCraftTemplateRequest } from '@/lib/api/craft-templates';

export interface PresetTemplate {
  id: string;
  name: string;
  category: 'summarize' | 'translate' | 'filter' | 'analyze' | 'rewrite' | 'custom';
  description: string;
  promptTemplate: string;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'article-summary',
    name: '文章摘要',
    category: 'summarize',
    description: '为文章生成一个简洁的摘要（100字以内）',
    promptTemplate:
      '请为以下文章生成一个简洁的摘要（100字以内）：\n\n标题：{{title}}\n内容：{{content}}\n\n摘要：',
  },
  {
    id: 'translate-to-chinese',
    name: '翻译为中文',
    category: 'translate',
    description: '将文章内容翻译成简体中文',
    promptTemplate:
      '将以下内容翻译成简体中文，保持原文的语气和风格：\n\n{{content}}',
  },
  {
    id: 'translate-title',
    name: '翻译标题',
    category: 'translate',
    description: '将文章标题翻译成简体中文',
    promptTemplate: '将以下标题翻译成简体中文：\n\n{{title}}',
  },
  {
    id: 'extract-keywords',
    name: '关键词提取',
    category: 'analyze',
    description: '从文章中提取5个关键词',
    promptTemplate:
      '从以下文章中提取5个关键词，以JSON数组格式返回：\n\n{{content}}\n\n关键词：',
  },
  {
    id: 'filter-soft-news',
    name: '过滤软文',
    category: 'filter',
    description: '判断文章是否为营销软文',
    promptTemplate:
      '判断以下文章是否值得阅读。如果是有价值的科技资讯，回复"KEEP"；如果是营销软文，回复"SKIP"。\n\n标题：{{title}}\n内容：{{content}}\n\n判断结果：',
  },
  {
    id: 'rewrite-title',
    name: '重写标题',
    category: 'rewrite',
    description: '为文章生成一个更吸引人的标题',
    promptTemplate:
      '请为以下文章生成一个更吸引人的标题（不超过30字）：\n\n原标题：{{title}}\n内容摘要：{{content}}\n\n新标题：',
  },
];

/**
 * Get a preset template by ID
 */
export function getPresetTemplate(id: string): PresetTemplate | undefined {
  return PRESET_TEMPLATES.find((preset) => preset.id === id);
}

/**
 * Get all preset templates
 */
export function getAllPresetTemplates(): PresetTemplate[] {
  return [...PRESET_TEMPLATES];
}

/**
 * Convert a preset template to a create request
 */
export function presetToCreateRequest(
  preset: PresetTemplate,
  aiConfigId: number,
): CreateCraftTemplateRequest {
  return {
    name: preset.name,
    description: preset.description,
    aiConfigId,
    promptTemplate: preset.promptTemplate,
    category: preset.category,
  };
}
