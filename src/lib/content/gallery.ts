import { eventDay } from "./events";
import type { ClubEvent, ImageSlot } from "./schemas";

/** Regular Sunday meetings, as opposed to special events like She Leads. */
export const isMeeting = (event: Pick<ClubEvent, "type">): boolean => event.type === "meeting";

export interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  /** The event's slug: what the Gallery's filters match on. */
  event: string;
  /** "Session 80, 10 August 2025" */
  caption: string;
}

export interface GalleryFilter {
  /** "all", "meetings", or an event slug. */
  id: string;
  label: string;
  count: number;
}

/** The photos an event shows on /gallery: its album, or its Events-page gallery without one. */
const photosOf = (event: ClubEvent): readonly string[] =>
  event.album.length > 0 ? event.album : event.gallery;

/**
 * Every event's photos for /gallery, most recent event first, each photo once. Slots with no
 * photo yet are left out.
 */
export function galleryPhotos(
  events: readonly ClubEvent[],
  slots: readonly Pick<ImageSlot, "id" | "src" | "alt">[],
  timeZone: string,
): GalleryPhoto[] {
  const seen = new Set<string>();
  return events
    .toSorted((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))
    .flatMap((event) => {
      const date = eventDay(event, timeZone).replace(/^\w+ /, "");
      return photosOf(event).flatMap((id) => {
        const slot = slots.find((candidate) => candidate.id === id);
        if (!slot?.src || seen.has(id)) return [];
        seen.add(id);
        return [{ id, src: slot.src, alt: slot.alt, event: event.slug, caption: `${event.title}, ${date}` }];
      });
    });
}

/** All, then each special event, then the Sunday meetings together; only ones with photos. */
export function galleryFilters(
  photos: readonly GalleryPhoto[],
  events: readonly ClubEvent[],
): GalleryFilter[] {
  const count = (slugs: readonly string[]) => photos.filter((photo) => slugs.includes(photo.event)).length;
  const special = events
    .filter((event) => !isMeeting(event))
    .toSorted((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))
    .map((event) => ({ id: event.slug, label: event.title, count: count([event.slug]) }));
  const meetings = events.filter(isMeeting).map((event) => event.slug);
  return [
    { id: "all", label: "All", count: photos.length },
    ...special,
    { id: "meetings", label: "Sunday meetings", count: count(meetings) },
  ].filter((filter) => filter.count > 0);
}

/** Whether `photo` belongs under `filter`. */
export function matchesFilter(
  photo: Pick<GalleryPhoto, "event">,
  filter: string,
  meetingSlugs: readonly string[],
): boolean {
  if (filter === "all") return true;
  if (filter === "meetings") return meetingSlugs.includes(photo.event);
  return photo.event === filter;
}
