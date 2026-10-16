import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { IconButton } from "./Button";

const pageList = (page, pages) => {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i && p - sorted[i - 1] > 1 ? ["…", p] : [p]));
};

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <IconButton label="Previous page" variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </IconButton>
      {pageList(page, pages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-ink-faint">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={clsx(
              "h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition",
              p === page ? "bg-ink text-canvas" : "text-ink-soft hover:bg-muted"
            )}
          >
            {p}
          </button>
        )
      )}
      <IconButton label="Next page" variant="secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        <ChevronRight className="h-4 w-4" />
      </IconButton>
    </nav>
  );
}
