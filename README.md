This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Testing

本项目使用 Vitest + React Testing Library 进行测试。

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test __tests__/lib/auth/jwt.test.ts

# 监视模式（开发时使用）
pnpm test --watch

# 覆盖率报告
pnpm test --coverage
```

### 类型检查

```bash
pnpm exec tsc --noEmit
```

### Lint

```bash
pnpm lint
```

### 测试文档

详细的测试策略和最佳实践请参阅 [`__tests__/README.md`](__tests__/README.md)。

## RSS Worker

启动 RSS 后台 Worker 以自动刷新订阅源：

```bash
pnpm worker:rss
```

Worker 将每 30 分钟自动刷新所有订阅源。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
