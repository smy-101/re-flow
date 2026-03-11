'use client';

import { useState, useEffect } from 'react';
import { AIConfigList } from '@/components/ai/AIConfigList';
import { PRESET_PROVIDERS } from '@/lib/ai/providers';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getAIConfigs, type AIConfig } from '@/lib/api/ai-configs';

export default function AIPage() {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAIConfigs();
      setConfigs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshConfigs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary hover:underline"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">AI 设置</h1>
        <p className="text-muted-foreground">
          管理您的 AI 提供商配置，用于后续的 RSS 内容处理功能
        </p>
      </div>

      <AIConfigList configs={configs} presets={PRESET_PROVIDERS} onRefresh={refreshConfigs} />
    </div>
  );
}
