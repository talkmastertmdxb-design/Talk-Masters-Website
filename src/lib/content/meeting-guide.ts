import type { MeetingGuide, MeetingSession } from "./schemas";

export interface Span {
  start: string;
  end: string;
  minutes: number;
}

const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h! * 60 + m!;
};

const toClock = (total: number): string =>
  `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

/** "11:58" + 4 → "12:02". */
export function addMinutes(time: string, minutes: number): string {
  return toClock(toMinutes(time) + minutes);
}

/** A session runs from its first item's start to the end of its last item. */
export function sessionSpan(session: Pick<MeetingSession, "items">): Span {
  const first = session.items[0]!;
  const last = session.items.at(-1)!;
  const end = addMinutes(last.start, last.minutes);
  return { start: first.start, end, minutes: toMinutes(end) - toMinutes(first.start) };
}

/** The whole meeting, first session to last. */
export function meetingSpan(guide: Pick<MeetingGuide, "sessions">): Span {
  const start = sessionSpan(guide.sessions[0]!).start;
  const end = sessionSpan(guide.sessions.at(-1)!).end;
  return { start, end, minutes: toMinutes(end) - toMinutes(start) };
}
