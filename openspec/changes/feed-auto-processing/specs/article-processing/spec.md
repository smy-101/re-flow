# Article Processing (Delta)

## ADDED Requirements

### Requirement: 队列状态显示

系统 SHALL 在文章详情页显示处理队列的实时状态。

#### Scenario: 显示排队中状态
- **WHEN** 文章在队列中且状态为 `pending`
- **THEN** 系统显示 "⏳ 排队中"
- **AND** 显示队列位置（如"位置: 3"）

#### Scenario: 显示处理中状态
- **WHEN** 文章正在被处理（状态为 `processing`）
- **THEN** 系统显示 "🔄 处理中..."
- **AND** 显示使用的管道或模板名称

#### Scenario: 显示处理完成状态
- **WHEN** 处理完成（状态为 `done`）
- **THEN** 系统显示 "✅ 处理完成"
- **AND** 显示处理时间（如"2分钟前"）

#### Scenario: 显示处理失败状态
- **WHEN** 处理失败（状态为 `error`）
- **THEN** 系统显示 "❌ 处理失败"
- **AND** 显示错误信息
- **AND** 提供"重试"按钮

---

### Requirement: 状态轮询

系统 SHALL 支持前端轮询获取最新队列状态。

#### Scenario: 启动轮询
- **WHEN** 文章详情页加载
- **AND** 文章有 `pending` 或 `processing` 状态的队列任务
- **THEN** 系统每 5 秒请求一次队列状态

#### Scenario: 停止轮询
- **WHEN** 队列状态变为 `done` 或 `error`
- **THEN** 系统停止轮询

#### Scenario: 页面离开时停止
- **WHEN** 用户离开文章详情页
- **THEN** 系统停止轮询

---

### Requirement: 重试失败任务

系统 SHALL 允许用户重试失败的处理任务。

#### Scenario: 手动重试
- **WHEN** 用户点击"重试"按钮
- **THEN** 系统将队列任务状态重置为 `pending`
- **AND** `attempts` 重置为 0
- **AND** 重新加入处理队列

#### Scenario: 重试成功
- **WHEN** 重试后处理成功
- **THEN** 系统更新处理结果
- **AND** 状态显示为"处理完成"
