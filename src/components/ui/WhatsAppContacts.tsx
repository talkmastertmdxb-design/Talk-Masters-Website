import { MessageCircle } from "lucide-react";
import { GUEST_MESSAGE, formatPhone, whatsappLink, type Contact } from "@/lib/content/contact";

interface WhatsAppContactsProps {
  contacts: readonly Contact[];
  /** buttons: large, one per officer (the Join page); list: compact lines (the footer). */
  variant?: "buttons" | "list";
}

/** The club's only contact channel for now: WhatsApp the VP Membership or VP Education. */
export function WhatsAppContacts({ contacts, variant = "list" }: WhatsAppContactsProps) {
  if (variant === "buttons") {
    return (
      <ul className="grid max-w-xl gap-3 sm:grid-cols-2">
        {contacts.map((contact) => (
          <li key={contact.whatsapp}>
            <a
              href={whatsappLink(contact.whatsapp, GUEST_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-card hover:border-gold flex min-h-11 items-center gap-4 border border-white/20 p-4 transition-colors duration-(--duration-quick)"
            >
              <span className="bg-maroon group-hover:bg-maroon-hover inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors duration-(--duration-quick)">
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
            className="nav-link inline-flex min-h-11 items-center gap-2 text-white"
          >
            <MessageCircle aria-hidden="true" className="text-gold size-4 shrink-0" />
            <span>
              {contact.name}, {contact.role.replace("Vice President", "VP")}: {formatPhone(contact.whatsapp)}
              <span className="sr-only"> on WhatsApp (opens in a new tab)</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
