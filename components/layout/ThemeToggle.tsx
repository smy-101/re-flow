"use client";

import { useSyncExternalStore } from "react";
import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "system";

interface ThemeToggleProps {
  showLabel?: boolean;
}

export default function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const cycleTheme = () => {
    const current = (theme ?? "system") as ThemeMode;

    if (current === "system") {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
      return;
    }

    setTheme(current === "dark" ? "light" : "dark");
  };

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? "md" : "icon"}
      onClick={cycleTheme}
      aria-label="切换主题"
      className={cn(
        "relative overflow-hidden rounded-xl",
        showLabel && "justify-start gap-2"
      )}
    >
      {/* Glow effect */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-xl",
          "transition-opacity duration-500",
          isDark
            ? "bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-100"
            : "opacity-0"
        )}
      />

      {/* Icon container with smooth transition */}
      <span className="relative z-10">
        {mounted ? (
          <span className="relative block">
            {/* Sun icon */}
            <SunMedium
              className={cn(
                "size-[18px] transition-all duration-300",
                isDark
                  ? "absolute inset-0 rotate-90 scale-0 opacity-0"
                  : "rotate-0 scale-100 opacity-100"
              )}
              strokeWidth={1.75}
            />
            {/* Moon icon */}
            <Moon
              className={cn(
                "size-[18px] transition-all duration-300",
                isDark
                  ? "rotate-0 scale-100 opacity-100"
                  : "absolute inset-0 -rotate-90 scale-0 opacity-0"
              )}
              strokeWidth={1.75}
            />
          </span>
        ) : (
          <span className="size-[18px]" />
        )}
      </span>

      {showLabel ? (
        <span className="relative z-10">
          {mounted ? (resolvedTheme === "dark" ? "深色模式" : "浅色模式") : "主题"}
        </span>
      ) : null}
    </Button>
  );
}
