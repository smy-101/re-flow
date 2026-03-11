'use client';

import type { AIConfig, ApiFormat } from '@/lib/api/ai-configs';
import type { ModelParams, PresetProvider } from '@/lib/ai/providers';
import { useState } from 'react';
import Alert, { AlertDescription, AlertTitle } from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
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
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-5">
      <div className="space-y-5">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>{isEdit ? '保存失败' : '创建失败'}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card padding="lg" className="border-border/70 bg-card/95">
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">连接信息</h2>
              <p className="text-sm text-muted-foreground">
                统一管理供应商、API 地址和凭证，后续 Craft 模板与处理流程都会复用这里的配置。
              </p>
            </div>

            <Input
              id="name"
              type="text"
              label="配置名称 *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="我的 GPT-4"
              required
              minLength={3}
              maxLength={50}
            />

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

            <Input
              id="baseURL"
              type="url"
              label="API 地址 *"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="https://api.openai.com/v1"
              helperText="根据供应商自动填充，但仍可手动修改。"
              required
            />

            <Input
              id="apiKey"
              type="password"
              label="API Key *"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              required
              autoComplete="off"
            />
          </div>
        </Card>

        <Card padding="lg" className="border-border/70 bg-card/95">
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">模型与提示词</h2>
              <p className="text-sm text-muted-foreground">
                统一模型名称、系统提示词与参数配置，确保测试与正式调用使用一致的输入结构。
              </p>
            </div>

            <ModelInput
              value={model}
              onChange={setModel}
              defaultModels={selectedProvider?.defaultModels}
              placeholder="gpt-4o"
            />

            <Textarea
              id="systemPrompt"
              label="系统提示词"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={5}
              placeholder="你是一个专业的 RSS 摘要助手..."
            />

            <ModelParamsSection
              apiFormat={apiFormat}
              params={modelParams}
              extraParams={extraParams}
              onChange={(params: ModelParams | undefined, extra: Record<string, unknown>) => {
                setModelParams(params || {});
                setExtraParams(extra);
              }}
            />
          </div>
        </Card>

        {testResult ? (
          <Alert variant={testResult.success ? 'success' : 'destructive'}>
            <AlertTitle>{testResult.success ? '连接测试成功' : '连接测试失败'}</AlertTitle>
            <AlertDescription>
              {testResult.success
                ? testResult.latency
                  ? `配置可用，响应时间 ${testResult.latency}ms。`
                  : '配置可用。'
                : testResult.error || '请检查地址、模型和密钥是否正确。'}
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="sticky bottom-0 mt-auto -mx-1 border-t border-border/70 bg-popover/95 px-1 pt-4 backdrop-blur supports-[backdrop-filter]:bg-popover/85">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {onTest && (
          <Button
            type="button"
            variant="secondary"
            onClick={onTest}
            loading={isTesting}
            disabled={!apiKey || !model}
          >
            测试连接
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
      </div>
    </form>
  );
}
