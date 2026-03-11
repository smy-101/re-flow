"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, containerClassName, error, label, helperText, id, ...props },
    ref
  ) => {
    const textAreaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("w-full space-y-2", containerClassName)}>
        {label ? (
          <label htmlFor={textAreaId} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textAreaId}
          className={cn(
            "flex min-h-28 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            error ? "border-destructive focus-visible:ring-destructive/60" : "border-input",
            className
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
export default Textarea;
