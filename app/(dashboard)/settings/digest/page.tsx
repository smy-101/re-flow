'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getDigestConfig,
  updateDigestConfig,
  getCommonTimezones,
  formatNextSendAt,
  formatLastSentAt,
  type DigestConfig,
  type UpdateDigestConfigInput,
} from '@/lib/api/digest-config';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  Mail,
  Clock,
  Globe,
  Filter,
  CheckCircle,
  AlertCircle,
  Pause,
  Loader2,
} from 'lucide-react';

export default function DigestSettingsPage() {
  const [config, setConfig] = useState<DigestConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [customDays, setCustomDays] = useState(3);
  const [sendTime, setSendTime] = useState('08:00');
  const [timezone, setTimezone] = useState('UTC');
  const [markAsRead, setMarkAsRead] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'category' | 'feed'>('all');

  const timezones = getCommonTimezones();

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDigestConfig();
      setConfig(data);
      setEnabled(data.enabled);
      setFrequency(data.frequency);
      setCustomDays(data.customDays ?? 3);
      setSendTime(data.sendTime);
      setTimezone(data.timezone);
      setMarkAsRead(data.markAsRead);
      setFilterType(data.filters[0]?.filterType ?? 'all');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载配置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    if (!enabled && !config?.enabled) {
      return;
    }

    if (enabled && !config?.emailVerified) {
      toast.error('请先验证您的邮箱地址');
      return;
    }

    if (frequency === 'custom' && (customDays < 1 || customDays > 30)) {
      toast.error('自定义天数必须在 1-30 之间');
      return;
    }

    try {
      setSaving(true);
      const input: UpdateDigestConfigInput = {
        enabled,
        frequency,
        customDays: frequency === 'custom' ? customDays : null,
        sendTime,
        timezone,
        markAsRead,
        filters: [{ filterType, filterValue: null }],
      };

      const updated = await updateDigestConfig(input);
      setConfig(updated);
      toast.success(enabled ? '推送设置已保存' : '推送已关闭');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

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

  const canEnable = config?.emailVerified;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Mail className="h-8 w-8" />
          邮件推送设置
        </h1>
        <p className="text-muted-foreground mt-2">
          定时接收订阅更新摘要，不错过任何重要内容
        </p>
      </div>

      {/* Email verification warning */}
      {!config?.emailVerified && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-500">需要验证邮箱</p>
            <p className="text-sm text-muted-foreground mt-1">
              开启邮件推送前，请先验证您的邮箱地址
            </p>
          </div>
        </div>
      )}

      {/* Paused due to failures warning */}
      {config?.pausedDueToFailures && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <Pause className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-500">推送已暂停</p>
            <p className="text-sm text-muted-foreground mt-1">
              由于连续发送失败 3 次，推送已自动暂停。请检查邮箱地址是否正确，然后重新开启推送。
            </p>
          </div>
        </div>
      )}

      {/* Status display */}
      {config?.enabled && !config.pausedDueToFailures && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-green-500">推送已开启</p>
            <div className="text-sm text-muted-foreground mt-1 space-y-1">
              {config.lastSentAt && (
                <p>
                  上次发送：
                  {formatLastSentAt(config.lastSentAt, config.timezone)}
                </p>
              )}
              {config.nextSendAt && (
                <p>
                  下次发送：
                  {formatNextSendAt(config.nextSendAt, config.timezone)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main toggle */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">开启邮件推送</h3>
            <p className="text-sm text-muted-foreground">
              按照设定的时间表接收订阅更新摘要
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={!canEnable || saving}
            onClick={() => setEnabled(!enabled)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${enabled ? 'bg-primary' : 'bg-muted'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                ${enabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Settings form - only show when enabled or enabling */}
      {enabled && (
        <div className="space-y-6">
          {/* Frequency */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              发送频率
            </h3>
            <div className="grid gap-4">
              <Select
                value={frequency}
                onValueChange={(v: string) => setFrequency(v as 'daily' | 'weekly' | 'custom')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">每天</SelectItem>
                  <SelectItem value="weekly">每周</SelectItem>
                  <SelectItem value="custom">自定义天数</SelectItem>
                </SelectContent>
              </Select>

              {frequency === 'custom' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">每</span>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={customDays}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomDays(parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">天</span>
                </div>
              )}
            </div>
          </div>

          {/* Time and timezone */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              发送时间
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  时间
                </label>
                <Input
                  type="time"
                  value={sendTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSendTime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  时区
                </label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Filter settings */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              筛选规则
            </h3>
            <Select
              value={filterType}
              onValueChange={(v: string) => setFilterType(v as 'all' | 'category' | 'feed')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部订阅</SelectItem>
                <SelectItem value="category" disabled>
                  按分类（开发中）
                </SelectItem>
                <SelectItem value="feed" disabled>
                  按订阅源（开发中）
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              目前仅支持推送全部订阅内容，分类和订阅源筛选功能即将推出
            </p>
          </div>

          {/* Mark as read */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">推送后标记已读</h3>
                <p className="text-sm text-muted-foreground">
                  推送的文章将自动标记为已读
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={markAsRead}
                disabled={saving}
                onClick={() => setMarkAsRead(!markAsRead)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${markAsRead ? 'bg-primary' : 'bg-muted'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                    ${markAsRead ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={loadConfig} disabled={saving}>
          重置
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            '保存设置'
          )}
        </Button>
      </div>
    </div>
  );
}
