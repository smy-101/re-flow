"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import Button from "@/components/ui/Button";

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

  const icon = !mounted ? (
    <Monitor className="size-4" />
  ) : resolvedTheme === "dark" ? (
    <Moon className="size-4" />
  ) : (
    <SunMedium className="size-4" />
  );

  return (
    <Button
      type="button"
      variant="secondary"
      size={showLabel ? "md" : "icon"}
      onClick={cycleTheme}
      aria-label="切换主题"
      className={showLabel ? "justify-start" : undefined}
    >
      {icon}
      {showLabel ? <span>{mounted ? (resolvedTheme === "dark" ? "深色模式" : "浅色模式") : "主题"}</span> : null}
    </Button>
  );
}
