import type { Industry } from "@/types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const TMDB_IMAGE_PREFIX = "https://image.tmdb.org/t/p/w500";

export const INDUSTRIES: { value: Industry; label: string; emoji: string }[] = [
  { value: "BOLLYWOOD", label: "Bollywood", emoji: "✦" },
  { value: "TAMIL",     label: "Tamil",     emoji: "✦" },
  { value: "TELUGU",    label: "Telugu",    emoji: "✦" },
  { value: "MALAYALAM", label: "Malayalam", emoji: "✦" },
  { value: "KANNADA",   label: "Kannada",   emoji: "✦" },
  { value: "MARATHI",   label: "Marathi",   emoji: "✦" },
];

/**
 * Maps an industry enum to a brand-color hex (matches tailwind.config.ts).
 * Used by IndustryBadge + sparkles around posters.
 */
export const INDUSTRY_COLORS: Record<Industry, string> = {
  BOLLYWOOD: "#E8504B",
  TAMIL:     "#F97316",
  TELUGU:    "#22C55E",
  MALAYALAM: "#3B82F6",
  KANNADA:   "#EAB308",
  MARATHI:   "#A855F7",
  OTHER:     "#7A7570",
};

export const MOOD_TAGS = [
  "FEEL_GOOD",
  "CRY_IT_OUT",
  "LAUGH",
  "THRILLER",
  "INTENSE",
  "LIGHT",
  "DATE_NIGHT",
  "MIND_BENDER",
] as const;
export type MoodTag = (typeof MOOD_TAGS)[number];

export const OTT_PLATFORMS = [
  { value: "NETFLIX",  label: "Netflix" },
  { value: "PRIME",    label: "Prime Video" },
  { value: "HOTSTAR",  label: "Hotstar" },
  { value: "ZEE5",     label: "Zee5" },
  { value: "SONYLIV",  label: "SonyLIV" },
  { value: "MXPLAYER", label: "MX Player" },
  { value: "OTHER",    label: "Other" },
] as const;
