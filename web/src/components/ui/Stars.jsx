import { useState } from "react";
import clsx from "clsx";
import { Star } from "lucide-react";

export function StarRating({ value = 0, count, size = "sm", className }) {
  const px = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <span className={clsx("inline-flex items-center gap-1", className)} aria-label={`Rated ${value} out of 5`}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={clsx(px, i <= Math.round(value) ? "fill-[#E8A33D] text-[#E8A33D]" : "fill-line text-line")}
            aria-hidden
          />
        ))}
      </span>
      {count !== undefined && (
        <span className="text-xs font-medium text-ink-faint">
          {value ? Number(value).toFixed(1) : "No ratings"}
          {count ? ` (${count})` : ""}
        </span>
      )}
    </span>
  );
}

export function StarInput({ value = 0, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="inline-flex" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          disabled={disabled}
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(i)}
          className="rounded p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed"
        >
          <Star
            className={clsx("h-7 w-7", i <= shown ? "fill-[#E8A33D] text-[#E8A33D]" : "fill-transparent text-ink-faint/50")}
          />
        </button>
      ))}
    </div>
  );
}
