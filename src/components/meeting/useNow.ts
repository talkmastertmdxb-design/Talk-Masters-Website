import { useSyncExternalStore } from "react";

const MINUTE_MS = 60_000;

const subscribe = (onChange: () => void): (() => void) => {
  const timer = window.setInterval(onChange, MINUTE_MS);
  return () => window.clearInterval(timer);
};

/** Rounded to the minute, so the snapshot stays stable between renders. */
const currentMinute = (): number => Math.floor(Date.now() / MINUTE_MS);
const noTimeOnServer = (): null => null;

/**
 * The current time, to the minute, or null while prerendering and hydrating. Pages are
 * static, so anything date-based renders a timeless fallback first and the real value
 * right after hydration: no stale dates baked into the HTML, no hydration mismatch.
 */
export function useNow(): Date | null {
  const minute = useSyncExternalStore(subscribe, currentMinute, noTimeOnServer);
  return minute === null ? null : new Date(minute * MINUTE_MS);
}
