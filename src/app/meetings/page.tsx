import type { Metadata } from "next";
import { ImageSlot } from "@/components/media/ImageSlot";
import { AddToCalendar } from "@/components/meeting/AddToCalendar";
import { NextMeetingDate } from "@/components/meeting/NextMeetingDate";
import { MeetingsHero } from "@/components/meetings/MeetingsHero";
import { RoleCast } from "@/components/meetings/RoleCast";
import { RunningOrder } from "@/components/meetings/RunningOrder";
import { TimingLab } from "@/components/meetings/TimingLab";
import { RevealScope } from "@/components/motion/RevealScope";
import { StageLight } from "@/components/motion/StageLight";
import { ButtonLink } from "@/components/ui/Button";
import { MeetingEvents, PageBreadcrumb } from "@/components/seo/JsonLd";
import { content } from "@/lib/content";
import { formatClock, meetingSchedule, meetingTimeRange } from "@/lib/content/meeting";

export const metadata: Metadata = {
  title: "Meetings",
  description:
    "What happens at a Talk-Masters Club meeting in Dubai: the running order, every role from Toastmaster of the Day to Timer, and what to expect as a guest.",
  alternates: { canonical: "/meetings" },
};

/** Plan.md Meetings page: what a meeting is, minute by minute, role by role, and how to visit. */
export default function MeetingsPage() {
  const { meeting } = content.settings;
  const { timing } = content.meetingGuide;
  const arrive = formatClock(meeting.arriveTime ?? meeting.startTime);

  const guestSteps = [
    {
      title: `Arrive from ${arrive}`,
      text: "Someone from the club meets you at the door, signs you in and finds you a seat.",
    },
    {
      title: "Watch the meeting unfold",
      text: "Speeches, Table Topics, evaluations, all on the running order above. No one calls on you without asking first.",
    },
    {
      title: "Try a Table Topic, if you like",
      text: "The Table Topics Master may invite guests to answer a question. A smile and “not today” is a perfectly good answer.",
    },
    {
      title: "Vote, then tell us what you thought",
      text: "You get a ballot for the best speaker, evaluator and Table Topics answer, and a minute at the end to share your thoughts.",
    },
  ];

  return (
    <RevealScope as="main" id="main">
      <PageBreadcrumb name="Meetings" path="/meetings" />
      <MeetingEvents />
      <MeetingsHero />
      <RunningOrder />
      <RoleCast />

      <section data-header="light" aria-labelledby="guest-title" className="py-section bg-soft-gray">
        <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p data-reveal="up" className="text-eyebrow text-ink-muted">
              If you&apos;re a guest
            </p>
            <h2 id="guest-title" data-reveal="lines" className="text-h2 mt-5 max-w-[14ch]">
              You&apos;re here to watch. <em className="text-tm-blue">Speaking is optional.</em>
            </h2>
            <ol data-reveal="stagger" className="mt-10">
              {guestSteps.map((step, index) => (
                <li
                  key={step.title}
                  className="border-hairline grid grid-cols-[3.25rem_1fr] gap-4 border-t py-6 last:border-b"
                >
                  <span className="text-tm-blue font-serif text-[2rem] leading-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-serif text-[1.375rem] leading-tight">{step.title}</h3>
                    <p className="text-ink-muted mt-2">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid content-start gap-5 sm:grid-cols-2 lg:col-span-7 lg:pt-16">
            <figure data-reveal="image" className="sm:col-span-2">
              <ImageSlot id="meeting-awards" sizes="(min-width: 1280px) 56vw, 100vw" />
              <figcaption className="text-ink-muted mt-3 text-sm">
                The close: trophies for the best speaker, evaluator and Table Topics answer.
              </figcaption>
            </figure>
            <figure data-reveal="image" className="[--slot-ratio:4/3]">
              <ImageSlot
                id="meeting-appreciation"
                sizes="(min-width: 1280px) 28vw, (min-width: 640px) 50vw, 100vw"
              />
              <figcaption className="text-ink-muted mt-3 text-sm">
                Certificates of appreciation thank the people who make a meeting happen.
              </figcaption>
            </figure>
            <figure data-reveal="image" className="[--slot-ratio:4/3]">
              <ImageSlot
                id="meeting-celebration"
                sizes="(min-width: 1280px) 28vw, (min-width: 640px) 50vw, 100vw"
              />
              <figcaption className="text-ink-muted mt-3 text-sm">
                Birthdays and milestones are celebrated together, cake included.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section
        id="timing-lights"
        aria-labelledby="timing-title"
        className="theme-dark bg-ink py-section relative isolate overflow-hidden text-white"
      >
        <StageLight preset="join" />
        <div className="container-site">
          <p data-reveal="up" className="text-eyebrow text-gold">
            The timing lights
          </p>
          <h2 id="timing-title" data-reveal="lines" className="text-h2 mt-5 max-w-[18ch]">
            Green, amber, red. <em className="text-gold">Try it yourself.</em>
          </h2>
          <p data-reveal="text" className="text-lead mt-6 max-w-[52ch] text-white/75">
            The Timer holds up a light so speakers never have to check a watch. Pick a speech and play it, or
            drag through it to see when each light comes on.
          </p>
          <div data-reveal="up" className="mt-14">
            <TimingLab timing={timing} />
          </div>
        </div>
      </section>

      <section data-header="light" aria-labelledby="visit-title" className="py-section bg-white">
        <div className="container-site grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p data-reveal="up" className="text-eyebrow text-ink-muted">
              Come and see one
            </p>
            <h2 id="visit-title" data-reveal="lines" className="text-h2 mt-5 max-w-[16ch]">
              The best way to understand a meeting is to sit in on one.
            </h2>
            <div data-reveal="up" className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/join">Book a guest visit</ButtonLink>
              <ButtonLink href="/join#faq" variant="stone">
                Questions first?
              </ButtonLink>
            </div>
          </div>
          <dl data-reveal="stagger" className="grid gap-6 md:col-span-5">
            <div className="border-hairline border-t pt-4">
              <dt className="text-ink-muted text-sm">Next meeting</dt>
              <dd className="mt-1 font-semibold">
                <span className="text-tm-blue">
                  <NextMeetingDate rule={meeting} />
                </span>
                <span className="text-ink-muted block font-normal">
                  {meetingTimeRange(meeting)} · {meetingSchedule(meeting)}
                </span>
              </dd>
            </div>
            <div className="border-hairline border-t pt-4">
              <dt className="text-ink-muted text-sm">Where</dt>
              <dd className="mt-1">
                {meeting.venue}, {meeting.city}
                {meeting.mapUrl && (
                  <a
                    href={meeting.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link text-tm-blue flex min-h-11 items-center font-semibold"
                  >
                    Get directions<span className="sr-only"> (opens Google Maps in a new tab)</span>
                  </a>
                )}
              </dd>
            </div>
            <div className="border-hairline border-t pt-4">
              <dt className="text-ink-muted text-sm">Add it to your calendar</dt>
              <dd className="text-tm-blue [&_a]:text-tm-blue mt-1">
                <AddToCalendar />
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </RevealScope>
  );
}
