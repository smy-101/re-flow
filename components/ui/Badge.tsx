import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
  {
    variants: {
      variant: {
        default: [
          "border-transparent bg-secondary/80 text-secondary-foreground",
          "backdrop-blur-sm",
        ],
        primary: [
          "border-primary/20 bg-primary/10 text-primary",
          "backdrop-blur-sm",
          "shadow-[0_1px_4px_rgba(var(--primary),0.15)]",
        ],
        success: [
          "border-success/20 bg-success/10 text-success",
          "backdrop-blur-sm",
          "shadow-[0_1px_4px_rgba(var(--success),0.15)]",
        ],
        warning: [
          "border-warning/20 bg-warning/10 text-warning-foreground",
          "backdrop-blur-sm",
          "shadow-[0_1px_4px_rgba(var(--warning),0.12)]",
        ],
        destructive: [
          "border-destructive/20 bg-destructive/10 text-destructive",
          "backdrop-blur-sm",
          "shadow-[0_1px_4px_rgba(var(--destructive),0.15)]",
        ],
        outline: [
          "border-border/60 bg-transparent text-muted-foreground",
          "hover:border-border hover:bg-secondary/30",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
export default Badge;
