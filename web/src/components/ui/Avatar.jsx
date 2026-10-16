import { useState } from "react";
import clsx from "clsx";
import { fileUrl } from "../../lib/api";
import { initials } from "../../lib/format";

const SIZES = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

// Stable warm hue per name so initials avatars are distinguishable.
const PALETTE = [
  "bg-[#F6D9CC] text-[#8F3417]",
  "bg-[#E3E8D5] text-[#3F5222]",
  "bg-[#D9E4EE] text-[#24476B]",
  "bg-[#EDE0F0] text-[#5E2F6B]",
  "bg-[#F4E6C8] text-[#7A5410]",
];
const hue = (name = "") => PALETTE[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];

export function Avatar({ user, src, name, size = "md", online, className }) {
  const [broken, setBroken] = useState(false);
  const label = name ?? user?.username ?? "";
  const image = src ?? user?.profile;
  return (
    <span className={clsx("relative inline-flex shrink-0", className)}>
      {image && !broken ? (
        <img
          src={fileUrl(image)}
          alt=""
          onError={() => setBroken(true)}
          className={clsx("rounded-full object-cover ring-1 ring-line", SIZES[size])}
        />
      ) : (
        <span className={clsx("grid place-items-center rounded-full font-bold", SIZES[size], hue(label))} aria-hidden>
          {initials(label)}
        </span>
      )}
      {online !== undefined && (
        <span
          className={clsx(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-surface",
            online ? "bg-success" : "bg-ink-faint/50"
          )}
          aria-label={online ? "Online" : "Offline"}
        />
      )}
    </span>
  );
}
