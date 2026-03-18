"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 overflow-hidden",
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-foreground",
          "shadow-[0_2px_8px_rgba(var(--primary),0.25),0_1px_2px_rgba(0,0,0,0.05)]",
          "hover:shadow-[0_4px_16px_rgba(var(--primary),0.35),0_2px_4px_rgba(0,0,0,0.08)]",
          "hover:brightness-110",
          "active:scale-[0.98]",
        ],
        secondary: [
          "border border-border/60 bg-card/80 backdrop-blur-sm text-foreground",
          "shadow-sm",
          "hover:bg-secondary hover:border-border/80",
          "hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
          "active:scale-[0.98]",
        ],
        outline: [
          "border border-border/50 bg-transparent text-foreground",
          "hover:bg-secondary/50 hover:border-border/70",
          "active:scale-[0.98]",
        ],
        ghost: [
          "bg-transparent text-muted-foreground",
          "hover:bg-secondary/60 hover:text-foreground",
          "active:scale-[0.98]",
        ],
        danger: [
          "bg-destructive text-destructive-foreground",
          "shadow-[0_2px_8px_rgba(var(--destructive),0.25)]",
          "hover:brightness-110 hover:shadow-[0_4px_16px_rgba(var(--destructive),0.35)]",
          "active:scale-[0.98]",
        ],
      },
      size: {
        sm: "h-9 px-3.5 text-xs rounded-lg",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-5 text-sm",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Luminous glow overlay for primary/secondary variants */}
        {variant === "primary" && (
          <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}
        {variant === "secondary" && (
          <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}
        {/* Loading spinner */}
        {loading ? (
          <LoaderCircle className="relative z-10 size-4 animate-spin" />
        ) : null}
        {/* Button content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
