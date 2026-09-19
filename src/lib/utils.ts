import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function labelLearning(status: string) {
  switch (status) {
    case "COMFORTABLE":
      return "Comfortable";
    case "TO_LEARN":
      return "To learn";
    case "LEARNING":
      return "Learning";
    default:
      return "Unknown";
  }
}

export function labelVerification(kind: string) {
  switch (kind) {
    case "EXTERNAL_SOURCE":
      return "External source (needs review)";
    case "NEEDS_VERIFICATION":
      return "Needs verification";
    case "KEEP_ONLY":
      return "Keep only";
    case "MEDIUM":
      return "Medium";
    default:
      return "Unverified";
  }
}
