'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import {
  deleteMCPToken,
  getMCPToken,
  toggleMCPToken,
  type MCPTokenRecord,
} from '@/lib/api/mcp-tokens';
import { formatTimestamp } from '@/lib/time/timestamp';

interface MCPTokenDetailProps {
  tokenId: number;
}

export default function MCPTokenDetail({ tokenId }: MCPTokenDetailProps) {
  const [token, setToken] = useState<MCPTokenRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMCPToken(tokenId);
      setToken(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载详情失败');
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    void loadToken();
  }, [loadToken]);

  if (loading) {
    return <div className="py-10 text-sm text-muted-foreground">正在加载 token 详情...</div>;
  }

  if (error) {
    return <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>;
  }

  if (!token) {
    return <div className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">Token 不存在。</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{token.name}</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">{token.tokenPrefix}...</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={async () => {
            await toggleMCPToken(token.id);
            await loadToken();
          }}>
            {token.isEnabled ? '禁用 Token' : '启用 Token'}
          </Button>
          <Button type="button" variant="danger" onClick={async () => {
            await deleteMCPToken(token.id);
            window.location.href = '/settings/mcp';
          }}>
            删除 Token
          </Button>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <dl className="grid gap-4 text-sm text-foreground md:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">状态</dt>
            <dd className="mt-1 font-medium">{token.isEnabled ? '已启用' : '已禁用'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">最近使用</dt>
            <dd className="mt-1 font-medium">{formatTimestamp(token.lastUsedAt) || '尚未使用'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">创建时间</dt>
            <dd className="mt-1 font-medium">{formatTimestamp(token.createdAt) || '未知'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">更新时间</dt>
            <dd className="mt-1 font-medium">{formatTimestamp(token.updatedAt) || '未知'}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">权限边界</h2>
        <dl className="mt-4 grid gap-4 text-sm text-foreground md:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Feed 白名单</dt>
            <dd className="mt-1 font-medium">
              {token.scope.feedIds && token.scope.feedIds.length > 0
                ? token.scope.feedIds.join(', ')
                : '全部订阅'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">时间窗口</dt>
            <dd className="mt-1 font-medium">
              {token.scope.timeWindowDays ? `${token.scope.timeWindowDays} 天` : '不限制'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">原文回退</dt>
            <dd className="mt-1 font-medium">{token.scope.allowRawFallback ? '允许' : '禁止'}</dd>
          </div>
        </dl>
      </section>

      <Link href="/settings/mcp" className="inline-flex items-center text-sm text-primary hover:underline">
        <ArrowLeft className="mr-1 h-4 w-4" />
        返回 MCP Token 列表
      </Link>
    </div>
  );
}
