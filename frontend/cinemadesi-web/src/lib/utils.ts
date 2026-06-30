import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Conditional class-name helper used across the app.
 *
 * Combines {@link clsx} (for conditional joining) with
 * {@link twMerge} (to dedupe conflicting Tailwind classes).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
