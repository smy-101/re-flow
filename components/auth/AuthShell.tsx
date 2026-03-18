import Link from "next/link";
import type { ReactNode } from "react";
import Card from "@/components/ui/Card";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

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
      {/* Simplified background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-background to-primary/10" />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left panel - Desktop only */}
        <div
          className={cn(
            'hidden rounded-[2rem] border border-border/50',
            'bg-card/70 backdrop-blur-xl',
            'shadow-lg',
            'lg:flex lg:flex-col lg:justify-between lg:p-8'
          )}
        >
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              ReFlow Access
            </div>
            <h1 className="max-w-md text-4xl font-semibold leading-tight text-foreground">
              在统一主题下管理订阅、阅读和 AI 工作流
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              认证页、仪表盘和高频工作流共享同一套视觉语言，亮暗模式切换贯穿整个站点
            </p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/60 p-5">
            <p className="text-sm font-medium text-foreground">统一认证体验</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              输入、验证、错误反馈、提交状态与主题切换保持一致，减少页面间的体验跳变
            </p>
          </div>
        </div>

        {/* Right panel - Form */}
        <Card
          variant="default"
          padding="none"
          className={cn(
            'border-border/50 bg-card/90 backdrop-blur-xl',
            'shadow-lg'
          )}
        >
          <div className="space-y-6 p-6 sm:p-8">
            <div className="space-y-3">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                ReFlow
              </Link>
              <div>
                <h2 className="text-3xl font-semibold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </div>

            {children}

            <div className="border-t border-border/50 pt-6 text-sm text-muted-foreground">
              {footer}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
