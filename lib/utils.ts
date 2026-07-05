import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names safely, resolving conflicts
 * (e.g. "p-2 p-4" -> "p-4") in addition to conditional joining.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
