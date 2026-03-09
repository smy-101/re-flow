# Purpose

Enable users to manage AI provider configurations for RSS content processing.

## ADDED Requirements

### Requirement: AI 配置列表展示

系统 SHALL 为已登录用户展示其所有 AI 配置列表。

#### Scenario: 展示配置列表
- **GIVEN** 用户访问 AI 设置页面 `/settings/ai`
- **WHEN** 系统加载当前用户的 AI 配置
- **THEN** 系统展示当前用户的所有 AI 配置
- **AND** 默认配置排在列表最前面
- **AND** 每个配置以卡片形式展示
- **AND** 卡片中的创建时间必须与配置的真实创建日期一致

#### Scenario: 空状态提示
- **GIVEN** 用户没有任何 AI 配置
- **WHEN** 用户访问 AI 设置页面 `/settings/ai`
- **THEN** 系统展示空状态提示
- **AND** 提供"添加配置"入口

---

### Requirement: AI 配置时间戳一致性

系统 SHALL 以 Unix 秒级时间戳持久化并返回 AI 配置的 `createdAt`、`updatedAt` 与 `lastErrorAt`，且相关页面必须按相同语义展示这些字段。

#### Scenario: 创建配置写入秒级时间
- **GIVEN** 用户提交有效的 AI 配置创建请求
- **WHEN** 系统创建新配置
- **THEN** `createdAt` 与 `updatedAt` MUST 为秒级时间戳
- **AND** 配置列表中的创建时间显示为真实当前日期而非异常未来日期

#### Scenario: 更新配置保持秒级时间
- **GIVEN** 用户编辑已有 AI 配置
- **WHEN** 系统保存更新结果
- **THEN** `updatedAt` MUST 以秒级时间戳写入并返回
- **AND** 健康状态重置时不得引入毫秒级时间值

#### Scenario: 测试失败记录错误时间
- **GIVEN** 用户测试 AI 配置且测试失败
- **WHEN** 系统写入错误状态
- **THEN** `lastErrorAt` MUST 为秒级时间戳
- **AND** 错误时间在配置卡片中显示为正确的本地日期

---

### Requirement: 创建 AI 配置

系统 SHALL 允许已登录用户创建新的 AI 配置。

#### Scenario: 创建配置成功
- **WHEN** 用户填写配置表单并提交
- **AND** 所有必填字段验证通过
- **AND** API Key 加密存储成功
- **THEN** 系统创建新的 AI 配置
- **AND** 配置健康状态初始化为 `unverified`
- **AND** 配置默认为启用状态

#### Scenario: 创建配置验证失败
- **WHEN** 用户提交配置表单
- **AND** 配置名称为空或长度不在 3-50 字符范围内
- **THEN** 系统返回验证错误"配置名称长度必须为 3-50 字符"

#### Scenario: API Key 必填
- **WHEN** 用户提交配置表单
- **AND** API Key 为空
- **THEN** 系统返回验证错误"API Key 不能为空"

#### Scenario: API 地址格式验证
- **WHEN** 用户提交配置表单
- **AND** API 地址不是有效的 HTTP/HTTPS URL
- **THEN** 系统返回验证错误"API 地址格式无效"

---

### Requirement: 编辑 AI 配置

系统 SHALL 允许已登录用户编辑已有的 AI 配置。

#### Scenario: 编辑配置成功
- **WHEN** 用户修改配置表单并提交
- **AND** 所有必填字段验证通过
- **THEN** 系统更新 AI 配置
- **AND** 配置健康状态重置为 `unverified`
- **AND** 清除之前的错误信息

#### Scenario: 编辑不存在的配置
- **WHEN** 用户尝试编辑不存在的配置 ID
- **THEN** 系统返回 404 错误

#### Scenario: 编辑他人配置
- **WHEN** 用户尝试编辑不属于自己的配置
- **THEN** 系统返回 403 错误

---

### Requirement: 删除 AI 配置

系统 SHALL 允许已登录用户删除 AI 配置。

#### Scenario: 删除配置成功
- **WHEN** 用户确认删除配置
- **AND** 配置存在且属于当前用户
- **AND** 配置没有关联的工艺模板
- **THEN** 系统删除该配置

#### Scenario: 删除确认
- **WHEN** 用户点击删除按钮
- **THEN** 系统显示确认对话框
- **AND** 用户确认后才执行删除

#### Scenario: 删除默认配置
- **WHEN** 用户删除默认配置
- **AND** 配置没有关联的工艺模板
- **THEN** 系统删除该配置
- **AND** 用户不再有默认配置

#### Scenario: 删除保护 - 存在关联模板
- **WHEN** 用户尝试删除 AI 配置
- **AND** 该配置存在关联的工艺模板
- **THEN** 系统拒绝删除
- **AND** 返回 400 错误
- **AND** 错误信息包含关联的模板名称列表
- **AND** 提示用户先删除或修改关联的模板

---

### Requirement: 配置测试

系统 SHALL 允许用户测试 AI 配置是否可用。

#### Scenario: 测试成功
- **WHEN** 用户点击"测试"按钮
- **AND** AI 服务返回成功响应
- **THEN** 系统显示"配置可用"提示
- **AND** 配置健康状态更新为 `active`

#### Scenario: 测试失败
- **WHEN** 用户点击"测试"按钮
- **AND** AI 服务返回错误
- **THEN** 系统显示具体错误信息
- **AND** 配置健康状态更新为 `error`
- **AND** 记录错误信息和错误时间

#### Scenario: 保存前测试
- **WHEN** 用户在创建/编辑表单中点击测试
- **THEN** 系统使用表单中的配置进行测试
- **AND** 不保存配置到数据库

---

### Requirement: 默认配置

系统 SHALL 允许用户设置一个默认的 AI 配置。

#### Scenario: 设置默认配置
- **WHEN** 用户将某个配置设为默认
- **THEN** 系统将该配置标记为默认
- **AND** 原默认配置的默认标记被取消

#### Scenario: 默认配置限制
- **WHEN** 用户已有默认配置
- **AND** 用户将另一个配置设为默认
- **THEN** 系统只保留新配置为默认

#### Scenario: 无默认配置
- **WHEN** 用户没有设置任何默认配置
- **THEN** 系统正常运作，不强制要求默认配置

---

### Requirement: 启用/禁用状态

系统 SHALL 支持配置的启用和禁用状态。

#### Scenario: 禁用配置
- **WHEN** 用户将配置切换为禁用状态
- **THEN** 系统将该配置标记为禁用
- **AND** 配置卡片显示禁用状态

#### Scenario: 启用配置
- **WHEN** 用户将配置切换为启用状态
- **THEN** 系统将该配置标记为启用

#### Scenario: 禁用配置仍可测试和编辑
- **WHEN** 配置处于禁用状态
- **AND** 用户进行测试或编辑操作
- **THEN** 系统正常执行操作

---

### Requirement: 健康状态追踪

系统 SHALL 追踪每个 AI 配置的健康状态。

#### Scenario: 健康状态显示
- **WHEN** 用户查看配置列表
- **THEN** 每个配置显示健康状态指示器
- **AND** `active` 状态显示绿色"健康"标签
- **AND** `unverified` 状态显示灰色"未验证"标签
- **AND** `error` 状态显示红色"异常"标签

#### Scenario: 错误信息显示
- **WHEN** 配置健康状态为 `error`
- **THEN** 系统显示最后错误信息和错误时间

#### Scenario: 编辑后状态重置
- **WHEN** 用户编辑并保存配置
- **THEN** 健康状态重置为 `unverified`
- **AND** 清除错误信息
