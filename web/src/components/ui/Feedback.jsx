import clsx from "clsx";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "./Button";

export function Spinner({ className, label = "Loading" }) {
  return (
    <div role="status" className={clsx("flex items-center justify-center py-16 text-ink-faint", className)}>
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={clsx("animate-pulse rounded-xl bg-muted", className)} aria-hidden />;
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={clsx("flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center", className)}>
      {Icon && (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
          <Icon className="h-6 w-6" aria-hidden />
        </div>
      )}
      <h3 className="font-sans text-base font-bold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, className }) {
  return (
    <div className={clsx("flex flex-col items-center rounded-2xl border border-danger/30 bg-danger-soft/50 px-6 py-10 text-center", className)}>
      <AlertTriangle className="mb-3 h-6 w-6 text-danger" aria-hidden />
      <p className="font-semibold text-ink">Something went wrong</p>
      <p className="mt-1 text-sm text-ink-soft">{error?.message || "Please try again."}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

const TONES = {
  neutral: "bg-muted text-ink-soft",
  brand: "bg-brand-soft text-brand",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", TONES[tone], className)}>
      {children}
    </span>
  );
}

const STATUS_TONE = { pending: "warning", confirmed: "success", cancelled: "danger", completed: "info" };

export function StatusBadge({ status }) {
  return (
    <Badge tone={STATUS_TONE[status] || "neutral"} className="capitalize">
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </Badge>
  );
}
