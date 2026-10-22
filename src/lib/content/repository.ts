import type {
  Award,
  ClubEvent,
  CultureCard,
  Faq,
  Founder,
  History,
  ImageSlot,
  Member,
  Officer,
  Settings,
  TableTopic,
  Testimonial,
} from "./schemas";

/**
 * Everything the site reads, behind one interface. v1 is backed by typed JSON
 * in /content (src/lib/content/index.ts); v1.1 swaps in a Google Drive snapshot
 * with no component changes (docs/IMPLEMENTATION_PLAN.md §5.1).
 */
export interface ContentRepository {
  readonly settings: Settings;
  readonly history: History;
  /** Published events, soonest first. */
  readonly events: readonly ClubEvent[];
  /** Published member stories with recorded consent. */
  readonly members: readonly Member[];
  readonly founders: readonly Founder[];
  /** Newest Toastmasters year first. */
  readonly awards: readonly Award[];
  readonly testimonials: readonly Testimonial[];
  readonly officers: readonly Officer[];
  readonly faqs: readonly Faq[];
  /** The About section's culture cards, in display order. */
  readonly culture: readonly CultureCard[];
  readonly tableTopics: readonly TableTopic[];
  readonly imageSlots: readonly ImageSlot[];
}

export type RawContent = {
  [K in keyof ContentRepository]: ContentRepository[K];
};

const isPublished = (item: { status: string }): boolean => item.status === "published";
const hasConsent = (item: { consent: boolean }): boolean => item.consent;
const startYear = (award: Award): number => Number(award.year.slice(0, 4));

/** Applies publishing rules: drafts and people without consent never reach a page. */
export function createRepository(raw: RawContent): ContentRepository {
  return Object.freeze({
    settings: raw.settings,
    history: raw.history,
    events: raw.events
      .filter(isPublished)
      .toSorted((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
    members: raw.members.filter(isPublished).filter(hasConsent),
    founders: raw.founders.filter(hasConsent),
    awards: raw.awards.toSorted((a, b) => startYear(b) - startYear(a)),
    testimonials: raw.testimonials.filter(hasConsent),
    officers: raw.officers.filter(hasConsent),
    faqs: raw.faqs,
    culture: raw.culture,
    tableTopics: raw.tableTopics,
    imageSlots: raw.imageSlots,
  });
}
