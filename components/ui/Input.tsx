"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      labelClassName,
      error,
      helperText,
      label,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("w-full space-y-2", containerClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className={cn("block text-sm font-medium text-foreground", labelClassName)}
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          data-slot="input"
          className={cn(
            "flex h-11 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50",
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

Input.displayName = "Input";

export { Input };
export default Input;
