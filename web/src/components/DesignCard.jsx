import { Link } from "react-router-dom";
import clsx from "clsx";
import { Heart, Maximize2 } from "lucide-react";
import { fileUrl } from "../lib/api";
import { formatArea, formatNPR } from "../lib/format";
import { Badge, StarRating } from "./ui";

export function DesignCard({ design, isFavorite, onToggleFavorite, className, actions }) {
  const cover = design.designImages?.[0];
  return (
    <article
      className={clsx(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-lift",
        className
      )}
    >
      <Link to={`/designs/${design._id}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {cover && (
          <img
            src={fileUrl(cover)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        )}
        <Badge className="absolute left-3 top-3 bg-surface/90 text-ink backdrop-blur">{design.designCategory}</Badge>
      </Link>
      {onToggleFavorite && (
        <button
          onClick={() => onToggleFavorite(design._id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-surface/90 text-ink shadow-sm backdrop-blur transition hover:scale-105"
        >
          <Heart className={clsx("h-4 w-4", isFavorite && "fill-brand text-brand")} />
        </button>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-sans text-base font-bold leading-snug">
            <Link to={`/designs/${design._id}`} className="hover:text-brand">
              {design.designName}
            </Link>
          </h3>
          <p className="shrink-0 text-sm font-bold text-brand">{formatNPR(design.estimateCost)}</p>
        </div>
        <p className="mt-0.5 text-sm text-ink-faint">by {design.designer_name}</p>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5" aria-hidden />
            {formatArea(design.area)}
          </span>
          <StarRating value={design.averageRating} count={design.totalRatings} />
        </div>
        {actions && <div className="mt-4 flex gap-2 border-t border-line pt-4">{actions}</div>}
      </div>
    </article>
  );
}

export function DesignCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted pt-4" />
      </div>
    </div>
  );
}
