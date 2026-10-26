import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { WhatsAppContacts } from "@/components/ui/WhatsAppContacts";
import { VoiceLine } from "@/components/signature/VoiceLine";
import { content } from "@/lib/content";
import { meetingSchedule, meetingTimeRange } from "@/lib/content/meeting";
import { clubFacts } from "@/lib/content/people";
import { buildYear } from "@/lib/site";
import type { NavItem } from "./SiteHeader";
import { Wordmark } from "./Wordmark";

interface SiteFooterProps {
  items: readonly NavItem[];
}

/** The Close: the last call to action, then everything a guest needs to find us. */
export function SiteFooter({ items }: SiteFooterProps) {
  const { meeting, contacts, clubName, parentOrganisation, tagline, socials } = content.settings;
  const facts = clubFacts(content.history);

  return (
    <footer className="theme-dark footer-glow grain bg-ink relative isolate overflow-hidden text-white">
      <section aria-labelledby="guest-band" className="cta-band relative isolate overflow-hidden">
        {/* Stage light: navy, maroon and a gold glow drifting slowly under a film grain. */}
        <div aria-hidden="true" className="cta-band__flow" />
        <div aria-hidden="true" className="cta-band__grain" />
        <div className="container-site relative pt-32 pb-24 text-center md:pt-40">
          <h2 id="guest-band" className="text-h1 mx-auto max-w-[14ch]">
            Ready to become a better speaker?
          </h2>
          <p className="text-lead mx-auto mt-6 max-w-[46ch] text-white/75">
            Come to your first meeting as our guest. It&apos;s free, and we&apos;ll always ask for your
            consent before calling on you.
          </p>
          <div className="mx-auto mt-10 flex max-w-xs flex-col items-center gap-3">
            <ButtonLink href="/join">Book a guest visit</ButtonLink>
            <VoiceLine variant="underline" className="text-gold h-6 w-56" />
          </div>
        </div>
      </section>

      <div className="container-site border-hairline-dark grid gap-12 border-t py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Wordmark size={64} />
          <p className="mt-6 max-w-[34ch] text-white/70">
            {tagline}. Speaking together since {content.history.foundedYear}, and open to everyone, of every
            age and background.
          </p>
          {facts.length > 0 && <p className="text-muted mt-4 text-sm">{facts.join(" · ")}</p>}
          {socials.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold">Follow the club</h3>
              <SocialLinks links={socials} name={clubName} className="mt-3 text-white/85" />
            </div>
          )}
        </div>

        <div className="md:col-span-4">
          <h3 className="font-semibold">Meetings</h3>
          <p className="mt-3 text-white/70">
            {meetingSchedule(meeting)}
            <br />
            {meetingTimeRange(meeting)}
            <br />
            {meeting.venue}, {meeting.city}
          </p>
          <h3 className="mt-8 font-semibold">WhatsApp us</h3>
          <div className="mt-2">
            <WhatsAppContacts contacts={contacts} />
          </div>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <h3 className="font-semibold">Explore</h3>
          <ul className="mt-3 flex flex-col gap-2 text-white/70">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/join" className="nav-link">
                Book a guest visit
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="container-site border-hairline-dark text-muted flex flex-col gap-3 border-t py-8 text-sm md:flex-row md:justify-between">
        <p>
          © {buildYear} {clubName}, a club of {parentOrganisation}.{" "}
          <Link href="/credits" className="nav-link">
            Photo credits
          </Link>
        </p>
        {/* TODO(launch): replace with the trademark notice required by the Toastmasters brand portal. */}
        <p className="max-w-[60ch]">
          Toastmasters International and its logo are trademarks of {parentOrganisation}.
        </p>
      </div>
    </footer>
  );
}
