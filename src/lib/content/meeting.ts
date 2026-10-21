import type { Settings } from "./schemas";

type MeetingTimes = Pick<Settings["meeting"], "startTime" | "durationMinutes">;

const MINUTES_PER_DAY = 24 * 60;

/** 630 → "10:30 am", 750 → "12:30 pm". */
function clockTime(totalMinutes: number): string {
  const minutes = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(minutes / 60);
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes % 60).padStart(2, "0")} ${hours < 12 ? "am" : "pm"}`;
}

/** The meeting's start and end for display, e.g. "10:30 am – 12:30 pm". */
export function meetingTimeRange({ startTime, durationMinutes }: MeetingTimes): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const start = hours! * 60 + minutes!;
  return `${clockTime(start)} – ${clockTime(start + durationMinutes)}`;
}
