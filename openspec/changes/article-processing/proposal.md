## Why

工艺模板和管道系统已就绪，用户可以创建可复用的 AI 处理流程。本功能旨在将处理能力应用到实际场景，让用户能够对 RSS 文章执行处理，查看处理结果，并在原文与处理结果之间灵活切换。

## What Changes

- 新增处理结果（Processing Result）存储功能
- 新增文章处理 API，支持使用单个模板或管道处理文章
- 新增文章详情页处理入口，可选择模板或管道
- 新增原文/处理结果切换视图
- 新增处理历史记录展示

## Capabilities

### New Capabilities

- `article-processing`: 对 RSS 文章应用模板或管道进行处理，存储和展示处理结果

### Modified Capabilities

- 无（文章处理作为新功能，不修改现有行为）

## Impact

- **数据库**: 新增 `processing_results` 表
- **API**: 新增 `/api/process` 和 `/api/processing-results` 端点
- **前端**: 扩展文章详情页，增加处理入口和结果切换
- **依赖**: 复用 Vercel AI SDK（已在 AI 配置功能中引入）
