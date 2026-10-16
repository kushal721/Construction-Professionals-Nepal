import { format, formatDistanceToNowStrict, isToday, isYesterday, parseISO } from "date-fns";

const toDate = (d) => (d instanceof Date ? d : typeof d === "string" ? parseISO(d) : new Date(d));

// Nepali Rupees, abbreviated to lakh / crore which is how prices are discussed locally.
export const formatNPR = (n, { compact = true } = {}) => {
  const v = Number(n) || 0;
  if (compact) {
    if (v >= 1e7) return `Rs ${trim(v / 1e7)} Cr`;
    if (v >= 1e5) return `Rs ${trim(v / 1e5)} Lakh`;
  }
  return `Rs ${v.toLocaleString("en-IN")}`;
};
const trim = (x) => (Math.round(x * 100) / 100).toString();

export const formatArea = (n) => `${(Number(n) || 0).toLocaleString("en-IN")} sq ft`;

export const formatDate = (d, pattern = "d MMM yyyy") => (d ? format(toDate(d), pattern) : "");

export const formatDay = (d) => (d ? format(toDate(d), "EEE, d MMM") : "");

export const timeAgo = (d) => (d ? `${formatDistanceToNowStrict(toDate(d))} ago` : "");

export const chatTime = (d) => {
  if (!d) return "";
  const date = toDate(d);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "d MMM");
};

// "14:30" -> "2:30 PM"
export const formatTime = (hhmm) => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
};

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || "?";

export const plural = (n, word, pluralWord = `${word}s`) => `${n} ${n === 1 ? word : pluralWord}`;
