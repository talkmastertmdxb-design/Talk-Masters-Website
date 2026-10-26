import { CheckCheck, SendHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import type { Contact } from "@/lib/content/contact";
import { OfficerAvatar } from "./OfficerChoice";

interface ChatPreviewProps {
  contact: Contact;
  message: string;
  /** "10:24", or null before the page knows the time. */
  time: string | null;
  /** phone: a handset floating over the stage art (wide screens); bubble: the message alone (phones). */
  variant: "phone" | "bubble";
  /** The officer's photo, for the chat header. */
  avatar?: ReactNode;
}

function Bubble({ message, time }: Pick<ChatPreviewProps, "message" | "time">) {
  return (
    <div className="bg-tm-blue ml-auto max-w-[92%] rounded-2xl rounded-br-sm px-3.5 pt-2.5 pb-1.5 text-[0.9375rem] leading-snug text-white shadow-[0_8px_24px_-12px_rgb(0_0_0/0.8)]">
      <p data-chat-message className="[overflow-wrap:anywhere] whitespace-pre-line">
        {message}
      </p>
      <p className="mt-1 flex items-center justify-end gap-1 text-[0.6875rem] text-white/70">
        {time ?? "now"}
        <CheckCheck aria-hidden="true" className="text-gold size-3.5" strokeWidth={1.5} />
      </p>
    </div>
  );
}

/**
 * What the officer will receive, updating as the guest types. Shown, not sent:
 * the message only leaves when the guest presses send inside WhatsApp.
 */
export function ChatPreview({ contact, message, time, variant, avatar }: ChatPreviewProps) {
  const label = `Preview of your WhatsApp message to ${contact.name}`;

  if (variant === "bubble") {
    return (
      <figure aria-label={label} className="rounded-card border-hairline-dark border bg-black/20 p-4">
        <figcaption className="text-muted mb-3 text-sm">
          Your message to {contact.name}, {contact.role}
        </figcaption>
        <Bubble message={message} time={time} />
      </figure>
    );
  }

  return (
    <figure
      aria-label={label}
      className="bg-surface w-[17.5rem] rotate-[2.5deg] rounded-[2.25rem] border border-white/10 p-2 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]"
    >
      <div className="bg-ink flex h-[31rem] flex-col overflow-hidden rounded-[1.8rem]">
        <div className="mx-auto mt-2 h-1.5 w-16 rounded-full bg-white/15" aria-hidden="true" />
        <figcaption className="border-hairline-dark flex items-center gap-3 border-b px-4 py-3">
          <OfficerAvatar name={contact.name} photo={avatar} size="size-9" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-semibold">{contact.name}</span>
            <span className="text-muted block truncate text-xs">{contact.role}</span>
          </span>
        </figcaption>
        <div className="flex flex-1 flex-col justify-end overflow-hidden bg-[radial-gradient(rgb(255_255_255/0.05)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,transparent,black_18%)] [background-size:14px_14px] px-3 pb-3">
          <p className="text-muted mx-auto mb-3 rounded-full bg-white/5 px-3 py-1 text-[0.6875rem]">
            Ready to send in WhatsApp
          </p>
          <Bubble message={message} time={time} />
        </div>
        <div aria-hidden="true" className="flex items-center gap-2 px-3 pb-4">
          <span className="flex-1 rounded-full bg-white/5 px-4 py-2 text-xs text-white/60">Message</span>
          <span className="bg-gold text-ink inline-flex size-9 items-center justify-center rounded-full">
            <SendHorizontal className="size-4" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </figure>
  );
}
