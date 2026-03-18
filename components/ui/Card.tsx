import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "glass" | "elevated";
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padding = "md", variant = "default", className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          // Default variant - subtle glass effect
          variant === "default" && [
            "border border-border/50 bg-card/80 backdrop-blur-xl",
            "shadow-md",
            "hover:shadow-lg",
            "hover:border-border/70",
          ],
          // Glass variant - more prominent glass effect
          variant === "glass" && [
            "border border-white/10 bg-white/5 backdrop-blur-2xl",
            "shadow-lg",
            "hover:shadow-xl",
            "hover:bg-white/8",
          ],
          // Elevated variant - more shadow depth
          variant === "elevated" && [
            "border border-border/30 bg-card shadow-xl",
            "hover:shadow-2xl",
            "hover:border-border/50",
          ],
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-foreground", className)}
    {...props}
  />
));

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
export default Card;
