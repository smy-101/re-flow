# Purpose

Enable users to process RSS articles using craft templates or pipelines, store processing results, and switch between original content and processed output.

## Requirements

### Requirement: 处理文章

系统 SHALL 允许已登录用户对 RSS 文章应用模板或管道进行处理，处理通过入队方式异步执行。

#### Scenario: 使用模板处理
- **WHEN** 用户在文章详情页点击"处理"按钮
- **AND** 选择单个工艺模板
- **AND** 点击"开始处理"
- **THEN** 系统将文章加入处理队列
- **AND** 显示 Toast 提示"已加入队列"
- **AND** 关闭处理选项弹窗

#### Scenario: 使用管道处理
- **WHEN** 用户在文章详情页点击"处理"按钮
- **AND** 选择管道
- **AND** 点击"开始处理"
- **THEN** 系统将文章加入处理队列
- **AND** 显示 Toast 提示"已加入队列"
- **AND** 关闭处理选项弹窗

#### Scenario: 文章已在队列中
- **WHEN** 用户尝试处理已在队列中的文章
- **THEN** 系统显示 Toast 提示"该文章已在队列中"
- **AND** 关闭处理选项弹窗

#### Scenario: 入队成功后状态显示
- **WHEN** 文章成功加入队列
- **THEN** 处理历史区域显示队列状态
- **AND** 状态轮询自动启动

#### Scenario: 处理完成
- **WHEN** 后台 Worker 完成处理
- **THEN** 系统更新处理结果状态为 `done`
- **AND** 处理历史自动刷新显示新结果

---

### Requirement: 处理选项弹窗

系统 SHALL 提供处理选项弹窗供用户选择处理方式，点击确认后入队。

#### Scenario: 显示处理选项
- **WHEN** 用户点击"处理"按钮
- **THEN** 系统显示弹窗
- **AND** 弹窗包含"使用模板"和"使用管道"两个选项卡

#### Scenario: 选择模板
- **WHEN** 用户在"使用模板"选项卡
- **THEN** 系统显示用户的所有工艺模板列表
- **AND** 用户可选择一个模板

#### Scenario: 选择管道
- **WHEN** 用户在"使用管道"选项卡
- **THEN** 系统显示用户的所有管道列表
- **AND** 用户可选择一个管道

#### Scenario: 无可用模板/管道
- **WHEN** 用户没有任何工艺模板或管道
- **THEN** 系统显示提示"请先创建模板/管道"
- **AND** 提供跳转到设置页面的链接

#### Scenario: 入队操作
- **WHEN** 用户选择模板或管道后点击"开始处理"
- **THEN** 系统调用入队 API
- **AND** 不再阻塞等待处理完成

---

### Requirement: 原文/结果切换

系统 SHALL 支持在原文和处理结果之间切换查看。

#### Scenario: 显示处理结果
- **WHEN** 文章有处理结果且状态为 `done`
- **THEN** 系统默认显示处理结果

#### Scenario: 切换到原文
- **WHEN** 用户点击"原文"标签
- **THEN** 系统显示文章原始内容

#### Scenario: 切换到结果
- **WHEN** 用户点击"处理结果"标签
- **THEN** 系统显示处理后的内容

#### Scenario: 显示处理元信息
- **WHEN** 用户查看处理结果
- **THEN** 系统显示处理时间
- **AND** 显示使用的模板/管道名称
- **AND** 显示 Token 消耗（可选）

---

### Requirement: 处理历史记录

系统 SHALL 保留文章的处理历史记录。

#### Scenario: 一篇文章多次处理
- **WHEN** 用户对同一文章使用不同模板/管道处理
- **THEN** 系统保留所有处理记录
- **AND** 每条记录有独立的结果

#### Scenario: 查看历史记录
- **WHEN** 用户查看文章详情页
- **THEN** 系统显示该文章的所有处理历史
- **AND** 历史按时间倒序排列

#### Scenario: 选择查看历史结果
- **WHEN** 用户点击某条历史记录
- **THEN** 系统显示该次处理的结果

---

### Requirement: Prompt 模板渲染

系统 SHALL 正确渲染 Prompt 模板变量。

#### Scenario: 渲染文章变量
- **WHEN** 处理文章时
- **THEN** 系统将 `{{title}}` 替换为文章标题
- **AND** 将 `{{content}}` 替换为文章内容
- **AND** 将 `{{author}}` 替换为作者（如有）
- **AND** 将 `{{link}}` 替换为原文链接
- **AND** 将 `{{publishedAt}}` 替换为发布时间
- **AND** 将 `{{readingTime}}` 替换为预计阅读时长

#### Scenario: 渲染 Feed 变量
- **WHEN** 处理文章时
- **THEN** 系统将 `{{feedTitle}}` 替换为订阅源名称
- **AND** 将 `{{feedUrl}}` 替换为订阅源地址

#### Scenario: 渲染管道变量
- **WHEN** 管道执行第二步及之后的步骤时
- **THEN** 系统将 `{{prev_output}}` 替换为上一步的输出

---

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
