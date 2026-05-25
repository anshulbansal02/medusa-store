"use client";

import { useEffect, useRef } from "react";

import {
  type AnalyticsPayload,
  trackAnalyticsEvent,
} from "@/lib/analytics/events";

type AnalyticsEventOnMountProps = {
  data?: AnalyticsPayload;
  event: string;
};

export function AnalyticsEventOnMount({
  data = {},
  event,
}: AnalyticsEventOnMountProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;
    trackAnalyticsEvent(event, data);
  }, [data, event]);

  return null;
}
