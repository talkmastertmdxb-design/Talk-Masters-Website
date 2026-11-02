import { Mail, MessageCircle } from "lucide-react";
import { GUEST_MESSAGE, formatPhone, mailtoLink, whatsappLink, type Contact } from "@/lib/content/contact";

interface ContactLinksProps {
  contacts: readonly Contact[];
  /** The club's shared inbox (content/settings.json), listed after the officers. */
  email?: string;
  /** buttons: large, one per channel (the Join page); list: compact lines (the footer). */
  variant?: "buttons" | "list";
}

const buttonCard =
  "group rounded-card hover:border-gold flex min-h-11 items-center gap-4 border border-white/20 p-4 transition-colors duration-(--duration-quick)";
const buttonIcon =
  "bg-maroon group-hover:bg-maroon-hover inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors duration-(--duration-quick)";
const listLink = "nav-link inline-flex min-h-11 items-center gap-2 text-white";

/** How to reach the club: WhatsApp the VP Membership or VP Education, or email the club. */
export function ContactLinks({ contacts, email, variant = "list" }: ContactLinksProps) {
  if (variant === "buttons") {
    return (
      <ul className="grid max-w-xl gap-3 sm:grid-cols-2">
        {contacts.map((contact) => (
          <li key={contact.whatsapp}>
            <a
              href={whatsappLink(contact.whatsapp, GUEST_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonCard}
            >
              <span className={buttonIcon}>
                <MessageCircle aria-hidden="true" className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">WhatsApp {contact.name}</span>
                <span className="text-muted block text-sm">
                  {contact.role}, {formatPhone(contact.whatsapp)}
                </span>
                <span className="sr-only"> (opens WhatsApp in a new tab)</span>
              </span>
            </a>
          </li>
        ))}
        {email && (
          <li>
            <a href={mailtoLink(email)} className={buttonCard}>
              <span className={buttonIcon}>
                <Mail aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">Email the club</span>
                <span className="text-muted block text-sm [overflow-wrap:anywhere]">{email}</span>
              </span>
            </a>
          </li>
        )}
      </ul>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {contacts.map((contact) => (
        <li key={contact.whatsapp}>
          <a
            href={whatsappLink(contact.whatsapp, GUEST_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className={listLink}
          >
            <MessageCircle aria-hidden="true" className="text-gold size-4 shrink-0" />
            <span>
              {contact.name}, {contact.role.replace("Vice President", "VP")}: {formatPhone(contact.whatsapp)}
              <span className="sr-only"> on WhatsApp (opens in a new tab)</span>
            </span>
          </a>
        </li>
      ))}
      {email && (
        <li>
          <a href={mailtoLink(email)} className={listLink}>
            <Mail aria-hidden="true" className="text-gold size-4 shrink-0" />
            <span className="[overflow-wrap:anywhere]">
              <span className="sr-only">Email: </span>
              {email}
            </span>
          </a>
        </li>
      )}
    </ul>
  );
}
