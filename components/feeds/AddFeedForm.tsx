'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
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
    <Card padding="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div
            className={`p-3 rounded-lg ${
              validationResult.valid
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {validationResult.valid ? (
              <p>✓ Feed 有效，{validationResult.title && `标题: ${validationResult.title}`}</p>
            ) : (
              <p>✗ {validationResult.error || 'Feed 无效'}</p>
            )}
          </div>
        )}

        <Input
          label="自定义名称（可选）"
          type="text"
          placeholder="留空则使用 Feed 默认标题"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            分类（可选）
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">未分类</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
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
