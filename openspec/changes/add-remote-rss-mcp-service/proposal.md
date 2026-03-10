## Why

### 背景与动机
当前系统已经具备订阅、文章处理与结果存储能力，但这些内容只能在站内页面消费，无法以标准协议提供给外部 AI 客户端。现在需要补上一个面向多用户的远程 MCP 读取入口，让用户能安全地把自己订阅内容的结果流接入 AI 工作流。

### 非目标
首版不包含搜索、写操作、分页游标，也不在此变更中拆分 monorepo 或重构全部 worker。

## What Changes

- 新增独立部署的远程 HTTP/SSE、tools-only MCP 读取服务，面向多用户 bearer token 访问。
- 新增 MCP Token 管理能力：独立设置页面、一步式创建、一次性展示 secret、列表与详情管理、启用/禁用/删除。
- 新增文章组合视图读取能力：按 publishedAt 返回最近文章列表与单篇详情，优先返回最新成功处理结果，必要时回退有限原文并输出结构化状态。
- 抽取 Web 与 MCP 共用的业务内核，用于 caller context、授权上限和文章聚合视图。

## Capabilities

### New Capabilities
- `mcp-token-management`: 管理用户的 MCP client token、访问范围和可见状态。
- `remote-rss-mcp-read`: 通过远程 MCP 工具读取带处理结果回退逻辑的文章组合视图。

### Modified Capabilities
- 无

## Impact

影响 app/(dashboard)/settings 下的新页面与导航、认证与加密相关模块、数据库 schema 与迁移、共享查询/授权服务、独立 MCP 进程及其远程接入配置。
