import type { ReactNode } from "react";
import type { Contact } from "@/lib/content/contact";

interface OfficerChoiceProps {
  contacts: readonly Contact[];
  /** The chosen officer's WhatsApp number. */
  value: string;
  onChange: (whatsapp: string) => void;
  /** Their photos, rendered on the server (ImageSlot), by WhatsApp number. */
  avatars: Readonly<Record<string, ReactNode>>;
}

/** Who the message goes to, with their face: guests see the person they're about to meet. */
export function OfficerChoice({ contacts, value, onChange, avatars }: OfficerChoiceProps) {
  return (
    <fieldset>
      <legend className="text-sm text-white/70">Send it to</legend>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {contacts.map((option) => (
          <label key={option.whatsapp} className="cursor-pointer">
            <input
              type="radio"
              name="contact"
              value={option.whatsapp}
              checked={value === option.whatsapp}
              onChange={() => onChange(option.whatsapp)}
              className="peer sr-only"
            />
            <span className="rounded-card peer-checked:border-gold peer-focus-visible:outline-gold flex min-h-11 items-center gap-3 border border-white/15 p-3 transition-colors duration-(--duration-quick) peer-checked:bg-white/[0.06] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2">
              <OfficerAvatar name={option.name} photo={avatars[option.whatsapp]} size="size-11" />
              <span className="min-w-0 leading-tight">
                <span className="block font-semibold">{option.name}</span>
                <span className="text-muted block text-xs sm:text-sm">
                  {/* Phones: "VP Membership", so the card stays two lines tall. */}
                  <span className="sm:hidden">{option.role.replace("Vice President", "VP")}</span>
                  <span className="hidden sm:inline">{option.role}</span>
                </span>
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

interface OfficerAvatarProps {
  name: string;
  photo?: ReactNode;
  /** A Tailwind size class, e.g. "size-11". */
  size: string;
}

/** A round photo, or their initial while no photo is set. */
export function OfficerAvatar({ name, photo, size }: OfficerAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`bg-maroon relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold ring-1 ring-white/20 ${size}`}
    >
      {photo ?? name.charAt(0)}
    </span>
  );
}
