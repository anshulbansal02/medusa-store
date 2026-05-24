"use client";

import { useLinkStatus } from "next/link";

import { cn } from "@/lib/utils";

export function LinkPendingIndicator({ className }: { className?: string }) {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-1.5 shrink-0 rounded-full bg-current opacity-0 transition-opacity delay-100 duration-200",
        pending ? "animate-pulse opacity-40" : "",
        className,
      )}
    />
  );
}
