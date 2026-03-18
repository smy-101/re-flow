import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  animate?: boolean;
  variant?: "shimmer" | "pulse" | "ring";
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
  sm: "size-10 w-20",
  md: "size-12 w-24",
  lg: "size-16 w-32",
};

const variantStyles: Record<"shimmer" | "pulse" | "ring", string> = {
  shimmer: "bg-muted",
  pulse: "bg-muted animate-pulse",
  ring: "border border-primary/20 bg-primary/5",
};

export function Skeleton({
  className,
  animate = true,
  variant = "shimmer",
  size = "md",
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg",
        variantStyles[variant],
        sizeClasses[size],
        animate && "animate-shimmer",
        className
      )}
    >
      {variant === "shimmer" && (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-muted to-transparent" />
      )}
    </div>
  );
}
