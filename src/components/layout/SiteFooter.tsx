import Link from "next/link";
import { FooterBooking } from "@/components/booking/FooterBooking";
import { NextMeetingDate } from "@/components/meeting/NextMeetingDate";
import { ContactLinks } from "@/components/ui/ContactLinks";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { VenueMap } from "@/components/ui/VenueMap";
import { content } from "@/lib/content";
import { formatClock, meetingSchedule, meetingTimeRange } from "@/lib/content/meeting";
import { clubFacts } from "@/lib/content/people";
import { buildYear } from "@/lib/site";
import type { NavItem } from "./SiteHeader";
import { Wordmark } from "./Wordmark";

interface SiteFooterProps {
  items: readonly NavItem[];
}

const columnTitle = "text-eyebrow text-white/70";

/**
 * The Close, in Bailey Hart's footer shape: one continuous stage light behind a centred
 * invitation (book on WhatsApp in one step), then the club, its meetings and its links.
 */
export function SiteFooter({ items }: SiteFooterProps) {
  const { meeting, contacts, contactEmail, clubName, parentOrganisation, tagline, socials } =
    content.settings;
  const facts = clubFacts(content.history);

  return (
    <footer className="theme-dark cta-band bg-ink relative isolate overflow-hidden text-white">
      {/* Stage light: navy, maroon and a gold glow drifting slowly under a film grain, behind the whole footer. */}
      <div aria-hidden="true" className="cta-band__flow" />
      <div aria-hidden="true" className="cta-band__grain" />

      <section
        aria-labelledby="guest-band"
        className="container-site relative pt-32 pb-24 text-center md:pt-40 md:pb-32"
      >
        <p className="text-eyebrow text-white/80">
          Next meeting · <NextMeetingDate rule={meeting} /> · {formatClock(meeting.startTime)}
        </p>
        <h2 id="guest-band" className="text-h2 mx-auto mt-5 max-w-[16ch]">
          Ready to become a better speaker?
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-white/75">
          Come to your first meeting as our guest. It&apos;s free, and we&apos;ll always ask for your consent
          before calling on you.
        </p>
        <FooterBooking contact={contacts[0]!} meeting={meeting} />
      </section>

      <div className="container-site relative border-t border-white/14 pt-14 pb-12 md:pt-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Wordmark size={56} />
            <p className="mt-8 max-w-[18ch] text-[1.5rem] leading-tight font-semibold tracking-[-0.01em]">
              {tagline}. Speaking together since {content.history.foundedYear}.
            </p>
            {facts.length > 0 && <p className="mt-4 text-sm text-white/70">{facts.join(" · ")}</p>}
            {socials.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold">Follow the club</h3>
                <SocialLinks links={socials} name={clubName} className="mt-3 text-white/85" />
              </div>
            )}
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h3 className={columnTitle}>Meetings</h3>
              <ul className="mt-5 flex flex-col gap-2 font-medium">
                <li>{meetingSchedule(meeting)}</li>
                <li>{meetingTimeRange(meeting)}</li>
                <li>
                  {meeting.venue}, {meeting.city}
                </li>
                {meeting.mapUrl && (
                  <li>
                    <a
                      href={meeting.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-link text-gold inline-flex min-h-11 items-center"
                    >
                      Get directions<span className="sr-only"> (opens Google Maps in a new tab)</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <nav aria-label="Footer">
              <h3 className={columnTitle}>Explore</h3>
              <ul className="mt-5 flex flex-col gap-2 font-medium">
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

            <div>
              <h3 className={columnTitle}>Contact us</h3>
              <div className="mt-4 font-medium">
                <ContactLinks contacts={contacts} email={contactEmail} />
              </div>
            </div>
          </div>
        </div>

        {meeting.mapEmbedUrl && (
          <section aria-labelledby="footer-map" className="mt-14">
            <h3 id="footer-map" className={columnTitle}>
              Find us
            </h3>
            <VenueMap
              src={meeting.mapEmbedUrl}
              place={`${meeting.venue}, ${meeting.city}`}
              className="mt-5"
            />
          </section>
        )}

        <div className="mt-16 flex flex-col gap-3 text-sm text-white/70 md:flex-row md:justify-between">
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
      </div>
    </footer>
  );
}
