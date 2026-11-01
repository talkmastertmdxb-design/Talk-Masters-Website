import { useSyncExternalStore } from "react";

const MINUTE_MS = 60_000;

const subscribe = (onChange: () => void): (() => void) => {
  const timer = window.setInterval(onChange, MINUTE_MS);
  return () => window.clearInterval(timer);
};

/** Rounded to the minute, so the snapshot stays stable between renders. */
const toMinute = (time: number): number => Math.floor(time / MINUTE_MS);
const currentMinute = (): number => toMinute(Date.now());

/**
 * The current time, to the minute. While prerendering and hydrating it is `serverNow` (an ISO
 * time from renderedAt(), at most an hour old), or null without one: anything date-based then
 * renders a timeless fallback first. Either way the server and the first client render agree,
 * so there is no hydration mismatch, and the live clock takes over right after.
 */
export function useNow(serverNow?: string): Date | null {
  const serverMinute = serverNow ? toMinute(Date.parse(serverNow)) : null;
  const minute = useSyncExternalStore(subscribe, currentMinute, () => serverMinute);
  return minute === null ? null : new Date(minute * MINUTE_MS);
}
