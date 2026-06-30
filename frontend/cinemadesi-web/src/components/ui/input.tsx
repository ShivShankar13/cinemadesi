"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg bg-brand-surface3 border border-brand-border " +
          "px-4 py-2 text-sm text-brand-text placeholder:text-brand-textMuted " +
          "transition-colors duration-150 " +
          "focus:border-brand-gold focus:outline-none focus:ring-0 " +
          "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
