import { forwardRef } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-brand text-brand-ink hover:bg-brand-strong shadow-sm",
  secondary: "bg-surface text-ink border border-line hover:bg-muted",
  ghost: "text-ink-soft hover:bg-muted hover:text-ink",
  soft: "bg-brand-soft text-brand hover:bg-brand/15",
  danger: "bg-danger text-white hover:bg-danger/90 dark:text-canvas",
  "danger-ghost": "text-danger hover:bg-danger-soft",
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg",
  "icon-sm": "h-8 w-8 rounded-lg",
};

export const buttonClass = ({ variant = "primary", size = "md", className } = {}) =>
  clsx(
    "inline-flex shrink-0 items-center justify-center font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className
  );

export const Button = forwardRef(function Button(
  { variant, size, className, loading, disabled, children, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonClass({ variant, size, className })}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export function ButtonLink({ variant, size, className, ...props }) {
  return <Link className={buttonClass({ variant, size, className })} {...props} />;
}

export function IconButton({ label, size = "icon", variant = "ghost", children, ...props }) {
  return (
    <Button aria-label={label} title={label} size={size} variant={variant} {...props}>
      {children}
    </Button>
  );
}
