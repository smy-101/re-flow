'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Alert, { AlertDescription, AlertTitle } from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { createFeed } from '@/lib/api/feeds';
import { validateFeedUrl } from '@/lib/api/validate';
import { getCategories } from '@/lib/api/categories';

interface AddFeedFormProps {
  onSuccess?: () => void;
}

export default function AddFeedForm({ onSuccess }: AddFeedFormProps) {
  const router = useRouter();
  const [feedUrl, setFeedUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [category, setCategory] = useState<string>('');
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    title?: string;
    error?: string;
  } | null>(null);
  const [error, setError] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleValidate = async () => {
    if (!feedUrl.trim()) {
      setError('请输入 RSS Feed URL');
      return;
    }

    setValidating(true);
    setError('');

    try {
      const result = await validateFeedUrl(feedUrl);
      setValidationResult(result);

      if (result.valid && result.title && !customTitle) {
        setCustomTitle(result.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '验证失败');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!feedUrl.trim()) {
      setError('请输入 RSS Feed URL');
      return;
    }

    setSubmitting(true);

    try {
      await createFeed({
        feedUrl,
        title: customTitle || undefined,
        category: category || undefined,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/feeds');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加订阅失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card padding="lg" className="border-border/70 bg-card/95 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">添加订阅</h2>
          <p className="text-sm text-muted-foreground">
            先验证 RSS 地址，再补充标题或分类，减少导入失败和命名不一致。
          </p>
        </div>

        <Input
          label="RSS Feed URL *"
          type="url"
          placeholder="https://example.com/feed.xml"
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
          onBlur={handleValidate}
          error={error}
          required
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleValidate}
            loading={validating}
            disabled={!feedUrl.trim()}
            size="sm"
          >
            验证 URL
          </Button>
        </div>

        {validationResult && (
          <Alert variant={validationResult.valid ? 'success' : 'destructive'}>
            <AlertTitle>{validationResult.valid ? '验证成功' : '验证失败'}</AlertTitle>
            <AlertDescription>
              {validationResult.valid
                ? validationResult.title
                  ? `Feed 有效，检测到标题：${validationResult.title}`
                  : 'Feed 有效，可以继续保存。'
                : validationResult.error || 'Feed 无效'}
            </AlertDescription>
          </Alert>
        )}

        {error && !validationResult ? (
          <Alert variant="destructive">
            <AlertTitle>表单错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Input
          label="自定义名称（可选）"
          type="text"
          placeholder="留空则使用 Feed 默认标题"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            分类（可选）
          </label>
          <Select value={category || '__none__'} onValueChange={(value) => setCategory(value === '__none__' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="未分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">未分类</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button
            type="submit"
            loading={submitting}
            disabled={!validationResult?.valid}
            fullWidth
          >
            添加订阅
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            fullWidth
          >
            取消
          </Button>
        </div>
      </form>
    </Card>
  );
}
