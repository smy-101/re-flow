import MCPTokenManager from '@/components/mcp/MCPTokenManager';

export default function MCPSettingsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          MCP Tokens
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          为远程 MCP 客户端创建独立访问令牌，并限制可读取的订阅范围与时间窗口。
        </p>
      </div>

      <MCPTokenManager />
    </div>
  );
}
