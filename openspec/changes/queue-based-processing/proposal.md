## Why

当前点击"处理文章"按钮会直接调用 AI API 并等待响应（30-60 秒），用户必须等待处理完成。系统已存在处理队列和后台 Worker，但仅用于自动处理场景。将手动处理改为入队执行可提升用户体验，避免长时间等待。

## What Changes

- 新增 `POST /api/queue/add` 端点，支持将文章加入处理队列
- 修改 `ProcessDialog` 组件，点击"开始处理"后入队而非直接执行
- 入队成功后显示 Toast 提示并关闭对话框
- 若文章已在队列中（非 done 状态），提示"该文章已在队列中"

## Capabilities

### New Capabilities
- `queue-add-api`: 入队 API 端点，支持将指定文章加入处理队列，支持模板或管道两种处理方式

### Modified Capabilities
- `article-processing`: 文章处理流程从同步直接执行改为异步入队执行

## Impact

**新增文件：**
- `app/api/queue/add/route.ts` - 入队 API 端点

**修改文件：**
- `lib/api/queue.ts` - 新增 `addToQueue()` 客户端函数
- `components/processing/ProcessDialog.tsx` - 改为调用入队 API
- `components/processing/ProcessButton.tsx` - 调整状态管理（入队是瞬时操作）

**依赖现有组件：**
- `lib/processing/queue.ts` - 队列操作函数（已存在）
- `hooks/useQueueStatus.ts` - 队列状态轮询（已存在）
- `ProcessingHistory.tsx` - 队列状态展示（已存在）
