## Context

工艺模板和管道系统已完成，用户可创建可复用的 AI 处理流程。本功能将处理能力应用到实际场景，实现对 RSS 文章的处理。

### 当前架构

- **数据库**: 已有 `craft_templates`、`pipelines` 表
- **API**: `/api/craft-templates`、`/api/pipelines` 提供 CRUD 端点
- **AI 集成**: 已有 AI 配置管理，支持 OpenAI 和 Anthropic 格式

## Goals / Non-Goals

**Goals:**
- 创建 `processing_results` 数据库表
- 实现文章处理 API（单篇）
- 实现处理执行逻辑（模板/管道）
- 在文章详情页添加处理入口
- 实现原文/处理结果切换视图
- 实现处理历史记录展示

**Non-Goals:**
- 不实现批量处理（Feature 4）
- 不实现 Feed 关联管道（Feature 5）
- 不实现自动处理（Phase 3）
- 不实现 Streaming 输出（一次性输出完整结果）

## Decisions

### D1: 数据库设计

**决策**: 创建 `processing_results` 表

```typescript
processingResults = sqliteTable('processing_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  feedItemId: integer('feed_item_id').notNull().references(() => feedItems.id, { onDelete: 'cascade' }),
  pipelineId: integer('pipeline_id').references(() => pipelines.id, { onDelete: 'set null' }),
  templateId: integer('template_id').references(() => craftTemplates.id, { onDelete: 'set null' }),
  output: text('output'),
  stepsOutput: text('steps_output'), // JSON: 管道每步输出
  status: text('status').notNull().default('pending'),
  errorMessage: text('error_message'),
  tokensUsed: integer('tokens_used'),
  createdAt: integer('created_at').notNull(),
  completedAt: integer('completed_at'),
})
```

**理由**:
- 支持 template 或 pipeline 二选一
- `stepsOutput` 记录管道每步输出，便于调试
- `onDelete: 'set null'` 允许删除模板/管道后保留处理记录

### D2: 处理执行流程

**决策**: 同步执行，服务端 API 内控制

```
用户选择文章 + 选择模板/管道
         ↓
    创建 ProcessingResult (status: pending)
         ↓
    执行处理：
    ┌─────────────────────────────────────┐
    │ Step 1: 获取 RSS Item 内容          │
    │ Step 2: 渲染 Prompt 模板            │
    │ Step 3: 调用 AI API (Vercel AI SDK) │
    │ Step 4: 保存输出                    │
    │         如果是管道，传递给下一步     │
    └─────────────────────────────────────┘
         ↓
    更新 ProcessingResult (status: done/error)
```

**理由**:
- 单篇文章处理时间可控（< 30s）
- 无需引入队列系统
- 简化实现复杂度

### D3: 错误处理策略

**决策**: 整体失败

- 管道中任一步骤失败 → 标记整个处理为 `error`
- 记录失败步骤和错误信息
- 用户可查看错误原因并重试

### D4: 组件架构

**页面修改**:
- `app/(dashboard)/items/[id]/page.tsx` - 添加处理入口和结果切换

**组件清单**:
- `ProcessButton` - 处理触发按钮
- `ProcessDialog` - 处理选项弹窗（选择模板/管道）
- `ProcessProgress` - 处理进度显示
- `ResultViewer` - 结果查看器（Tab 切换原文/结果）
- `ProcessingHistory` - 处理历史列表

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| AI API 调用失败 | 记录错误信息，用户可重试 |
| 处理时间过长 | 显示 loading 状态，设置超时 |
| Token 消耗过大 | 记录 tokensUsed，后续可添加限制 |
| Prompt 模板变量缺失 | 渲染前验证变量存在性 |
