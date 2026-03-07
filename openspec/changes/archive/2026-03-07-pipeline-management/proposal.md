## Why

工艺模板系统已支持创建单个 AI 处理单元，但实际场景中用户常需要将多个处理步骤串联执行（如：全文提取 → 摘要 → 翻译）。本功能旨在构建**管道（Pipeline）管理系统**，让用户能够将多个工艺模板组合成处理流程。

## What Changes

- 新增管道（Pipeline）的完整 CRUD 功能
- 新增管道步骤编辑器，支持从模板列表中选择添加步骤
- 新增步骤拖拽排序功能（使用 @dnd-kit）
- 新增管道可视化展示处理流程
- 新增设置页面 `/settings/pipelines` 用于管道管理

## Capabilities

### New Capabilities

- `pipeline`: 管道的创建、编辑、删除、列表展示及步骤编排功能

### Modified Capabilities

- `craft-template`: 无需求变更（管道作为模板的消费者，不修改模板行为）

## Impact

- **数据库**: 新增 `pipelines` 表
- **API**: 新增 `/api/pipelines` 相关端点
- **前端**: 新增 `/settings/pipelines` 页面及组件
- **依赖**: 新增 `@dnd-kit/core` 和 `@dnd-kit/sortable`
