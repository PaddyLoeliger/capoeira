import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center rounded-xl bg-[var(--accent)] px-4 py-2 text-sm text-white hover:opacity-90",
        className,
      )}
      {...props}
    />
  );
}
