# MCP Token 手工验收用例

## 场景 1：一步式创建并仅展示一次 secret

- Given 用户已登录并进入 `/settings/mcp`
- When 用户填写名称、feed 白名单、时间窗口并提交创建
- Then 页面展示新 token 的元数据和一次性 secret
- And 页面提示用户立即复制保存 secret
- And 用户刷新页面后不再看到完整 secret

## 场景 2：列表展示元数据而不泄露 secret

- Given 用户至少已创建一个 MCP token
- When 用户重新打开 `/settings/mcp`
- Then 列表显示名称、状态、创建时间、最近使用时间和权限摘要
- And 列表不显示完整 secret

## 场景 3：禁用 token 后请求被拒绝

- Given 用户拥有一个启用中的 token
- When 用户在列表或详情页执行禁用操作
- Then 列表状态更新为“已禁用”
- And 使用该 token 的远程 MCP 请求返回拒绝

## 场景 4：重新启用 token

- Given 用户拥有一个已禁用 token
- When 用户执行启用操作
- Then 列表状态更新为“已启用”
- And 合法 bearer token 请求恢复可用

## 场景 5：删除 token

- Given 用户拥有一个 MCP token
- When 用户在详情页或列表页确认删除
- Then 该 token 从列表中移除
- And 详情页不可再访问
- And 旧 token 不能再用于任何远程 MCP 请求
