'use client';

import type { AIConfig, ApiFormat } from '@/lib/api/ai-configs';
import type { ModelParams, PresetProvider } from '@/lib/ai/providers';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { ProviderSelector } from './ProviderSelector';
import { ModelInput } from './ModelInput';
import { ModelParamsSection } from './ModelParamsSection';

interface AIConfigFormProps {
  config?: AIConfig;
  presets: PresetProvider[];
  onSubmit: (data: Partial<AIConfig>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string | null;
  testResult?: { success: boolean; error?: string; latency?: number } | null;
  onTest?: () => void;
  isTesting?: boolean;
}

export function AIConfigForm({
  config,
  presets,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
  testResult,
  onTest,
  isTesting = false,
}: AIConfigFormProps) {
  const isEdit = !!config;

  const [name, setName] = useState(config?.name || '');
  const [providerId, setProviderId] = useState(config?.providerId || 'openai');
  const [baseURL, setBaseURL] = useState(config?.baseURL || '');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(config?.model || '');
  const [systemPrompt, setSystemPrompt] = useState(config?.systemPrompt || '');
  const [modelParams, setModelParams] = useState({});
  const [extraParams, setExtraParams] = useState({});

  const selectedProvider = presets.find((p) => p.id === providerId);
  const apiFormat: ApiFormat = selectedProvider?.apiFormat || 'openai';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    onSubmit({
      name,
      providerType: selectedProvider?.type || 'custom',
      providerId,
      apiFormat,
      baseURL,
      apiKey,
      model,
      systemPrompt: systemPrompt || undefined,
      modelParams,
      extraParams,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          配置名称 *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
          placeholder="我的 GPT-4"
          required
          minLength={3}
          maxLength={50}
        />
      </div>

      <ProviderSelector
        providerId={providerId}
        onChange={(id: string) => {
          setProviderId(id);
          const provider = presets.find((p) => p.id === id);
          if (provider) {
            setBaseURL(provider.defaultBaseURL);
          }
        }}
        presets={presets}
      />

      <div>
        <label htmlFor="baseURL" className="block text-sm font-medium text-gray-700">
          API 地址 *
        </label>
        <input
          id="baseURL"
          type="url"
          value={baseURL}
          onChange={(e) => setBaseURL(e.target.value)}
          className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
          placeholder="https://api.openai.com/v1"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          根据选择自动填充，可修改
        </p>
      </div>

      <div>
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
          API Key *
        </label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
          placeholder="sk-..."
          required
          autoComplete="off"
        />
      </div>

      <ModelInput
        value={model}
        onChange={setModel}
        defaultModels={selectedProvider?.defaultModels}
        placeholder="gpt-4o"
      />

      <div>
        <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700">
          系统提示词
        </label>
        <textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={4}
          className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 resize-y"
          placeholder="你是一个专业的 RSS 摘要助手..."
        />
      </div>

      <ModelParamsSection
        apiFormat={apiFormat}
        params={modelParams}
        extraParams={extraParams}
        onChange={(params: ModelParams | undefined, extra: Record<string, unknown>) => {
          setModelParams(params || {});
          setExtraParams(extra);
        }}
      />

      {testResult && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            testResult.success
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {testResult.success ? (
            <div>
              <div>配置可用</div>
              {testResult.latency && (
                <div className="text-xs text-green-600">
                  响应时间: {testResult.latency}ms
                </div>
              )}
            </div>
          ) : (
            <div>
              <div>配置测试失败</div>
              {testResult.error && (
                <div className="text-xs text-red-600">{testResult.error}</div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {onTest && (
          <Button
            type="button"
            variant="secondary"
            onClick={onTest}
            loading={isTesting}
            disabled={!apiKey || !model}
          >
            🧪 测试
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          取消
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!apiKey || !model}
        >
          {isEdit ? '保存' : '创建'}
        </Button>
      </div>
    </form>
  );
}
