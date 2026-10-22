"use client";

import { meetingDayLabel, meetingSchedule, nextMeeting, type MeetingRule } from "@/lib/content/meeting";
import { useNow } from "./useNow";

interface NextMeetingDateProps {
  rule: MeetingRule;
  /** "Sunday 1 November" or "Sun 1 Nov". */
  style?: "long" | "short";
}

/**
 * The next meeting's date ("Today", "Tomorrow", "Sunday 1 November"), worked out in the
 * visitor's browser. Before hydration (and without JavaScript) it shows the schedule instead.
 */
export function NextMeetingDate({ rule, style = "long" }: NextMeetingDateProps) {
  const now = useNow();
  const next = now && nextMeeting(rule, now);

  if (!now || !next) return <span data-next-meeting="pending">{meetingSchedule(rule, style)}</span>;

  return (
    <time data-next-meeting={next.date} dateTime={next.start.toISOString()}>
      {meetingDayLabel(next.start, rule.timeZone, now, style)}
    </time>
  );
}
