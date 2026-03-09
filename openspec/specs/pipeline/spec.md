# Purpose

Enable users to create and manage processing pipelines by combining multiple craft templates in sequence.

## ADDED Requirements

### Requirement: 管道列表展示

系统 SHALL 为已登录用户展示其所有管道列表。

#### Scenario: 展示管道列表
- **GIVEN** 用户访问管道设置页面 `/settings/pipelines`
- **WHEN** 系统加载当前用户的所有管道
- **THEN** 系统展示当前用户的所有管道
- **AND** 每个管道以卡片形式展示
- **AND** 卡片显示管道名称、描述、包含的步骤数量
- **AND** 卡片中的创建时间必须与管道的真实创建日期一致

#### Scenario: 空状态提示
- **GIVEN** 用户没有任何管道
- **WHEN** 用户访问管道设置页面 `/settings/pipelines`
- **THEN** 系统展示空状态提示
- **AND** 提供"创建管道"入口

---

### Requirement: 管道时间戳一致性

系统 SHALL 以 Unix 秒级时间戳持久化并返回管道的 `createdAt` 与 `updatedAt`，且管道列表必须按相同语义展示这些字段。

#### Scenario: 创建管道写入秒级时间
- **GIVEN** 用户提交有效的管道创建请求
- **WHEN** 系统创建管道
- **THEN** `createdAt` 与 `updatedAt` MUST 为秒级时间戳
- **AND** 管道卡片中的创建时间显示为真实当前日期

#### Scenario: 编辑管道保持秒级时间
- **GIVEN** 用户编辑已有管道
- **WHEN** 系统保存更新结果
- **THEN** `updatedAt` MUST 以秒级时间戳写入并返回
- **AND** 不得向数据库写入毫秒级时间值

---

### Requirement: 创建管道

系统 SHALL 允许已登录用户创建新的管道。

#### Scenario: 创建管道成功
- **WHEN** 用户填写管道表单并提交
- **AND** 所有必填字段验证通过
- **AND** 至少添加一个步骤
- **THEN** 系统创建新的管道
- **AND** 步骤按指定顺序存储

#### Scenario: 管道名称验证
- **WHEN** 用户提交管道表单
- **AND** 管道名称为空或长度不在 3-50 字符范围内
- **THEN** 系统返回验证错误"管道名称长度必须为 3-50 字符"

#### Scenario: 至少一个步骤
- **WHEN** 用户提交管道表单
- **AND** 未添加任何步骤
- **THEN** 系统返回验证错误"请至少添加一个处理步骤"

---

### Requirement: 编辑管道

系统 SHALL 允许已登录用户编辑已有的管道。

#### Scenario: 编辑管道成功
- **WHEN** 用户修改管道表单并提交
- **AND** 所有必填字段验证通过
- **THEN** 系统更新管道
- **AND** 更新 `updatedAt` 时间戳

#### Scenario: 编辑不存在的管道
- **WHEN** 用户尝试编辑不存在的管道 ID
- **THEN** 系统返回 404 错误

#### Scenario: 编辑他人管道
- **WHEN** 用户尝试编辑不属于自己的管道
- **THEN** 系统返回 403 错误

---

### Requirement: 删除管道

系统 SHALL 允许已登录用户删除管道。

#### Scenario: 删除管道成功
- **WHEN** 用户确认删除管道
- **AND** 管道存在且属于当前用户
- **THEN** 系统删除该管道

#### Scenario: 删除确认
- **WHEN** 用户点击删除按钮
- **THEN** 系统显示确认对话框
- **AND** 用户确认后才执行删除

---

### Requirement: 步骤编辑器

系统 SHALL 提供可视化步骤编辑器。

#### Scenario: 添加步骤
- **WHEN** 用户在步骤编辑器中点击"添加步骤"
- **THEN** 系统显示模板选择器
- **AND** 用户可从自己的模板列表中选择

#### Scenario: 删除步骤
- **WHEN** 用户点击步骤的删除按钮
- **THEN** 系统移除该步骤
- **AND** 自动重新排序剩余步骤

#### Scenario: 步骤数量限制
- **WHEN** 用户尝试添加超过 10 个步骤
- **THEN** 系统显示提示"最多支持 10 个步骤"

---

### Requirement: 步骤拖拽排序

系统 SHALL 支持通过拖拽重新排序管道步骤。

#### Scenario: 拖拽排序
- **WHEN** 用户拖拽某个步骤到新位置
- **THEN** 系统更新步骤顺序
- **AND** 实时显示新顺序

#### Scenario: 排序持久化
- **WHEN** 用户完成拖拽排序并保存管道
- **THEN** 系统按新顺序存储步骤

---

### Requirement: 管道可视化

系统 SHALL 可视化展示管道处理流程。

#### Scenario: 流程展示
- **WHEN** 用户查看管道详情或编辑管道
- **THEN** 系统以流程图形式展示步骤
- **AND** 步骤之间用箭头连接
- **AND** 每个步骤显示模板名称

#### Scenario: 引用已删除模板
- **WHEN** 管道中的某个步骤引用的模板已被删除
- **THEN** 系统显示"已删除模板"占位
- **AND** 提示用户移除或替换该步骤
