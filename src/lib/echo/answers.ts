import {
  formatClock,
  formatMeetingDate,
  meetingSchedule,
  meetingTimeRange,
  nextMeeting,
} from "@/lib/content/meeting";
import type { EchoToken, Settings } from "@/lib/content/schemas";

export type EchoFacts = Record<EchoToken, string>;

/**
 * The live facts an answer can name as {token}, from the same settings the site shows, so Echo
 * never disagrees with the page. `now` decides the next meeting.
 */
export function echoFacts(meeting: Settings["meeting"], now: Date): EchoFacts {
  const next = nextMeeting(meeting, now);
  return {
    schedule: meetingSchedule(meeting),
    time: meetingTimeRange(meeting),
    start: formatClock(meeting.startTime),
    arrive: formatClock(meeting.arriveTime ?? meeting.startTime),
    venue: `${meeting.venue}, ${meeting.city}`,
    nextMeeting: next
      ? `on ${formatMeetingDate(next.start, meeting.timeZone)}`
      : "still to be announced: ask us on WhatsApp",
    mapUrl: meeting.mapUrl ?? "",
  };
}

/** Fills an answer's {tokens}; a link left with no address keeps only its words. */
export function fillAnswer(answer: string, facts: EchoFacts): string {
  return answer
    .replace(/\{(\w+)\}/g, (whole, token: string) => (token in facts ? facts[token as EchoToken] : whole))
    .replace(/\[([^\]]+)\]\(\)/g, "$1");
}
