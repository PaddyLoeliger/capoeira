import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm", className)}
      {...props}
    />
  );
}
