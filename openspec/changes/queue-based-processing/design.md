## Context

当前 `ProcessDialog` 组件直接调用 `POST /api/process`，同步等待 AI 处理完成（30-60 秒）。系统已存在完整的处理队列基础设施：
- `lib/processing/queue.ts` - 队列操作函数（`addToQueue` 等）
- `workers/processing-worker.ts` - 后台 Worker 轮询队列执行任务
- `hooks/useQueueStatus.ts` - 前端轮询队列状态
- `ProcessingHistory.tsx` - 队列状态展示

本次变更将手动处理流程从同步执行改为入队异步执行。

## Goals / Non-Goals

**Goals:**
- 新增 `POST /api/queue/add` API 端点
- 修改 `ProcessDialog` 调用入队 API 而非直接处理 API
- 入队成功后显示 Toast 提示并关闭弹窗
- 处理完成后用户可在处理历史中查看结果

**Non-Goals:**
- 不修改后台 Worker 逻辑（已支持队列消费）
- 不修改队列状态轮询机制（已存在）
- 不添加实时 WebSocket 推送（保持轮询方式）

## Decisions

### 1. API 端点路径
**决定**: `POST /api/queue/add`
**备选**: `POST /api/queue`（RESTful 风格）

选择 `/api/queue/add` 以明确表达"入队"操作语义，与现有 `/api/queue/status`、`/api/queue/retry` 保持一致。

### 2. 重复入队处理
**决定**: 返回已有任务信息，`isNew: false`

`addToQueue()` 已实现去重逻辑（检查非 done/error 状态的现有任务）。前端根据 `isNew` 字段显示不同 Toast 消息。

### 3. Toast 实现方式
**决定**: 复用 FeedCard 中的简单 DOM 实现

项目未引入 Toast 库，FeedCard.tsx 中有现成的 `showToast()` 函数实现。直接复制到 ProcessDialog 中使用，保持一致性。

### 4. 组件状态管理
**决定**: 移除 `isProcessing` 状态，入队操作瞬时完成

入队是瞬时操作（< 1 秒），无需保持 loading 状态。仅保留 `isLoading`（加载模板/管道列表）和 `isSubmitting`（提交入队请求）。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 用户可能不理解处理是异步的 | Toast 明确提示"已加入队列"，处理历史显示队列状态 |
| Worker 未运行时任务不执行 | 队列状态显示"排队中"，用户可感知 |
| 多次快速点击可能创建多个任务 | `addToQueue` 已实现去重，返回已有任务 |

## File Changes

```
新增:
  app/api/queue/add/route.ts     # 入队 API 端点

修改:
  lib/api/queue.ts               # 新增 addToQueue() 客户端函数
  components/processing/ProcessDialog.tsx  # 改为调用入队 API + Toast
  components/processing/ProcessButton.tsx  # 移除 isProcessing 状态
```
