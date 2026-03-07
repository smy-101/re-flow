# Purpose

Enable users to process RSS articles using craft templates or pipelines, store processing results, and switch between original content and processed output.

## ADDED Requirements

### Requirement: 处理文章

系统 SHALL 允许已登录用户对 RSS 文章应用模板或管道进行处理。

#### Scenario: 使用模板处理
- **WHEN** 用户在文章详情页点击"处理"按钮
- **AND** 选择单个工艺模板
- **THEN** 系统使用该模板处理文章
- **AND** 存储处理结果

#### Scenario: 使用管道处理
- **WHEN** 用户在文章详情页点击"处理"按钮
- **AND** 选择管道
- **THEN** 系统按管道步骤顺序处理文章
- **AND** 存储每步输出和最终结果

#### Scenario: 处理中状态
- **WHEN** 处理开始执行
- **THEN** 系统显示处理中状态
- **AND** 处理结果状态为 `processing`

#### Scenario: 处理成功
- **WHEN** 处理完成
- **THEN** 系统更新处理结果状态为 `done`
- **AND** 记录完成时间
- **AND** 记录 Token 消耗

#### Scenario: 处理失败
- **WHEN** 处理过程中发生错误
- **THEN** 系统更新处理结果状态为 `error`
- **AND** 记录错误信息
- **AND** 用户可重试

---

### Requirement: 处理选项弹窗

系统 SHALL 提供处理选项弹窗供用户选择处理方式。

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
