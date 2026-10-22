"use client";

import { track } from "@vercel/analytics";
import { MessageCircle, UserRound } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
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
import { whatsappLink, type Contact } from "@/lib/content/contact";
import { formatMeetingDate, upcomingMeetings, type MeetingRule } from "@/lib/content/meeting";
import { ChatPreview } from "./ChatPreview";
import { ChoicePill } from "./ChoicePill";
import { StageIllustration } from "./StageIllustration";

interface GuestFormProps {
  /** Officers guests can message, first one preselected (content/settings.json). */
  contacts: readonly Contact[];
  meeting: MeetingRule;
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
export function GuestForm({ contacts, meeting }: GuestFormProps) {
  const id = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const now = useNow();

  const [name, setName] = useState("");
  const [meetingChoice, setMeetingChoice] = useState<string | null>(null);
  const [moment, setMoment] = useState<Moment | "">("");
  const [note, setNote] = useState("");
  const [contactNumber, setContactNumber] = useState(contacts[0]!.whatsapp);
  const [errors, setErrors] = useState<Errors>({});
  const [sentTo, setSentTo] = useState<{ url: string; name: string } | null>(null);

  const dates = now ? upcomingMeetings(meeting, now, MEETING_CHOICES) : [];
  const chosenMeeting = meetingChoice ?? dates[0]?.date ?? UNSURE;
  const chosenDate = dates.find((date) => date.date === chosenMeeting);
  const contact = contacts.find((option) => option.whatsapp === contactNumber) ?? contacts[0]!;

  const message = guestMessage({
    name,
    contactName: contact.name,
    meetingLabel: chosenDate ? formatMeetingDate(chosenDate.start, meeting.timeZone) : null,
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
    setSentTo({ url, name: contact.name });
  };

  const time = now ? clockFormat.format(now) : null;

  return (
    // overflow-clip, not overflow-hidden: hidden would stop the stage from sticking.
    <div className="rounded-panel border-hairline-dark bg-ink grid overflow-clip border lg:grid-cols-12">
      <div className="lg:col-span-7">
        {/* Wide screens: the stage stays in view while the form scrolls, so the preview is always beside it. */}
        <div className="relative h-60 overflow-clip sm:h-80 lg:sticky lg:top-0 lg:h-[min(100dvh,52rem)]">
          {/* Phones: zoom onto the lectern and the guest's chair, so the banner reads at a glance. */}
          <StageIllustration
            guestName={name}
            className="absolute inset-0 size-full origin-[37.5%_70%] max-lg:scale-[1.8]"
          />
          <div className="absolute inset-y-0 right-8 hidden items-center lg:flex xl:right-14">
            <ChatPreview variant="phone" contact={contact} message={message} time={time} />
          </div>
        </div>
      </div>

      <div className="border-hairline-dark p-6 sm:p-10 lg:col-span-5 lg:border-l xl:p-12">
        <p className="text-eyebrow text-gold">Free · You never have to speak</p>
        <h1 className="text-h2 mt-4">Book a guest visit</h1>
        <p className="mt-4 max-w-[40ch] text-white/75">
          Tell us a little about you. WhatsApp opens with your message ready, and we&apos;ll save you a seat.
        </p>

        <form noValidate onSubmit={onSubmit} className="mt-8 flex flex-col gap-7">
          <div className="rounded-card border-hairline-dark focus-within:border-gold/70 border bg-white/[0.03] px-5 py-4 transition-colors duration-(--duration-quick)">
            <label htmlFor={`${id}-name`} className="text-sm text-white/70">
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
            <legend className="text-sm text-white/70">Which meeting?</legend>
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
            <legend className="text-sm text-white/70">
              What&apos;s coming up for you? <span className="text-white/50">(optional)</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {MOMENT_IDS.map((option) => (
                <ChoicePill
                  key={option}
                  name="moment"
                  value={option}
                  checked={moment === option}
                  onSelect={(value) => setMoment(value as Moment | "")}
                >
                  {MOMENTS[option].label}
                </ChoicePill>
              ))}
            </div>
          </fieldset>

          <div className="rounded-card border-hairline-dark focus-within:border-gold/70 border bg-white/[0.03] px-5 py-4 transition-colors duration-(--duration-quick)">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor={`${id}-note`} className="text-sm text-white/70">
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

          <fieldset>
            <legend className="text-sm text-white/70">Send it to</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {contacts.map((option) => (
                <label key={option.whatsapp} className="cursor-pointer">
                  <input
                    type="radio"
                    name="contact"
                    value={option.whatsapp}
                    checked={contactNumber === option.whatsapp}
                    onChange={() => setContactNumber(option.whatsapp)}
                    className="peer sr-only"
                  />
                  <span className="rounded-card peer-checked:border-gold peer-focus-visible:outline-gold flex min-h-11 items-center gap-3 border border-white/15 p-3 transition-colors duration-(--duration-quick) peer-checked:bg-white/[0.06] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2">
                    <span
                      aria-hidden="true"
                      className="bg-maroon inline-flex size-10 shrink-0 items-center justify-center rounded-full font-semibold"
                    >
                      {option.name.charAt(0)}
                    </span>
                    <span className="leading-tight">
                      <span className="block font-semibold">{option.name}</span>
                      <span className="text-muted block text-sm">{option.role}</span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="lg:hidden">
            <ChatPreview variant="bubble" contact={contact} message={message} time={time} />
          </div>

          <div>
            <button
              type="submit"
              className="bg-maroon hover:bg-maroon-hover inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-7 font-semibold text-white transition-[background-color,box-shadow] duration-(--duration-quick) ease-(--ease-deliver) hover:shadow-[0_0_0_6px_rgb(214_176_106/0.18)]"
            >
              <MessageCircle aria-hidden="true" className="size-5" strokeWidth={1.5} />
              Open in WhatsApp
              <span className="sr-only"> (opens in a new tab)</span>
            </button>
            <p className="text-muted mt-3 text-center text-sm">
              Nothing is sent until you press send in WhatsApp. This site doesn&apos;t store your details.
            </p>
            <p role="status" className="mt-4 text-center text-sm text-white/85">
              {sentTo && (
                <>
                  WhatsApp is opening with your message to {sentTo.name}. Press send there to book your seat.{" "}
                  <a
                    href={sentTo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link text-gold"
                  >
                    Didn&apos;t open?<span className="sr-only"> Open WhatsApp in a new tab</span>
                  </a>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
