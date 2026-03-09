# Purpose

Enable users to create and manage reusable AI processing templates (Craft Templates) for RSS content processing.

## ADDED Requirements

### Requirement: 工艺模板列表展示

系统 SHALL 为已登录用户展示其所有工艺模板列表。

#### Scenario: 展示模板列表
- **GIVEN** 用户访问工艺模板设置页面 `/settings/craft`
- **WHEN** 系统加载当前用户的工艺模板
- **THEN** 系统展示当前用户的所有工艺模板
- **AND** 每个模板以卡片形式展示
- **AND** 卡片显示模板名称、分类标签、关联的 AI 配置名称、Prompt 预览
- **AND** 卡片中的创建时间必须与模板的真实创建日期一致

#### Scenario: 空状态提示
- **GIVEN** 用户没有任何工艺模板
- **WHEN** 用户访问工艺模板设置页面 `/settings/craft`
- **THEN** 系统展示空状态提示
- **AND** 提供"创建模板"和"浏览预设模板库"入口

---

### Requirement: 工艺模板时间戳一致性

系统 SHALL 以 Unix 秒级时间戳持久化并返回工艺模板的 `createdAt` 与 `updatedAt`，且模板列表必须按相同语义展示这些字段。

#### Scenario: 创建模板写入秒级时间
- **GIVEN** 用户提交有效的工艺模板创建请求
- **WHEN** 系统创建模板
- **THEN** `createdAt` 与 `updatedAt` MUST 为秒级时间戳
- **AND** 模板卡片中的创建时间显示为真实当前日期

#### Scenario: 编辑模板保持秒级时间
- **GIVEN** 用户编辑已有工艺模板
- **WHEN** 系统保存更新结果
- **THEN** `updatedAt` MUST 以秒级时间戳写入并返回
- **AND** 不得向数据库写入毫秒级时间值

---

### Requirement: 创建工艺模板

系统 SHALL 允许已登录用户创建新的工艺模板。

#### Scenario: 创建模板成功
- **WHEN** 用户填写模板表单并提交
- **AND** 所有必填字段验证通过
- **THEN** 系统创建新的工艺模板
- **AND** 关联到指定的 AI 配置

#### Scenario: 模板名称验证
- **WHEN** 用户提交模板表单
- **AND** 模板名称为空或长度不在 3-50 字符范围内
- **THEN** 系统返回验证错误"模板名称长度必须为 3-50 字符"

#### Scenario: Prompt 模板必填
- **WHEN** 用户提交模板表单
- **AND** Prompt 模板为空
- **THEN** 系统返回验证错误"Prompt 模板不能为空"

#### Scenario: AI 配置必选
- **WHEN** 用户提交模板表单
- **AND** 未选择关联的 AI 配置
- **THEN** 系统返回验证错误"请选择关联的 AI 配置"

---

### Requirement: 编辑工艺模板

系统 SHALL 允许已登录用户编辑已有的工艺模板。

#### Scenario: 编辑模板成功
- **WHEN** 用户修改模板表单并提交
- **AND** 所有必填字段验证通过
- **THEN** 系统更新工艺模板
- **AND** 更新 `updatedAt` 时间戳

#### Scenario: 编辑不存在的模板
- **WHEN** 用户尝试编辑不存在的模板 ID
- **THEN** 系统返回 404 错误

#### Scenario: 编辑他人模板
- **WHEN** 用户尝试编辑不属于自己的模板
- **THEN** 系统返回 403 错误

---

### Requirement: 删除工艺模板

系统 SHALL 允许已登录用户删除工艺模板。

#### Scenario: 删除模板成功
- **WHEN** 用户确认删除模板
- **AND** 模板存在且属于当前用户
- **THEN** 系统删除该模板

#### Scenario: 删除确认
- **WHEN** 用户点击删除按钮
- **THEN** 系统显示确认对话框
- **AND** 用户确认后才执行删除

---

### Requirement: 预设模板库

系统 SHALL 提供预设模板库供用户复制使用。

#### Scenario: 浏览预设模板
- **WHEN** 用户点击"预设模板库"按钮
- **THEN** 系统展示所有预设模板
- **AND** 每个预设模板显示名称、分类、Prompt 预览

#### Scenario: 复制预设模板
- **WHEN** 用户选择一个预设模板并点击"使用"
- **THEN** 系统复制该模板到用户的模板列表
- **AND** 用户可以编辑复制后的模板

#### Scenario: 预设模板不可修改
- **WHEN** 用户浏览预设模板库
- **THEN** 预设模板只能复制，不能直接修改

---

### Requirement: Prompt 编辑器

系统 SHALL 提供 Prompt 编辑器，支持变量提示。

#### Scenario: 变量提示
- **WHEN** 用户在 Prompt 编辑器中输入 `{{`
- **THEN** 系统显示可用变量列表供选择

#### Scenario: 变量列表
- **WHEN** 用户查看可用变量
- **THEN** 系统显示以下变量：
  - `{{title}}` - 文章标题
  - `{{content}}` - 文章内容
  - `{{author}}` - 作者
  - `{{link}}` - 原文链接
  - `{{publishedAt}}` - 发布时间
  - `{{readingTime}}` - 预计阅读时长
  - `{{feedTitle}}` - 订阅源名称
  - `{{feedUrl}}` - 订阅源地址

---

### Requirement: 模板分类

系统 SHALL 支持工艺模板分类。

#### Scenario: 分类选项
- **WHEN** 用户创建或编辑模板
- **THEN** 系统提供以下分类选项：
  - 摘要
  - 翻译
  - 过滤
  - 分析
  - 改写
  - 自定义

#### Scenario: 默认分类
- **WHEN** 用户创建模板且未选择分类
- **THEN** 系统默认使用"自定义"分类
