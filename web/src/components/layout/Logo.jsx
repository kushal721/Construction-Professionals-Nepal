import { Link } from "react-router-dom";
import clsx from "clsx";

export function Logo({ className, to = "/" }) {
  return (
    <Link to={to} className={clsx("inline-flex items-center gap-2.5", className)} aria-label="Construction Professionals Nepal home">
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="8" className="fill-brand" />
        <path d="M8 23V14l8-6 8 6v9h-5v-6h-6v6z" className="fill-brand-ink" />
      </svg>
      <span className="leading-none">
        <span className="block font-display text-[17px] font-semibold tracking-tight">ConstructionPro</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Professionals Nepal</span>
      </span>
    </Link>
  );
}
