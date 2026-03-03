# RSS Fetcher 测试规范

本规范定义 `lib/rss/fetcher.ts` 模块的测试要求，确保 RSS 解析、去重、阅读时间计算和存储流程的正确性和鲁棒性。

## ADDED Requirements

### Requirement: RSS 解析器必须正确处理标准 RSS 格式
系统 SHALL 能够解析标准 RSS 2.0 和 Atom 格式的 feed，并提取标题、链接、内容、发布日期、作者等字段。

#### Scenario: 成功解析标准 RSS 2.0 feed
- **WHEN** 提供有效的 RSS 2.0 feed URL
- **THEN** 系统返回正确的 items 数组，每个 item 包含 title、link、content、publishedAt 字段

#### Scenario: 成功解析 Atom feed
- **WHEN** 提供有效的 Atom feed URL
- **THEN** 系统返回正确的 items 数组，正确映射 Atom 字段到通用结构

#### Scenario: 提取 feed 标题
- **WHEN** feed 包含 title 字段
- **THEN** 系统在返回结果中包含 feed.title

### Requirement: RSS 解析器必须处理缺失字段的情况
系统 SHALL 在 RSS item 缺少可选字段时使用默认值，而不是抛出异常。

#### Scenario: 缺少标题时使用默认值
- **WHEN** RSS item 不包含 title 字段
- **THEN** 系统使用 "Untitled" 作为默认标题

#### Scenario: 缺少发布日期时使用当前时间
- **WHEN** RSS item 不包含 pubDate 或 isoDate 字段
- **THEN** 系统使用 Date.now() 作为 publishedAt

#### Scenario: 缺少作者信息时返回 undefined
- **WHEN** RSS item 不包含 author 或 creator 字段
- **THEN** 系统 item.author 为 undefined

#### Scenario: 缺少内容时使用空字符串
- **WHEN** RSS item 不包含 content、contentSnippet 或 description 字段
- **THEN** 系统 item.content 为空字符串

### Requirement: RSS 解析器必须拒绝无链接的 items
系统 SHALL 过滤掉所有没有 link 字段的 RSS items，因为 link 是去重的关键。

#### Scenario: 过滤无链接的 items
- **WHEN** RSS feed 包含没有 link 字段的 items
- **THEN** 系统在返回的 items 数组中不包含这些 items

### Requirement: RSS 解析器必须正确处理多种内容字段优先级
系统 SHALL 按 `content:encoded` > `content` > `contentSnippet` > `description` 的优先级选择内容字段。

#### Scenario: 优先使用 content:encoded
- **WHEN** RSS item 包含 content:encoded 字段
- **THEN** 系统使用 content:encoded 的值作为 content

#### Scenario: 降级使用 description
- **WHEN** RSS item 只包含 description 字段
- **THEN** 系统使用 description 的值作为 content

### Requirement: RSS 解析器必须将时间戳转换为 Unix 格式
系统 SHALL 将所有时间戳转换为秒级 Unix 时间戳（整数），以便存储在 SQLite 中。

#### Scenario: 转换毫秒时间戳为秒
- **WHEN** 从 RSS feed 解析到毫秒级时间戳
- **THEN** 系统将其除以 1000 并向下取整，得到秒级 Unix 时间戳

### Requirement: RSS 解析器必须处理超时情况
系统 SHALL 在 RSS feed 请求超过 10 秒时抛出特定的超时错误。

#### Scenario: 网络超时抛出错误
- **WHEN** RSS feed 请求超过 10 秒未响应
- **THEN** 系统抛出包含 "timeout" 或 "ETIMEDOUT" 信息的错误

#### Scenario: 捕获超时并返回友好错误
- **WHEN** 检测到超时错误
- **THEN** 系统返回 "RSS feed request timed out" 错误消息

### Requirement: RSS 解析器必须处理无效 XML
系统 SHALL 在遇到无效或格式错误的 XML 时抛出适当的错误。

#### Scenario: 无效 XML 抛出错误
- **WHEN** feed URL 返回格式错误的 XML
- **THEN** 系统抛出解析错误，不导致进程崩溃

### Requirement: 去重功能必须排除已存在的 items
系统 SHALL 查询数据库中已存储的 items，并过滤掉链接重复的 items。

#### Scenario: 过滤已存在的 items
- **WHEN** 数据库已包含相同 link 的 items
- **THEN** 系统在返回的新 items 数组中不包含这些 items

#### Scenario: 空输入返回空数组
- **WHEN** 传入空数组
- **THEN** 系统立即返回空数组，不查询数据库

#### Scenario: 全部重复时返回空数组
- **WHEN** 所有 items 的 link 都已存在于数据库
- **THEN** 系统返回空数组

### Requirement: 去重必须基于 link 字段
系统 SHALL 使用 link 字段作为唯一标识进行去重，不考虑其他字段。

#### Scenario: 相同 link 的 item 被去重
- **WHEN** 两个 items 的 link 相同但其他字段不同
- **THEN** 系统只保留第一个，过滤第二个

### Requirement: 阅读时间计算必须正确处理纯文本
系统 SHALL 移除 HTML 标签后按每分钟 250 词计算阅读时间。

#### Scenario: 纯文本内容计算
- **WHEN** 内容为 500 个单词的纯文本
- **THEN** 系统返回 2 分钟阅读时间

#### Scenario: 向上取整到分钟
- **WHEN** 内容为 251 个单词
- **THEN** 系统返回 2 分钟（而非 1 分钟）

#### Scenario: 最小值为 1 分钟
- **WHEN** 内容为空或少于 1 分钟
- **THEN** 系统返回 1 分钟

### Requirement: 阅读时间计算必须移除 HTML 标签
系统 SHALL 在计算单词数前移除所有 HTML 标签。

#### Scenario: 移除 HTML 标签后计算
- **WHEN** 内容包含 `<p>Hello world</p>`
- **THEN** 系统计算为 2 个单词（"Hello" 和 "world"）

#### Scenario: 处理嵌套标签
- **WHEN** 内容包含 `<div><p>Hello <strong>world</strong></p></div>`
- **THEN** 系统正确计算单词数，忽略所有标签

### Requirement: 阅读时间计算必须正确处理空白字符
系统 SHALL 将连续空白字符（包括换行、多个空格）规范化为单个空格。

#### Scenario: 规范化空白字符
- **WHEN** 内容包含多个连续空格和换行
- **THEN** 系统将它们视为单个空格进行单词分割

#### Scenario: 去除首尾空白
- **WHEN** 内容以空格开头或结尾
- **THEN** 系统在计算前 trim() 掉这些空白

### Requirement: 存储功能必须在事务中插入 items
系统 SHALL 使用数据库事务确保 items 插入的原子性，失败时全部回滚。

#### Scenario: 成功存储返回插入数量
- **WHEN** 成功插入 10 个 items
- **THEN** 系统返回 10

#### Scenario: 空数组返回 0
- **WHEN** 传入空数组
- **THEN** 系统立即返回 0，不执行数据库操作

#### Scenario: Feed 不存在时抛出错误
- **WHEN** feedId 对应的 feed 不存在于数据库
- **THEN** 系统抛出 "Feed not found" 错误

#### Scenario: 数据库错误时抛出异常
- **WHEN** 数据库插入操作失败
- **THEN** 系统抛出 "Failed to store items" 错误

### Requirement: 存储功能必须计算并保存阅读时间
系统 SHALL 在插入 items 前为每个 item 计算阅读时间并存储在 readingTime 字段。

#### Scenario: 保存计算的阅读时间
- **WHEN** 存储一个 item
- **THEN** 系统设置 item.readingTime 为计算出的分钟数

### Requirement: 存储功能必须将作者的 undefined 转换为 null
系统 SHALL 在存储 item 时将 undefined 的 author 字段转换为 null，以适配 SQLite。

#### Scenario: 转换 undefined 为 null
- **WHEN** item.author 为 undefined
- **THEN** 系统在数据库中存储为 null

### Requirement: 主流程必须协调解析、去重和存储
系统 SHALL 按顺序执行解析、去重、存储操作，并在每个阶段处理错误。

#### Scenario: 成功流程返回结果
- **WHEN** 所有步骤成功
- **THEN** 系统返回 `{ success: true, itemsAdded: N }`

#### Scenario: 无新 items 时返回成功
- **WHEN** 解析成功但所有 items 都已存在
- **THEN** 系统返回 `{ success: true, itemsAdded: 0 }`

#### Scenario: 空 feed 时返回成功
- **WHEN** feed 解析成功但没有 items
- **THEN** 系统返回 `{ success: true, itemsAdded: 0 }`

#### Scenario: 解析失败时返回错误
- **WHEN** RSS 解析抛出异常
- **THEN** 系统返回 `{ success: false, itemsAdded: 0, error: "错误消息" }`

#### Scenario: 任何步骤失败不影响错误返回
- **WHEN** 去重、存储或更新时间戳失败
- **THEN** 系统捕获错误并返回 `{ success: false, itemsAdded: 0, error: "错误消息" }`

### Requirement: 主流程必须更新 feed 的最后更新时间
系统 SHALL 在成功存储 items 后更新 feed 的 lastUpdatedAt 字段。

#### Scenario: 更新 lastUpdatedAt 时间戳
- **WHEN** items 成功存储
- **THEN** 系统更新 feed.lastUpdatedAt 为当前 Unix 时间戳（秒）

### Requirement: 主流程必须记录错误日志
系统 SHALL 在捕获任何错误时将其记录到控制台，便于调试。

#### Scenario: 记录存储错误
- **WHEN** 存储操作失败
- **THEN** 系统在控制台输出 "Error storing items:" 和错误详情
