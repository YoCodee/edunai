import { clsx, type ClassValue } from "clsx";

/**
 * Utility function to merge Tailwind classes using only clsx.
 * We removed tailwind-merge to optimize bundle size as per user request.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
