const scenarios = [
  {
    title: '一步式创建并仅展示一次 secret',
    items: [
      'Given 用户已登录并进入 /settings/mcp',
      'When 用户填写名称、feed 白名单、时间窗口并提交创建',
      'Then 页面展示新 token 的元数据和一次性 secret',
      'And 页面提示用户立即复制保存 secret',
      'And 用户刷新页面后不再看到完整 secret',
    ],
  },
  {
    title: '列表展示元数据而不泄露 secret',
    items: [
      'Given 用户至少已创建一个 MCP token',
      'When 用户重新打开 /settings/mcp',
      'Then 列表显示名称、状态、创建时间、最近使用时间和权限摘要',
      'And 列表不显示完整 secret',
    ],
  },
  {
    title: '禁用与重新启用 token',
    items: [
      'Given 用户拥有一个启用中的 token',
      'When 用户执行禁用操作',
      'Then 列表状态更新为已禁用，后续 bearer token 请求被拒绝',
      'When 用户再次执行启用操作',
      'Then 列表状态更新为已启用，合法请求恢复可用',
    ],
  },
  {
    title: '删除 token',
    items: [
      'Given 用户拥有一个 MCP token',
      'When 用户在列表或详情页确认删除',
      'Then 该 token 从列表中移除',
      'And 详情页不可再访问',
      'And 旧 token 不再可用于远程 MCP 请求',
    ],
  },
];

export default function MCPManualTestCasesPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          MCP Token 手工验收用例
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          用于验证创建、列表、启用/禁用和删除流程是否满足 OpenSpec Given/When/Then 验收要求。
        </p>
      </div>

      <div className="space-y-4">
        {scenarios.map((scenario) => (
          <section key={scenario.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {scenario.title}
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {scenario.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
