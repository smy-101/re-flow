## Why

## 背景与动机

AI 配置、管道、工艺模板页面的创建时间显示为 58149 年，根因是同一批时间字段在数据库、API 写入和前端渲染之间混用了秒级与毫秒级时间戳。该问题已影响设置页可用性，且会持续写入错误数据，需要尽快统一时间语义。

## What Changes

- 统一 AI 配置、工艺模板、管道相关时间字段的持久化单位为 Unix 秒级时间戳。
- 修正相关 API 在创建、更新、测试状态更新时写入毫秒值的行为。
- 补充存量数据修复方案，纠正已写入数据库的毫秒级脏数据。
- 统一页面时间展示约定，避免相同字段在不同组件中按不同单位渲染。

## Capabilities

### New Capabilities

- 无

### Modified Capabilities

- `ai-config`: 调整时间字段的写入与展示要求，确保配置创建时间、更新时间和错误时间按秒级一致处理。
- `craft-template`: 调整模板时间字段的写入与展示要求，确保创建与更新时间可被正确渲染。
- `pipeline`: 调整管道时间字段的写入与展示要求，确保创建与更新时间保持统一语义。

## Impact

影响 app/api/ai-configs、app/api/craft-templates、app/api/pipelines 下的路由，影响 components/ai、components/craft、components/pipeline 的时间显示逻辑，并需要一次数据库数据修复与对应测试补充。

## Non-goals

- 不重构与本次问题无关的日期格式样式。
- 不修改 RSS、队列等未确认受影响模块的业务行为，仅在必要时补齐统一时间工具或约束。
