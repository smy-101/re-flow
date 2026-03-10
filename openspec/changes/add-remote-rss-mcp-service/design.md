## Context

当前已有订阅、文章、处理结果、队列与 worker，但这些能力主要通过站内页面和 REST API 暴露，认证也依赖浏览器 Cookie。新变更需要在不立即拆分 monorepo 的前提下，引入一个独立部署的远程 HTTP/SSE MCP 服务，同时保持多用户隔离、最小权限和后续可拆分性。

涉及文件/模块将覆盖：`app/(dashboard)/settings/mcp/page.tsx`、`app/(dashboard)/settings/mcp/[id]/page.tsx`、`app/api/mcp-tokens/**`、`lib/auth/**`、`lib/db/**`、新的共享业务内核目录、以及独立 MCP 进程入口。设置页的数据获取采用 Server Component 承载页面壳，列表与创建流程使用 Client Component 处理交互。

## Goals / Non-Goals

**Goals:**
- 提供独立子域名部署的远程 HTTP/SSE、tools-only MCP 读取服务。
- 提供 MCP Token 的创建、列表、详情、启用、禁用、删除能力。
- 抽取 Web 与 MCP 共用的 caller context、授权校验和文章组合视图聚合服务。
- 定义文章级组合视图：按 `publishedAt` 排序，首选最新成功处理结果，必要时回退有限原文。

**Non-Goals:**
- 不实现搜索、写操作、分页游标或资源型 MCP 接口。
- 不在首版重构全部 worker 目录结构。
- 不在首版引入 monorepo 或 OAuth 授权流。

## Decisions

1. 采用“准多应用”结构：保留现有 Next.js 仓库，新增独立 MCP 进程入口与共享业务内核，而不是直接把 MCP 塞进 Route Handler。这样可以先跑通流程，同时为后续拆分到独立部署单元保留边界。

2. Token 使用 bearer token + 服务端存储上限配置。创建时仅展示一次 secret，之后只保留元数据与权限详情。相较可回显设计，这更符合多客户端接入下的安全边界。

3. 共享业务内核统一产出 caller context，而不是让 Web Cookie 认证和 MCP token 认证分别散落在路由中。这样 Web API、MCP 服务和后续 worker 复用的都是同一套用户、scope 与文章聚合规则。

4. MCP 返回“文章组合视图”而不是直接暴露处理记录。组合视图锚定文章，包含源 feed、首选处理结果、有限原文回退、处理状态、抽象错误类型、`retryable`、最近一次处理尝试时间。这样更符合 AI 消费模型，也避免一篇文章多条处理记录直接泄露给首版工具层。

5. 首版工具只保留两个读取入口：最近文章组合视图列表、单篇文章组合视图详情。列表默认 20 条，服务端硬上限 50；请求只能在 token 白名单和时间窗口内进一步收缩。

6. 首版新增页面与 API 路径预计为：`/settings/mcp`、`/settings/mcp/[id]`、`/api/mcp-tokens`、`/api/mcp-tokens/[id]`。MCP 服务使用独立进程对外提供 HTTP/SSE 端点，并通过共享业务内核读取文章视图。

## Risks / Trade-offs

- [共享内核抽取范围过大] → 先围绕 caller context、token scope、文章聚合视图收口，避免一次性迁移所有查询逻辑。
- [远程 MCP 与 Web 权限模型不一致] → 统一使用“token 定上限，请求只能收缩”的授权规则，并在内核层集中校验。
- [原文回退暴露过多内容] → 首版只返回按字符数裁剪的有限原文，并允许 token 配置禁止 raw fallback。
- [状态语义复杂导致工具难用] → 固定结构化字段集，优先暴露 `sourceType`、`processingStatus`、`errorType`、`retryable`、`lastAttemptAt`。
- [正式部署前目录边界继续扩散] → 以独立进程入口和共享内核目录为硬边界，后续拆分时直接迁移对应模块。
