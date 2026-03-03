## MODIFIED Requirements

### Requirement: 收藏文章

系统 SHALL 允许用户收藏重要文章。

#### Scenario: 收藏文章
- **GIVEN** 用户在文章列表或详情页
- **WHEN** 用户点击"收藏"按钮
- **THEN** 系统将该文章标记为收藏
- **AND** 收藏按钮显示为已收藏状态
- **AND** 导航栏收藏数量增加 1

#### Scenario: 取消收藏
- **GIVEN** 文章已被收藏
- **WHEN** 用户再次点击"收藏"按钮
- **THEN** 系统取消收藏状态
- **AND** 收藏按钮恢复为未收藏状态
- **AND** 导航栏收藏数量减少 1

#### Scenario: 筛选收藏文章
- **GIVEN** 用户在文章列表页
- **WHEN** 用户选择"收藏"筛选条件
- **THEN** 系统只显示已收藏的文章

#### Scenario: 收藏页面入口
- **GIVEN** 用户在侧边栏导航
- **WHEN** 用户点击"收藏"导航项
- **THEN** 系统导航到 `/favorites` 收藏页面
- **AND** 收藏页面显示所有收藏文章
