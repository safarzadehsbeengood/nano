import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates that a username contains only alphanumeric characters and underscores
 */
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(username);
}
