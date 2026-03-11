import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "rounded-xl border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        info: "border-primary/20 bg-primary/10 text-foreground",
        success: "border-success/20 bg-success/10 text-foreground",
        warning: "border-warning/30 bg-warning/15 text-foreground",
        destructive: "border-destructive/20 bg-destructive/10 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("font-medium", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-1 text-sm text-muted-foreground", className)} {...props} />;
}

export { Alert, AlertDescription, AlertTitle };
export default Alert;
