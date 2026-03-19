import type { SWRConfiguration } from 'swr';

/**
 * SWR 全局配置
 * - dedupingInterval: 5 秒内相同 key 的请求自动去重
 * - revalidateOnFocus: 窗口聚焦时不自动重新验证
 * - revalidateOnReconnect: 网络重连时自动重新验证
 * - errorRetryCount: 最多重试 2 次
 */
export const swrConfig: SWRConfiguration = {
  dedupingInterval: 5000,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  errorRetryCount: 2,
};

/**
 * 默认 fetcher 函数
 */
export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }
  return response.json();
};
