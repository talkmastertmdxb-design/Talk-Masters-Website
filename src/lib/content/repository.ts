import type { ClubEvent, Faq, ImageSlot, Officer, Settings, Story, TableTopic, Testimonial } from "./schemas";

/**
 * Everything the site reads, behind one interface. v1 is backed by typed JSON
 * in /content (src/lib/content/index.ts); v1.1 swaps in a Google Drive snapshot with no
 * component changes (docs/IMPLEMENTATION_PLAN.md §5.1).
 */
export interface ContentRepository {
  readonly settings: Settings;
  /** Published events, soonest first. */
  readonly events: readonly ClubEvent[];
  /** Published stories with recorded consent. */
  readonly stories: readonly Story[];
  readonly testimonials: readonly Testimonial[];
  readonly officers: readonly Officer[];
  readonly faqs: readonly Faq[];
  readonly tableTopics: readonly TableTopic[];
  readonly imageSlots: readonly ImageSlot[];
}

export interface RawContent {
  settings: Settings;
  events: readonly ClubEvent[];
  stories: readonly Story[];
  testimonials: readonly Testimonial[];
  officers: readonly Officer[];
  faqs: readonly Faq[];
  tableTopics: readonly TableTopic[];
  imageSlots: readonly ImageSlot[];
}

const isPublished = (item: { status: string }): boolean => item.status === "published";
const hasConsent = (item: { consent: boolean }): boolean => item.consent;

/** Applies publishing rules: drafts and items without consent never reach a page. */
export function createRepository(raw: RawContent): ContentRepository {
  const events = raw.events
    .filter(isPublished)
    .toSorted((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

  return Object.freeze({
    settings: raw.settings,
    events,
    stories: raw.stories.filter(isPublished).filter(hasConsent),
    testimonials: raw.testimonials.filter(hasConsent),
    officers: raw.officers.filter(hasConsent),
    faqs: raw.faqs,
    tableTopics: raw.tableTopics,
    imageSlots: raw.imageSlots,
  });
}
