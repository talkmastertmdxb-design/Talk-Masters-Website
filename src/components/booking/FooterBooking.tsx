"use client";

import { track } from "@vercel/analytics";
import { useId, useState, type FormEvent } from "react";
import { useNow } from "@/components/meeting/useNow";
import { guestMessage, guestRequestSchema } from "@/lib/booking/message";
import { whatsappLink, type Contact } from "@/lib/content/contact";
import { formatMeetingDate, nextMeeting, type MeetingRule } from "@/lib/content/meeting";

interface FooterBookingProps {
  /** The officer who receives footer bookings (the first contact in content/settings.json). */
  contact: Contact;
  meeting: MeetingRule;
}

/**
 * The footer's quick booking, an ink pill on the gold invitation: a name, then WhatsApp opens
 * with the guest message ready for the next meeting. Same message and checks as the /join form;
 * nothing is stored or sent by the site.
 */
export function FooterBooking({ contact, meeting }: FooterBookingProps) {
  const id = useId();
  const now = useNow();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const next = now ? nextMeeting(meeting, now) : null;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = guestRequestSchema.shape.name.safeParse(name);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please tell us your name");
      return;
    }
    setError(null);
    const message = guestMessage({
      name: parsed.data,
      contactName: contact.name,
      meetingLabel: next ? formatMeetingDate(next.start, meeting.timeZone) : null,
    });
    const url = whatsappLink(contact.whatsapp, message);
    track("guest_whatsapp", { officer: contact.role, moment: "none", dated: Boolean(next), from: "footer" });
    const opened = window.open(url, "_blank");
    if (opened) opened.opener = null;
    else window.location.assign(url);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="mt-3 w-full">
      <div className="footer-pill flex items-center gap-2 rounded-full p-1.5 pl-5">
        {/* Distinct from the /join form's "Your name": both can be on one page. */}
        <label htmlFor={`${id}-name`} className="sr-only">
          Name for a quick WhatsApp booking
        </label>
        <input
          id={`${id}-name`}
          name="name"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          className="min-h-11 min-w-0 flex-1 bg-transparent text-white placeholder:text-white/60 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-gold text-ink hover:bg-gold-hover inline-flex min-h-11 shrink-0 items-center rounded-full px-5 text-[0.9375rem] font-semibold transition-colors duration-(--duration-quick)"
        >
          Book on WhatsApp
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-maroon mt-3 text-sm font-semibold">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="text-ink/80 mt-3 text-sm">
          Opens WhatsApp with your message to {contact.name} ready to send.
        </p>
      )}
    </form>
  );
}
