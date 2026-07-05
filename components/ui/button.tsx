import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:brightness-105 shadow-subtle",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-subtle",
  ghost: "bg-transparent text-foreground hover:bg-foreground/5",
  outline:
    "bg-transparent border border-border text-foreground hover:bg-foreground/5",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

/**
 * Base button primitive. Variants map to the design system's
 * primary/secondary/accent palette; keep call sites declarative
 * (e.g. <Button variant="secondary" size="lg">) rather than
 * passing raw color classes.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
