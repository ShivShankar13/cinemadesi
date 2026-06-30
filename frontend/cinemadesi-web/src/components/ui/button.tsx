"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-sans font-medium " +
  "transition-all duration-150 focus-visible:outline-2 focus-visible:outline-brand-gold " +
  "focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary CTA — bold red
        default:
          "bg-brand-red text-white font-semibold hover:bg-[#d24842] active:scale-[0.98]",
        // Gold — secondary luxury accent
        gold:
          "bg-brand-goldGlow border border-brand-goldDim text-brand-gold " +
          "hover:bg-[rgba(232,184,75,0.18)] hover:border-brand-gold active:scale-[0.98]",
        // Surface — outlined neutral
        outline:
          "bg-brand-surface border border-brand-border text-brand-text " +
          "hover:border-brand-borderHi hover:bg-brand-surface2 active:scale-[0.98]",
        // Ghost — text only
        ghost:
          "text-brand-textMuted hover:text-brand-text hover:bg-brand-surface2/60",
        // Destructive — for delete / leave actions
        destructive:
          "bg-brand-redDim border border-brand-red/40 text-brand-red " +
          "hover:bg-brand-red/30 active:scale-[0.98]",
        // Link
        link: "text-brand-gold underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
