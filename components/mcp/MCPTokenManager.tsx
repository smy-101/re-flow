'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import {
  createMCPToken,
  deleteMCPToken,
  getMCPTokens,
  toggleMCPToken,
  type MCPTokenRecord,
  type MCPTokenWithSecret,
} from '@/lib/api/mcp-tokens';
import { formatTimestamp } from '@/lib/time/timestamp';

interface CreateFormState {
  name: string;
  feedIds: string;
  timeWindowDays: string;
  allowRawFallback: boolean;
}

const INITIAL_FORM: CreateFormState = {
  name: '',
  feedIds: '',
  timeWindowDays: '',
  allowRawFallback: true,
};

function formatScope(token: MCPTokenRecord): string {
  const segments: string[] = [];
  segments.push(
    token.scope.feedIds && token.scope.feedIds.length > 0
      ? `${token.scope.feedIds.length} 个订阅`
      : '全部订阅',
  );
  segments.push(token.scope.timeWindowDays ? `${token.scope.timeWindowDays} 天窗口` : '无时间限制');
  segments.push(token.scope.allowRawFallback ? '允许原文回退' : '仅处理结果');
  return segments.join(' · ');
}

function parseFeedIds(input: string): number[] | null {
  const value = input.trim();
  if (!value) {
    return null;
  }

  return value
    .split(',')
    .map((segment) => Number(segment.trim()))
    .filter((segment) => Number.isInteger(segment) && segment > 0);
}

export default function MCPTokenManager() {
  const [tokens, setTokens] = useState<MCPTokenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<MCPTokenWithSecret | null>(null);
  const [form, setForm] = useState<CreateFormState>(INITIAL_FORM);

  const refreshTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMCPTokens();
      setTokens(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载 MCP token 失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTokens();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const token = await createMCPToken({
        name: form.name,
        feedIds: parseFeedIds(form.feedIds),
        timeWindowDays: form.timeWindowDays ? Number(form.timeWindowDays) : null,
        allowRawFallback: form.allowRawFallback,
      });
      setCreatedToken(token);
      setForm(INITIAL_FORM);
      await refreshTokens();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建 MCP token 失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      setError(null);
      await toggleMCPToken(id);
      await refreshTokens();
    } catch (err) {
      setError(err instanceof Error ? err.message : '切换状态失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await deleteMCPToken(id);
      await refreshTokens();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  return (
    <div className="space-y-8">
      {createdToken && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-semibold">一次性 secret</h2>
              <p>该 secret 只会展示这一次。刷新页面或离开后将无法再次查看。</p>
              <div className="rounded-xl bg-emerald-950/90 px-3 py-3 font-mono text-xs text-emerald-50 break-all">
                {createdToken.secret}
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(createdToken.secret);
              }}
            >
              复制 secret
            </Button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-5 space-y-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">一步式创建</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            为远程 MCP 客户端创建 bearer token，并收紧订阅范围、时间窗口与原文回退权限。
          </p>
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300 md:col-span-2">
            <span className="font-medium">名称</span>
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="例如：Claude Desktop"
              required
            />
          </label>

          <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Feed 白名单</span>
            <input
              value={form.feedIds}
              onChange={(event) => setForm((prev) => ({ ...prev, feedIds: event.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="留空表示全部，例如：1,2,8"
            />
          </label>

          <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">时间窗口（天）</span>
            <input
              type="number"
              min={1}
              value={form.timeWindowDays}
              onChange={(event) => setForm((prev) => ({ ...prev, timeWindowDays: event.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="留空表示不限制"
            />
          </label>

          <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 md:col-span-2">
            <input
              type="checkbox"
              checked={form.allowRawFallback}
              onChange={(event) => setForm((prev) => ({ ...prev, allowRawFallback: event.target.checked }))}
            />
            <span>允许当处理结果缺失时回退原文片段</span>
          </label>

          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit" loading={submitting}>创建 Token</Button>
            <Link href="/settings/mcp/manual-test-cases" className="text-sm text-blue-600 hover:underline">
              查看手工验收用例
            </Link>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Token 列表</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">仅显示元数据，不会回显完整 secret。</p>
          </div>
          <Button type="button" variant="secondary" onClick={refreshTokens}>
            刷新
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-10 text-sm text-gray-500">正在加载 MCP token...</div>
        ) : tokens.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500 dark:border-zinc-700">
            还没有 MCP token。创建后即可在这里管理启用、禁用和删除操作。
          </div>
        ) : (
          <div className="space-y-4">
            {tokens.map((token) => (
              <article key={token.id} className="rounded-2xl border border-gray-200 p-4 dark:border-zinc-700">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{token.name}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${token.isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                        {token.isEnabled ? '已启用' : '已禁用'}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-gray-500">{token.tokenPrefix}...</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatScope(token)}</p>
                    <dl className="grid gap-1 text-xs text-gray-500 dark:text-gray-400 md:grid-cols-3">
                      <div>创建于：{formatTimestamp(token.createdAt) || '未知'}</div>
                      <div>最近使用：{formatTimestamp(token.lastUsedAt) || '尚未使用'}</div>
                      <div>更新时间：{formatTimestamp(token.updatedAt) || '未知'}</div>
                    </dl>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/settings/mcp/${token.id}`}>
                      <Button type="button" variant="secondary">详情</Button>
                    </Link>
                    <Button type="button" variant="secondary" onClick={() => handleToggle(token.id)}>
                      {token.isEnabled ? '禁用' : '启用'}
                    </Button>
                    <Button type="button" variant="danger" onClick={() => handleDelete(token.id)}>
                      删除
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
