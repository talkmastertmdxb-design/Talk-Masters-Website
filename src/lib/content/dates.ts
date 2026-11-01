const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * "2026-10-27" → "27 October 2026". A calendar day has no time zone, so it is read and printed
 * in UTC: the server and every visitor's browser show the same day.
 */
export function formatDay(isoDay: string): string {
  return dayFormat.format(new Date(`${isoDay}T00:00:00Z`));
}
