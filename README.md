# Re-Flow

一个现代化的 RSS 阅读器，集成 AI 智能处理能力，支持文章自动摘要、翻译、过滤等功能。

## 功能特性

### 核心功能
- **RSS 订阅管理** - 添加、编辑、删除订阅源，支持分类管理
- **文章阅读** - 沉浸式阅读体验，支持收藏和已读标记
- **自动刷新** - 后台 Worker 定时自动获取最新文章

### AI 智能处理
- **多 AI 提供商支持** - 支持 OpenAI、Anthropic 及其兼容 API（DeepSeek、Qwen 等）
- **Craft 模板** - 可复用的提示词模板，支持摘要、翻译、过滤、分析、重写等类别
- **Pipeline 流水线** - 多步骤处理流程，串联多个模板完成复杂任务
- **处理队列** - 后台异步处理，支持重试机制

### MCP 服务
- **远程访问** - 通过 HTTP/SSE 协议提供 MCP 服务
- **Token 管理** - 多用户 Token 管理，支持订阅源白名单和时间窗口限制
- **Claude Code 集成** - 可直接在 Claude Code 中阅读订阅文章

### 用户系统
- **邮箱认证** - 邮箱验证码注册，安全可靠
- **密码管理** - 支持密码重置功能

## 技术栈

- **前端框架**: Next.js 16 (App Router) + React 19
- **样式方案**: Tailwind CSS 4
- **编程语言**: TypeScript 5 (严格模式)
- **数据库**: SQLite + Drizzle ORM
- **包管理器**: pnpm
- **测试框架**: Vitest + React Testing Library + fast-check
- **AI SDK**: Vercel AI SDK (支持 OpenAI/Anthropic)
- **MCP SDK**: @modelcontextprotocol/sdk

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制示例配置文件并填写必要的环境变量：

```bash
cp .env.local.example .env.local
```

主要环境变量：

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `JWT_SECRET` | JWT 密钥 | 是 |
| `ENCRYPTION_KEY` | API 密钥加密密钥（32字节十六进制） | 是 |
| `SMTP_HOST` | SMTP 服务器地址 | 是 |
| `SMTP_PORT` | SMTP 端口 | 否（默认 587） |
| `SMTP_USER` | SMTP 用户名 | 是 |
| `SMTP_PASS` | SMTP 密码 | 是 |
| `EMAIL_FROM` | 发件人邮箱 | 否 |
| `CRON_SECRET` | 定时任务密钥 | 否 |

### 数据库迁移

```bash
pnpm exec drizzle-kit generate
pnpm exec drizzle-kit migrate
```

### 启动开发服务器

```bash
# 终端 1: 启动 Next.js 开发服务器
pnpm dev

# 终端 2: 启动 RSS 后台 Worker（可选）
pnpm worker:rss

# 终端 3: 启动处理队列 Worker（可选）
pnpm worker:processing

# 终端 4: 启动远程 MCP 服务（可选）
pnpm worker:mcp
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # 仪表盘页面（需登录）
│   │   ├── feeds/          # 订阅源管理
│   │   ├── items/          # 文章阅读
│   │   ├── favorites/      # 收藏列表
│   │   └── settings/       # 设置页面
│   │       ├── ai/         # AI 配置
│   │       ├── craft/      # Craft 模板
│   │       ├── pipelines/  # Pipeline 流水线
│   │       └── mcp/        # MCP Token 管理
│   ├── api/                # API 路由
│   ├── login/              # 登录页
│   ├── register/           # 注册页
│   └── ...
├── components/             # React 组件
│   ├── ui/                 # 基础 UI 组件
│   ├── feeds/              # 订阅源组件
│   ├── items/              # 文章组件
│   ├── ai/                 # AI 相关组件
│   └── craft/              # Craft 模板组件
├── lib/                    # 核心库
│   ├── auth/               # 认证相关（JWT、加密、限流）
│   ├── db/                 # 数据库层（Schema、迁移）
│   ├── rss/                # RSS 解析逻辑
│   ├── ai/                 # AI 提供商逻辑
│   ├── api/                # 前端 API 客户端
│   └── craft-templates/    # Craft 模板预设
├── hooks/                  # 自定义 React Hooks
├── workers/                # 后台 Worker 进程
│   ├── rss-worker.ts       # RSS 刷新 Worker
│   ├── processing-worker.ts # 处理队列 Worker
│   └── remote-rss-mcp.ts   # 远程 MCP 服务
└── __tests__/              # 单元测试
```

## 开发命令

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器

# 测试
pnpm test             # 运行所有测试
pnpm test --watch     # 监视模式
pnpm test --coverage  # 覆盖率报告

# 代码质量
pnpm lint             # ESLint 检查
pnpm exec tsc --noEmit # TypeScript 类型检查

# 数据库
pnpm exec drizzle-kit generate  # 生成迁移
pnpm exec drizzle-kit migrate   # 执行迁移
pnpm exec drizzle-kit studio    # 打开数据库管理界面

# Worker
pnpm worker:rss        # RSS 刷新 Worker
pnpm worker:processing # 处理队列 Worker
pnpm worker:mcp        # 远程 MCP 服务
```

## API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 退出登录
- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/reset-password` - 重置密码

### 订阅源
- `GET/POST /api/feeds` - 获取列表 / 创建
- `GET/PUT/DELETE /api/feeds/[id]` - 单个订阅源操作
- `POST /api/feeds/[id]/refresh` - 刷新单个订阅源
- `POST /api/feeds/[id]/mark-all-read` - 标记全部已读
- `POST /api/feeds/refresh-all` - 刷新所有订阅源
- `POST /api/feeds/validate` - 验证订阅源

### 文章
- `GET /api/items` - 获取文章列表
- `GET/PUT /api/items/[id]` - 单个文章操作
- `POST /api/items/[id]/read` - 标记已读
- `POST /api/items/[id]/favorite` - 收藏/取消收藏
- `POST /api/items/mark-all-read` - 全部标记已读

### AI 配置
- `GET/POST /api/ai-configs` - 获取列表 / 创建
- `GET/PUT/DELETE /api/ai-configs/[id]` - 单个配置操作
- `POST /api/ai-configs/[id]/test` - 测试配置
- `POST /api/ai-configs/[id]/toggle` - 启用/禁用
- `POST /api/ai-configs/[id]/set-default` - 设为默认
- `GET /api/ai-configs/presets` - 获取预设提供商

### Craft 模板
- `GET/POST /api/craft-templates` - 获取列表 / 创建
- `GET/PUT/DELETE /api/craft-templates/[id]` - 单个模板操作

### Pipeline
- `GET/POST /api/pipelines` - 获取列表 / 创建
- `GET/PUT/DELETE /api/pipelines/[id]` - 单个流水线操作

### MCP Token
- `GET/POST /api/mcp-tokens` - 获取列表 / 创建
- `GET/PUT/DELETE /api/mcp-tokens/[id]` - 单个 Token 操作

## 测试

项目使用 Vitest + React Testing Library 进行测试，包含单元测试和属性测试。

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test __tests__/lib/auth/jwt.test.ts

# 监视模式
pnpm test --watch

# 覆盖率报告
pnpm test --coverage
```

详细测试策略请参阅 [`__tests__/README.md`](__tests__/README.md)。

## 数据库 Schema

| 表名 | 说明 |
|------|------|
| `users` | 用户信息 |
| `verification_codes` | 验证码 |
| `feeds` | 订阅源 |
| `feed_items` | 文章内容 |
| `ai_configs` | AI 配置 |
| `craft_templates` | Craft 模板 |
| `pipelines` | 处理流水线 |
| `processing_results` | 处理结果 |
| `processing_queue` | 处理队列 |
| `mcp_tokens` | MCP 访问令牌 |

## 部署

### Vercel 部署

推荐使用 [Vercel Platform](https://vercel.com) 部署：

1. 导入 Git 仓库
2. 配置环境变量
3. 部署

### Docker 部署

```bash
# 构建镜像
docker build -t re-flow .

# 运行容器
docker run -p 3000:3000 --env-file .env.local re-flow
```

## 许可证

MIT License
