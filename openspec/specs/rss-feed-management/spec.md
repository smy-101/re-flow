## ADDED Requirements

### Requirement: 显示 RSS 订阅列表

系统 SHALL 在 `/feeds` 路径显示当前用户的所有 RSS 订阅列表。

#### Scenario: 查看订阅列表
- **GIVEN** 用户已登录
- **WHEN** 用户访问 `/feeds` 页面
- **THEN** 系统显示该用户的所有 RSS 订阅
- **AND** 每个订阅卡片显示：订阅标题、分类标签、未读文章数量、最后更新时间
- **AND** 未读数量大于 0 时显示绿色圆点标记
- **AND** 暂无新内容的订阅显示"暂无新内容"提示

#### Scenario: 点击订阅卡片
- **GIVEN** 用户在订阅列表页
- **WHEN** 用户点击某个订阅卡片
- **THEN** 系统导航到该订阅的详情页 `/feeds/[feedId]`

#### Scenario: 订阅列表分页
- **GIVEN** 用户的订阅数量超过每页显示数量
- **WHEN** 用户访问订阅列表页
- **THEN** 系统显示分页控件
- **AND** 用户可以切换页面查看更多订阅

---

### Requirement: 添加新的 RSS 订阅

系统 SHALL 允许用户通过 `/feeds/add` 页面添加新的 RSS 订阅。

#### Scenario: 访问添加订阅页面
- **GIVEN** 用户已登录
- **WHEN** 用户点击"添加订阅"按钮或访问 `/feeds/add`
- **THEN** 系统显示添加订阅表单
- **AND** 表单包含：RSS Feed URL 输入框（必填）、自定义名称（可选）、分类选择（可选）

#### Scenario: 输入有效的 RSS URL
- **GIVEN** 用户在添加订阅页面
- **WHEN** 用户输入有效的 RSS Feed URL
- **THEN** 系统显示 Feed 预览信息（标题、描述、最后更新时间）
- **AND** 显示"Feed 有效"的确认提示

#### Scenario: 提交新订阅
- **GIVEN** 用户已输入有效的 RSS URL
- **WHEN** 用户点击"添加订阅"按钮
- **THEN** 系统添加订阅到用户的订阅列表
- **AND** 显示成功提示消息
- **AND** 导航回订阅列表页

#### Scenario: 输入无效的 RSS URL
- **GIVEN** 用户在添加订阅页面
- **WHEN** 用户输入无效的 URL 或无法解析的 Feed
- **THEN** 系统显示错误提示
- **AND** 用户可以修正输入后重试

---

### Requirement: 查看 RSS 订阅详情

系统 SHALL 在 `/feeds/[feedId]` 路径显示单个 RSS 订阅的详细信息及文章列表。

#### Scenario: 访问订阅详情页
- **GIVEN** 用户已登录
- **WHEN** 用户访问 `/feeds/[feedId]`
- **THEN** 系统显示该订阅的信息（标题、URL、分类、总文章数、未读数、最后更新时间）
- **AND** 显示该订阅的所有文章列表

#### Scenario: 筛选文章状态
- **GIVEN** 用户在订阅详情页
- **WHEN** 用户点击"未读"或"已读"筛选按钮
- **THEN** 系统只显示对应状态的文章

#### Scenario: 返回订阅列表
- **GIVEN** 用户在订阅详情页
- **WHEN** 用户点击"返回列表"按钮
- **THEN** 系统导航回 `/feeds` 订阅列表页

---

### Requirement: 编辑 RSS 订阅

系统 SHALL 允许用户编辑 RSS 订阅的属性（名称、分类）。

#### Scenario: 打开订阅设置
- **GIVEN** 用户在订阅列表或详情页
- **WHEN** 用户点击订阅的"设置"或"⋯"菜单
- **THEN** 系统显示订阅设置弹窗

#### Scenario: 修改订阅信息
- **GIVEN** 订阅设置弹窗已打开
- **WHEN** 用户修改订阅名称或分类并保存
- **THEN** 系统更新订阅信息
- **AND** 显示保存成功提示

---

### Requirement: 删除 RSS 订阅

系统 SHALL 允许用户删除 RSS 订阅。

#### Scenario: 删除订阅
- **GIVEN** 用户在订阅设置菜单
- **WHEN** 用户点击"删除订阅"
- **THEN** 系统显示确认对话框
- **AND** 对话框提示删除操作不可恢复

#### Scenario: 确认删除订阅
- **GIVEN** 删除确认对话框已显示
- **WHEN** 用户点击"确认删除"
- **THEN** 系统删除该订阅及其所有文章记录
- **AND** 导航回订阅列表页
- **AND** 显示删除成功提示

#### Scenario: 取消删除订阅
- **GIVEN** 删除确认对话框已显示
- **WHEN** 用户点击"取消"或关闭对话框
- **THEN** 系统关闭对话框
- **AND** 订阅保留不变
