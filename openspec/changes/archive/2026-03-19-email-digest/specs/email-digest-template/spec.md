## ADDED Requirements

### Requirement: 邮件模板包含摘要头部

系统 SHALL 在邮件顶部显示摘要信息。

#### Scenario: 显示摘要头部
- **WHEN** 生成邮件内容
- **THEN** 邮件顶部显示：
  - 标题："📰 Re:Flow 订阅摘要"
  - 日期：当前日期（按用户时区格式化）
  - 文章数量：本次推送的文章总数

### Requirement: 邮件模板按分类分组显示

系统 SHALL 将文章按分类分组显示。

#### Scenario: 有分类的文章
- **WHEN** 文章所属 Feed 有 category
- **THEN** 文章显示在对应分类标题下

#### Scenario: 无分类的文章
- **WHEN** 文章所属 Feed 无 category
- **THEN** 文章显示在"未分类"标题下

### Requirement: 邮件模板显示 AI 处理结果

系统 SHALL 为有 AI 处理结果的文章显示处理内容。

#### Scenario: AI 处理结果格式
- **WHEN** 文章有 AI 处理结果
- **THEN** 显示：
  - 标题（可点击跳转原文）
  - 来源（Feed 标题）
  - 阅读时间（readingTime）
  - AI 处理结果（processing_results.output）
  - 阅读原文链接

### Requirement: 邮件模板显示简洁格式

系统 SHALL 为无 AI 处理的文章显示简洁列表格式。

#### Scenario: 简洁格式
- **WHEN** 文章无 AI 处理结果
- **THEN** 显示：
  - 标题（可点击跳转原文）
  - 来源（Feed 标题）
  - 阅读原文链接

### Requirement: 邮件模板包含页脚

系统 SHALL 在邮件底部显示页脚信息。

#### Scenario: 页脚内容
- **WHEN** 生成邮件内容
- **THEN** 页脚显示：
  - 文章总数统计
  - "在 Re:Flow 中查看全部"链接（跳转应用）
  - "取消订阅"链接
  - "管理订阅设置"链接

### Requirement: 邮件模板支持响应式设计

系统 SHALL 确保邮件在桌面和移动端均可读。

#### Scenario: 移动端适配
- **WHEN** 用户在移动设备上查看邮件
- **THEN** 邮件布局自适应屏幕宽度，文字大小可读

### Requirement: 邮件模板包含追踪参数

系统 SHALL 在链接中添加 UTM 参数用于统计分析。

#### Scenario: 添加 UTM 参数
- **WHEN** 生成阅读原文链接
- **THEN** 链接包含 utm_source=email&utm_medium=digest&utm_campaign=rss 参数
