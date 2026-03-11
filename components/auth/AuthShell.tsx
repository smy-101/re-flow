import Link from "next/link";
import type { ReactNode } from "react";
import Card from "@/components/ui/Card";
import ThemeToggle from "@/components/layout/ThemeToggle";

interface AuthShellProps {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
}

export default function AuthShell({
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.32),transparent_26%),radial-gradient(circle_at_bottom_right,hsl(var(--primary)/0.18),transparent_30%)]" />
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden rounded-[2rem] border border-border/70 bg-card/75 p-8 shadow-xl shadow-primary/5 backdrop-blur lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              ReFlow Access
            </div>
            <h1 className="max-w-md text-4xl font-semibold leading-tight text-foreground">
              在统一主题下管理订阅、阅读和 AI 工作流。
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              认证页、仪表盘和高频工作流现在共享同一套视觉 token 与交互反馈，亮暗模式切换会贯穿整个站点。
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/85 p-5">
            <p className="text-sm font-medium text-foreground">统一认证壳层</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              输入、验证码、错误反馈、提交状态与主题切换保持一致，减少在登录、注册和找回密码之间的体验跳变。
            </p>
          </div>
        </div>

        <Card className="border-border/70 bg-card/90 p-0 shadow-xl shadow-black/5 backdrop-blur">
          <div className="space-y-6 p-6 sm:p-8">
            <div className="space-y-3">
              <Link href="/" className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80">
                ReFlow
              </Link>
              <div>
                <h2 className="text-3xl font-semibold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </div>

            {children}

            <div className="border-t border-border/70 pt-6 text-sm text-muted-foreground">
              {footer}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
