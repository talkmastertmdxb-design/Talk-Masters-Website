import { Car, Clock, Coffee, DoorOpen, Info, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { GuestForm } from "@/components/booking/GuestForm";
import { WalkIntoStrip } from "@/components/booking/WalkIntoStrip";
import { ImageSlot } from "@/components/media/ImageSlot";
import { AddToCalendar } from "@/components/meeting/AddToCalendar";
import { NextMeetingDate } from "@/components/meeting/NextMeetingDate";
import { renderedAt } from "@/components/meeting/renderedAt";
import { StageLight } from "@/components/motion/StageLight";
import { UpcomingEvents } from "@/components/meeting/UpcomingEvents";
import { Faq } from "@/components/sections/Faq";
import { MeetingEvents, PageBreadcrumb } from "@/components/seo/JsonLd";
import { ContactLinks } from "@/components/ui/ContactLinks";
import { content } from "@/lib/content";
import { clubCalendar } from "@/lib/content/club-calendar";
import { formatClock, meetingSchedule, meetingTimeRange } from "@/lib/content/meeting";

const INFO_ICONS: Record<string, LucideIcon> = { parking: Car, food: Coffee, room: DoorOpen, other: Info };

export const metadata: Metadata = {
  title: "Book a guest visit",
  description:
    "Visit a Talk-Masters Club meeting in Dubai as our guest. It's free, and we'll always ask for your consent before calling on you.",
  alternates: { canonical: "/join" },
};

/**
 * Guests book on WhatsApp, the club's most active channel (decided 2026-10-22): the form
 * writes their message and opens WhatsApp with it ready to send to an officer.
 */
export default async function JoinPage() {
  const { meeting, contacts, highlightVideo } = content.settings;
  const serverNow = await renderedAt();
  const arriveTime = formatClock(meeting.arriveTime ?? meeting.startTime);
  // Officer photos render here (ImageSlot reads content on the server) and pass into the client form.
  const avatars = Object.fromEntries(
    contacts.flatMap((contact) =>
      contact.imageSlot
        ? [
            [
              contact.whatsapp,
              <ImageSlot
                key={contact.whatsapp}
                id={contact.imageSlot}
                sizes="48px"
                className="absolute! inset-0 rounded-none!"
              />,
            ],
          ]
        : [],
    ),
  );
  const parkingAndFood = meeting.guestInfo
    .filter((info) => info.kind === "parking" || info.kind === "food")
    .map((info) => `${info.text}.`)
    .join(" ");

  return (
    <main id="main" className="theme-dark bg-ink relative isolate min-h-dvh overflow-clip text-white">
      <PageBreadcrumb name="Book a guest visit" path="/join" />
      <MeetingEvents />
      <StageLight preset="join" />
      <div className="container-site pt-24 pb-8 md:pt-28">
        <GuestForm
          contacts={contacts}
          meeting={meeting}
          calendar={{ ...clubCalendar(), tips: `Arrive from ${arriveTime}. ${parkingAndFood}` }}
          avatars={avatars}
          quote={highlightVideo?.quotes[0]}
          serverNow={serverNow}
        />

        <WalkIntoStrip />

        <dl className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="border-hairline-dark border-t pt-4">
            <dt className="text-muted text-sm">Next meeting</dt>
            <dd className="mt-1">
              <span className="text-gold font-semibold">
                <NextMeetingDate rule={meeting} />
              </span>
              <br />
              {meetingTimeRange(meeting)}
              <br />
              <span className="text-white/70">{meetingSchedule(meeting)}</span>
            </dd>
          </div>
          <div className="border-hairline-dark border-t pt-4">
            <dt className="text-muted text-sm">Where</dt>
            <dd className="mt-1">
              {meeting.venue}, {meeting.city}
              {meeting.mapUrl && (
                <>
                  <br />
                  <a
                    href={meeting.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link text-gold inline-flex min-h-11 items-center"
                  >
                    Get directions<span className="sr-only"> (opens Google Maps in a new tab)</span>
                  </a>
                </>
              )}
            </dd>
          </div>
          <div className="border-hairline-dark border-t pt-4">
            <dt className="text-muted text-sm">Your first visit</dt>
            <dd className="mt-2">
              <ul className="grid gap-2">
                <li className="flex items-start gap-3">
                  <Clock aria-hidden="true" className="text-gold mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
                  Arrive from {arriveTime}
                </li>
                {meeting.guestInfo.map((info) => {
                  const Icon = INFO_ICONS[info.kind] ?? Info;
                  return (
                    <li key={info.text} className="flex items-start gap-3">
                      <Icon
                        aria-hidden="true"
                        className="text-gold mt-0.5 size-4 shrink-0"
                        strokeWidth={1.5}
                      />
                      {info.text}
                    </li>
                  );
                })}
              </ul>
            </dd>
          </div>
        </dl>

        <section
          aria-labelledby="calendar-title"
          className="rounded-card border-hairline-dark mt-12 flex flex-col gap-5 border bg-white/[0.03] p-6 md:flex-row md:items-center md:justify-between md:p-8"
        >
          <div>
            <h2 id="calendar-title" className="text-h3">
              Never miss a meeting
            </h2>
            <p className="text-muted mt-2 max-w-[44ch]">
              Add every {meetingSchedule(meeting).replace(" of every month", "")} meeting to your calendar. It
              updates itself.
            </p>
          </div>
          <AddToCalendar variant="buttons" />
        </section>

        <h2 className="text-eyebrow mt-14 text-white/70">Rather just say hello?</h2>
        <div className="mt-5">
          <ContactLinks contacts={contacts} email={content.settings.contactEmail} variant="buttons" />
        </div>
        <UpcomingEvents events={content.events} timeZone={meeting.timeZone} />
      </div>
      <Faq tone="dark" showContactLink={false} />
    </main>
  );
}
