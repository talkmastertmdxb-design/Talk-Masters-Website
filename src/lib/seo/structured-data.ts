import type { Faq, Settings } from "@/lib/content/schemas";
import { upcomingMeetings, wallTime } from "@/lib/content/meeting";

/**
 * schema.org structured data (JSON-LD) for search engines and AI answer engines. Every fact
 * here comes from content/ and matches what the page shows: Google ignores, and can penalise,
 * markup that says more than the page does.
 */

type JsonLdNode = Record<string, unknown>;

const SCHEMA = "https://schema.org";
const PARENT = { name: "Toastmasters International", url: "https://www.toastmasters.org" } as const;
/** The club badge in public/brand/, used as the organisation's logo. */
const LOGO_PATH = "/brand/talk-masters-badge.webp";
/** The shared link-preview image (src/app/opengraph-image.jpg, drawn by `npm run share:image`). */
const SHARE_IMAGE_PATH = "/opengraph-image.jpg";
/** Enough meetings for search results to show what's next, all comfortably in the future. */
export const LISTED_MEETINGS = 6;

type ClubFacts = Pick<Settings, "clubName" | "description" | "tagline" | "socials" | "meeting" | "contactEmail">;

const absolute = (path: string, siteUrl: URL): string => new URL(path, siteUrl).toString();
const organizationId = (siteUrl: URL): string => absolute("/#organization", siteUrl);

/** Where meetings happen, with the address fields Google needs for events. */
function venuePlace({ meeting }: Pick<ClubFacts, "meeting">): JsonLdNode {
  return {
    "@type": "Place",
    name: meeting.venue,
    address: {
      "@type": "PostalAddress",
      name: meeting.venue,
      addressLocality: meeting.city,
      addressRegion: meeting.city,
      addressCountry: "AE",
    },
    hasMap: meeting.mapUrl,
  };
}

/** The club and the website, as one graph: rendered once, in the root layout. */
export function siteJsonLd(club: ClubFacts, siteUrl: URL, foundedYear: number): JsonLdNode {
  const id = organizationId(siteUrl);
  return {
    "@context": SCHEMA,
    "@graph": [
      {
        "@type": "Organization",
        "@id": id,
        name: club.clubName,
        url: absolute("/", siteUrl),
        logo: { "@type": "ImageObject", url: absolute(LOGO_PATH, siteUrl) },
        image: absolute(SHARE_IMAGE_PATH, siteUrl),
        description: club.description,
        slogan: club.tagline,
        foundingDate: String(foundedYear),
        parentOrganization: { "@type": "Organization", ...PARENT },
        location: venuePlace(club),
        areaServed: { "@type": "City", name: club.meeting.city },
        knowsAbout: ["Public speaking", "Leadership", "Communication skills", "Toastmasters Pathways"],
        ...(club.contactEmail ? { email: club.contactEmail } : {}),
        sameAs: club.socials.map((social) => social.url),
      },
      {
        "@type": "WebSite",
        "@id": absolute("/#website", siteUrl),
        url: absolute("/", siteUrl),
        name: club.clubName,
        inLanguage: "en",
        publisher: { "@id": id },
      },
    ],
  };
}

/** "2026-11-08T10:30:00+04:00": the club's wall-clock time with its offset, as schema.org expects. */
export function zonedIsoString(instant: Date, timeZone: string): string {
  const wall = wallTime(instant, timeZone);
  const asUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute);
  const offsetMinutes = Math.round((asUtc - instant.getTime()) / 60_000);
  const sign = offsetMinutes < 0 ? "-" : "+";
  const abs = Math.abs(offsetMinutes);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${wall.year}-${pad(wall.month)}-${pad(wall.day)}T${pad(wall.hour)}:${pad(wall.minute)}:00` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

/** The next meetings as free, in-person events: eligible for Google's event results. */
export function meetingEventsJsonLd(club: ClubFacts, siteUrl: URL, now: Date): JsonLdNode[] {
  const { meeting } = club;
  const join = absolute("/join", siteUrl);
  return upcomingMeetings(meeting, now, LISTED_MEETINGS).map((occurrence) => ({
    "@context": SCHEMA,
    "@type": "Event",
    name: `${club.clubName} meeting`,
    description: `A ${club.clubName} public speaking meeting at ${meeting.venue}, ${meeting.city}: prepared speeches, Table Topics and friendly evaluations. Guests are welcome and visiting is free.`,
    startDate: zonedIsoString(occurrence.start, meeting.timeZone),
    endDate: zonedIsoString(occurrence.end, meeting.timeZone),
    eventStatus: `${SCHEMA}/EventScheduled`,
    eventAttendanceMode: `${SCHEMA}/OfflineEventAttendanceMode`,
    location: venuePlace(club),
    image: [absolute(SHARE_IMAGE_PATH, siteUrl)],
    organizer: { "@type": "Organization", "@id": organizationId(siteUrl), name: club.clubName, url: absolute("/", siteUrl) },
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "AED",
      availability: `${SCHEMA}/InStock`,
      url: join,
    },
    url: join,
  }));
}

export interface Crumb {
  name: string;
  path: string;
}

/** Home → page, so search results show the site's structure instead of a bare URL. */
export function breadcrumbJsonLd(trail: readonly Crumb[], siteUrl: URL): JsonLdNode {
  return {
    "@context": SCHEMA,
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.path, siteUrl),
    })),
  };
}

/** The guests' questions exactly as the FAQ section shows them. */
export function faqJsonLd(faqs: readonly Pick<Faq, "question" | "answer">[]): JsonLdNode {
  return {
    "@context": SCHEMA,
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/**
 * JSON for a <script type="application/ld+json">. `<` becomes <, so no content can close
 * the script tag early (the escaping the Next.js JSON-LD guide recommends).
 */
export function serializeJsonLd(data: JsonLdNode | JsonLdNode[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
