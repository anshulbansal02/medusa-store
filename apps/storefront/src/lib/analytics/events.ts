"use client";

export type AnalyticsValue =
  | boolean
  | number
  | string
  | string[]
  | null
  | undefined;
export type AnalyticsPayload = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    betterstack?: (
      command: "track",
      event: string,
      data?: AnalyticsPayload,
    ) => void;
  }
}

export function trackAnalyticsEvent(
  event: string,
  data: AnalyticsPayload = {},
) {
  if (typeof window === "undefined" || !window.betterstack) {
    return;
  }

  window.betterstack("track", event, data);
}
