import { NextMeetingDate } from "@/components/meeting/NextMeetingDate";
import { StageLight } from "@/components/motion/StageLight";
import { ButtonLink } from "@/components/ui/Button";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { content } from "@/lib/content";
import { formatClock, meetingSchedule, meetingTimeRange } from "@/lib/content/meeting";

const LAMPS = [
  { signal: "green", time: "5:00", label: "Green", meaning: "You've made the minimum" },
  { signal: "amber", time: "6:00", label: "Amber", meaning: "Start bringing it home" },
  { signal: "red", time: "7:00", label: "Red", meaning: "Time to land it" },
] as const;

/**
 * /meetings opening: the words over a moving Aurora, beside the Timing Light, the one object
 * every speaker watches. Its lamps light in turn, green to red, like a 5-7 minute speech
 * (CSS; still and green under reduced motion).
 */
export function MeetingsHero() {
  const { meeting } = content.settings;

  return (
    <section
      aria-labelledby="meetings-title"
      className="theme-dark bg-ink relative isolate flex min-h-dvh items-center overflow-hidden text-white"
    >
      <StageLight preset="meetings" />
      <div className="container-site grid items-center gap-14 pt-32 pb-20 lg:grid-cols-12 lg:gap-10 lg:pt-36">
        <div className="flex flex-col gap-7 lg:col-span-7">
          <p data-reveal="up" className="text-eyebrow text-gold">
            Inside a meeting
          </p>
          <h1 id="meetings-title" data-reveal="lines" className="text-display max-w-[11ch]">
            Every minute has a role.
          </h1>
          {/* Opens with the plain answer, so search and AI answers can quote it as it stands. */}
          <p data-reveal="text" className="text-lead max-w-[44ch] text-white/75">
            Talk-Masters meets on the {meetingSchedule(meeting)} for two structured hours: prepared speeches,
            impromptu Table Topics and supportive evaluations. Here&apos;s the running order, who does what,
            and where you fit in as a guest.
          </p>
          <div data-reveal="up" className="flex flex-wrap gap-3">
            <ButtonLink href="/join">Book a guest visit</ButtonLink>
            <ButtonLink href="#running-order" variant="ghost">
              See the running order
            </ButtonLink>
          </div>
          <dl data-reveal="stagger" className="mt-4 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3">
            <div className="border-hairline-dark border-t pt-4">
              <dt className="text-muted text-sm">Next meeting</dt>
              <dd className="text-gold mt-1 font-semibold">
                <NextMeetingDate rule={meeting} />
              </dd>
            </div>
            <div className="border-hairline-dark border-t pt-4">
              <dt className="text-muted text-sm">Time</dt>
              <dd className="mt-1 text-[0.9375rem] whitespace-nowrap sm:text-base">
                {meetingTimeRange(meeting)}
                <span className="text-muted block text-sm">
                  Doors {formatClock(meeting.arriveTime ?? meeting.startTime)}
                </span>
              </dd>
            </div>
            <div className="border-hairline-dark border-t pt-4 max-sm:col-span-2">
              <dt className="text-muted text-sm">Where</dt>
              <dd className="mt-1">
                {meeting.venue}, {meeting.city}
              </dd>
            </div>
          </dl>
          <LastUpdated date={content.updates.meetings} className="text-muted -mt-2" />
        </div>

        <figure
          data-reveal="up"
          className="flex flex-col items-center gap-6 lg:col-span-5 lg:items-end"
          aria-labelledby="timing-light-caption"
        >
          <ol aria-label="The timer's lights" className="timing-lamp">
            {LAMPS.map((lamp) => (
              <li key={lamp.signal} className="timing-lamp__row">
                <span aria-hidden="true" className={`timing-lamp__bulb timing-lamp__bulb--${lamp.signal}`} />
                <span className="flex flex-col max-sm:items-center">
                  <span className="font-serif text-3xl tabular-nums sm:text-4xl">{lamp.time}</span>
                  <span className="text-sm text-white/70">
                    <span className="font-semibold text-white">{lamp.label}.</span>
                    <span className="max-sm:sr-only"> {lamp.meaning}</span>
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <figcaption id="timing-light-caption" className="text-muted max-w-[34ch] text-sm lg:text-right">
            The timer&apos;s lights, set for a five-to-seven-minute speech. No one watches the clock; everyone
            watches the light.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
