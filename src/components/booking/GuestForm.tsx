"use client";

import { track } from "@vercel/analytics";
import { MessageCircle, UserRound } from "lucide-react";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useNow } from "@/components/meeting/useNow";
import {
  guestMessage,
  guestRequestSchema,
  MOMENT_IDS,
  MOMENTS,
  NOTE_MAX,
  UNSURE,
  type Moment,
} from "@/lib/booking/message";
import type { CalendarDetails } from "@/lib/content/calendar";
import { whatsappLink, type Contact } from "@/lib/content/contact";
import {
  formatClock,
  formatMeetingDate,
  invitationDay,
  upcomingMeetings,
  type MeetingRule,
} from "@/lib/content/meeting";
import { AfterSend } from "./AfterSend";
import { ChatPreview } from "./ChatPreview";
import { ChoicePill } from "./ChoicePill";
import { NextSteps } from "./NextSteps";
import { OfficerChoice } from "./OfficerChoice";
import { StageIllustration } from "./StageIllustration";

interface GuestFormProps {
  /** Officers guests can message, first one preselected (content/settings.json). */
  contacts: readonly Contact[];
  meeting: MeetingRule & { arriveTime?: string; guestInfo: readonly { kind: string; text: string }[] };
  /** For "add your visit to your calendar" once WhatsApp opens. */
  calendar: CalendarDetails;
  /** Officer photos, rendered on the server, by WhatsApp number. */
  avatars: Readonly<Record<string, ReactNode>>;
  /** A member's words from the members' video, shown beside the button. */
  quote?: string;
  /** When the page was rendered (renderedAt()), so the dates are in the HTML and nothing shifts. */
  serverNow?: string;
}

type Field = "name" | "meeting" | "note";
type Errors = Partial<Record<Field, string>>;

const MEETING_CHOICES = 3;

const clockFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

/**
 * The guest-visit form. Every answer writes the WhatsApp message live, the chair in the
 * stage art lights up with the guest's name, and "Open in WhatsApp" hands the finished
 * message to the chosen officer. The guest presses send in WhatsApp; this site stores nothing.
 */
export function GuestForm({ contacts, meeting, calendar, avatars, quote, serverNow }: GuestFormProps) {
  const id = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const now = useNow(serverNow);
  const liveNow = useNow();

  const [name, setName] = useState("");
  const [meetingChoice, setMeetingChoice] = useState<string | null>(null);
  const [moment, setMoment] = useState<Moment | "">("");
  const [note, setNote] = useState("");
  const [contactNumber, setContactNumber] = useState(contacts[0]!.whatsapp);
  const [errors, setErrors] = useState<Errors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const dates = now ? upcomingMeetings(meeting, now, MEETING_CHOICES) : [];
  const chosenMeeting = meetingChoice ?? dates[0]?.date ?? UNSURE;
  const chosenDate = dates.find((date) => date.date === chosenMeeting) ?? null;
  const chosenLabel = chosenDate ? formatMeetingDate(chosenDate.start, meeting.timeZone) : null;
  const contact = contacts.find((option) => option.whatsapp === contactNumber) ?? contacts[0]!;
  const weekday = meeting.weekday.charAt(0).toUpperCase() + meeting.weekday.slice(1);
  const invitation =
    now && dates[0] ? invitationDay(dates[0].start, meeting.timeZone, now) : `on a ${weekday}`;

  const message = guestMessage({
    name,
    contactName: contact.name,
    meetingLabel: chosenLabel,
    moment: moment || undefined,
    note,
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = guestRequestSchema.safeParse({
      name,
      meeting: chosenMeeting,
      contact: contact.whatsapp,
      moment,
      note,
    });
    if (!parsed.success) {
      const found: Errors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as Field;
        found[field] ??= issue.message;
      }
      setErrors(found);
      (found.name ? nameRef : noteRef).current?.focus();
      return;
    }

    setErrors({});
    const url = whatsappLink(contact.whatsapp, message);
    track("guest_whatsapp", { officer: contact.role, moment: moment || "none", dated: Boolean(chosenDate) });
    // A new tab on desktop (WhatsApp Web), the app on phones. If a blocker stops the tab, go there directly.
    const opened = window.open(url, "_blank");
    if (opened) opened.opener = null;
    else window.location.assign(url);
    setSentUrl(url);
  };

  // The visitor's own clock, so only once the browser has it ("now" until then, the same width).
  const time = liveNow ? clockFormat.format(liveNow) : null;
  const arriveTime = formatClock(meeting.arriveTime ?? meeting.startTime);
  const arriveNote = meeting.guestInfo
    .filter((info) => info.kind === "parking" || info.kind === "food")
    .map((info) => `${info.text}.`)
    .join(" ");
  const sendingTo = chosenDate
    ? `To ${contact.name} · ${formatMeetingDate(chosenDate.start, meeting.timeZone, "short")}`
    : `To ${contact.name}`;

  return (
    // overflow-clip, not overflow-hidden: hidden would stop the stage and the phone button from sticking.
    // minmax(0, 1fr): the sideways-scrolling chip row must not widen the column past the screen.
    <div className="rounded-panel bg-ink/55 grid grid-cols-[minmax(0,1fr)] overflow-clip border border-white/14 shadow-[0_40px_100px_rgb(0_0_0/0.35)] backdrop-blur-xl lg:grid-cols-12">
      <div className="lg:col-span-6">
        {/* Wide screens: the stage stays in view while the form scrolls, so the preview is always beside it. */}
        <div className="relative h-36 overflow-clip sm:h-56 lg:sticky lg:top-0 lg:h-[min(100dvh,52rem)]">
          {/* Phones: zoom onto the lectern and the guest's chair, so the banner reads at a glance. */}
          <StageIllustration
            guestName={name}
            className="absolute inset-0 size-full origin-[37.5%_64%] max-lg:scale-[1.6]"
          />
          <div className="absolute inset-y-0 right-6 hidden items-center lg:flex xl:right-10">
            <ChatPreview
              variant="phone"
              contact={contact}
              message={message}
              time={time}
              avatar={avatars[contact.whatsapp]}
            />
          </div>
        </div>
      </div>

      {/* The form leads: a lighter panel with a gold edge, so it outweighs the art beside it. */}
      <div className="bg-surface relative p-6 sm:p-10 lg:col-span-6 lg:border-l lg:border-white/10 xl:p-12">
        <span
          aria-hidden="true"
          className="via-gold/60 absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent"
        />
        <p className="text-eyebrow text-gold">Free to attend</p>
        <h1 className="mt-4 font-serif text-[clamp(2.375rem,1.7rem+2.9vw,4.5rem)] leading-[1.04] tracking-[-0.02em]">
          Join us <span data-invitation>{invitation}</span> as our guest
        </h1>
        <p className="mt-4 max-w-[42ch] text-white/80">
          Visiting is free. Tell us your name and pick a date: WhatsApp opens with your message ready, and
          we&apos;ll save you a seat.
        </p>

        <form noValidate onSubmit={onSubmit} className="mt-8 flex flex-col gap-7">
          <div className="rounded-card focus-within:border-gold/70 border border-white/15 bg-white/[0.04] px-5 py-4 transition-colors duration-(--duration-quick)">
            <label htmlFor={`${id}-name`} className="text-sm text-white/75">
              Your name
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                ref={nameRef}
                id={`${id}-name`}
                name="name"
                autoComplete="name"
                required
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${id}-name-error` : undefined}
                placeholder="e.g. Sara Ahmed"
                className="min-h-11 w-full bg-transparent text-lg text-white placeholder:text-white/35 focus:outline-none"
              />
              <UserRound aria-hidden="true" className="size-5 shrink-0 text-white/50" strokeWidth={1.5} />
            </div>
          </div>
          {errors.name && (
            <p id={`${id}-name-error`} className="text-gold -mt-5 text-sm">
              {errors.name}
            </p>
          )}

          <fieldset>
            <legend className="text-sm text-white/75">Which meeting?</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {dates.map((date, index) => (
                <ChoicePill
                  key={date.date}
                  name="meeting"
                  value={date.date}
                  checked={chosenMeeting === date.date}
                  onSelect={(value) => value && setMeetingChoice(value)}
                >
                  {formatMeetingDate(date.start, meeting.timeZone, "short")}
                  {index === 0 && <span className="text-xs opacity-70">next</span>}
                </ChoicePill>
              ))}
              <ChoicePill
                name="meeting"
                value={UNSURE}
                checked={chosenMeeting === UNSURE}
                onSelect={(value) => value && setMeetingChoice(value)}
              >
                Not sure yet
              </ChoicePill>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm text-white/75">
              What&apos;s coming up for you? <span className="text-white/50">(optional)</span>
            </legend>
            {/* Phones: one row that scrolls sideways, instead of four rows of chips. */}
            <div className="mt-3 flex gap-2 max-sm:-mx-6 max-sm:[scrollbar-width:none] max-sm:overflow-x-auto max-sm:px-6 max-sm:pb-1 sm:flex-wrap">
              {MOMENT_IDS.map((option) => (
                <span key={option} className="shrink-0">
                  <ChoicePill
                    name="moment"
                    value={option}
                    checked={moment === option}
                    onSelect={(value) => setMoment(value as Moment | "")}
                  >
                    {MOMENTS[option].label}
                  </ChoicePill>
                </span>
              ))}
            </div>
          </fieldset>

          <div className="rounded-card focus-within:border-gold/70 border border-white/15 bg-white/[0.04] px-5 py-4 transition-colors duration-(--duration-quick)">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor={`${id}-note`} className="text-sm text-white/75">
                Anything we should know? <span className="text-white/50">(optional)</span>
              </label>
              <span aria-hidden="true" className="text-xs text-white/50 tabular-nums">
                {note.length}/{NOTE_MAX}
              </span>
            </div>
            <textarea
              ref={noteRef}
              id={`${id}-note`}
              name="note"
              rows={2}
              maxLength={NOTE_MAX}
              data-lenis-prevent
              value={note}
              onChange={(event) => setNote(event.target.value)}
              aria-invalid={Boolean(errors.note)}
              aria-describedby={errors.note ? `${id}-note-error` : undefined}
              placeholder="I'm a little nervous, I need step-free access…"
              className="mt-1 min-h-11 w-full resize-y bg-transparent text-lg text-white placeholder:text-white/35 focus:outline-none"
            />
          </div>
          {errors.note && (
            <p id={`${id}-note-error`} className="text-gold -mt-5 text-sm">
              {errors.note}
            </p>
          )}

          <OfficerChoice
            contacts={contacts}
            value={contactNumber}
            onChange={setContactNumber}
            avatars={avatars}
          />

          <div className="lg:hidden">
            <ChatPreview variant="bubble" contact={contact} message={message} time={time} />
          </div>

          {/* Phones: the button stays on screen while the form is in view. */}
          <div
            data-send-bar
            className="z-10 max-lg:sticky max-lg:bottom-0 max-lg:-mx-6 max-lg:border-t max-lg:border-white/10 max-lg:bg-[rgb(17_24_39/0.94)] max-lg:px-6 max-lg:pt-3 max-lg:pb-[max(0.75rem,env(safe-area-inset-bottom))] max-lg:backdrop-blur-md"
          >
            <button
              type="submit"
              className="bg-maroon hover:bg-maroon-hover inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-7 font-semibold text-white transition-[background-color,box-shadow] duration-(--duration-quick) ease-(--ease-deliver) hover:shadow-[0_0_0_6px_rgb(214_176_106/0.18)]"
            >
              <MessageCircle aria-hidden="true" className="size-5" strokeWidth={1.5} />
              Open in WhatsApp
              <span className="sr-only"> (opens in a new tab)</span>
            </button>
            <p className="text-muted mt-2 text-center text-xs">{sendingTo}</p>
          </div>

          <p className="text-muted -mt-3 text-center text-sm">
            Nothing is sent until you press send in WhatsApp. This site doesn&apos;t store your details.
          </p>

          <div role="status">
            {sentUrl && (
              <AfterSend
                contactName={contact.name}
                url={sentUrl}
                calendar={calendar}
                visit={chosenDate}
                visitLabel={chosenLabel}
              />
            )}
          </div>

          <NextSteps
            contactName={contact.name}
            arriveTime={arriveTime}
            arriveNote={arriveNote}
            sent={sentUrl !== null}
          />

          {quote && (
            <figure className="border-gold/50 border-l-2 pl-4">
              <blockquote className="font-serif text-lg leading-snug text-white/90 italic">
                “{quote}”
              </blockquote>
              <figcaption className="text-muted mt-2 text-sm">
                A Talk-Masters member, in our members&apos; video
              </figcaption>
            </figure>
          )}
        </form>
      </div>
    </div>
  );
}
