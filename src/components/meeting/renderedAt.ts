import { cacheLife } from "next/cache";

/**
 * When the page was last rendered on the server, refreshed hourly. Date-based copy (the next
 * meeting, the guest form's dates) can then be right in the HTML, so nothing changes size when
 * the browser takes over: no layout shift. useNow() switches to the live clock after hydration.
 */
export async function renderedAt(): Promise<string> {
  "use cache";
  cacheLife("hours");
  return new Date().toISOString();
}
