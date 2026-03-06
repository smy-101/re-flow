## Why

re-flow 已实现 RSS 订阅管理和 AI 配置管理功能，但两者相互独立，用户无法利用 AI 来处理 RSS 文章内容。本功能旨在构建**工艺模板系统**，让用户能够创建可复用的 AI 处理模板，为后续的文章处理功能奠定基础。

## What Changes

- 新增工艺模板（Craft Template）的完整 CRUD 功能
- 新增预设模板库，提供常用模板供用户复制使用
- 新增 Prompt 编辑器，支持变量提示（`{{title}}`、`{{content}}` 等）
- 新增 AI Config 删除保护机制，防止误删有关联模板的配置
- 新增设置页面 `/settings/craft` 用于模板管理

## Capabilities

### New Capabilities

- `craft-template`: 工艺模板的创建、编辑、删除、列表展示及预设模板复制功能

### Modified Capabilities

- `ai-config`: 新增删除保护机制，删除前检查是否存在关联的工艺模板

## Impact

- **数据库**: 新增 `craft_templates` 表
- **API**: 新增 `/api/craft-templates` 相关端点
- **前端**: 新增 `/settings/craft` 页面及组件
- **依赖**: 无新增外部依赖
