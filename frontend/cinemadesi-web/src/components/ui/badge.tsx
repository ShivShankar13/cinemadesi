import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-sans font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-brand-surface2 border border-brand-border text-brand-textMuted",
        gold:
          "bg-brand-goldGlow border border-brand-goldDim text-brand-gold",
        red:
          "bg-brand-redDim border border-brand-red/40 text-brand-red",
        outline:
          "border border-brand-border text-brand-text",
        solid:
          "bg-brand-text text-brand-bg font-semibold",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] uppercase tracking-wider",
        default: "px-2.5 py-1 text-[11px] uppercase tracking-wider",
        lg: "px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
