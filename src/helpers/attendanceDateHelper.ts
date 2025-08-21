import { parse } from "date-fns";
export const timeFormats = [
  "h:mm a",
  "hh:mm a",
  "h.mm a",
  "hh.mm a", // 12h with colon or dot
  "H:mm",
  "HH:mm",
  "H.mm",
  "HH.mm", // 24h with colon or dot
  "h:mma",
  "hh:mma",
  "h.mma",
  "hh.mma", // compact "6:39pm" / "6.39pm"
];

export const toLowerSafe = (s?: string) => {
  return (s ?? "").toLowerCase();
};
export const squash = (s?: string) => {
  // normalize spaces + common time separators to enable fuzzy matching
  return toLowerSafe(s).replace(/[\s:.\-_/]/g, "");
};
export const parseTimeToMinutes = (s?: string): number | null => {
  const raw = (s ?? "").trim();
  if (!raw) return null;
  for (const fmt of timeFormats) {
    const d = parse(raw, fmt, new Date(2000, 0, 1)); // fixed anchor date
    if (!isNaN(d.getTime())) return d.getHours() * 60 + d.getMinutes();
  }
  return null;
};
