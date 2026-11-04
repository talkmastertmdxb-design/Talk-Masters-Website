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

/** The Gallery's group for club photos that belong to no event. */
export const MOMENTS = { id: "moments", label: "Club moments" } as const;

/**
 * Every photo for /gallery: each event's, most recent event first, then the club moments. Each
 * photo appears once, even when two slots share a file; slots with no photo yet are left out.
 */
export function galleryPhotos(
  events: readonly ClubEvent[],
  moments: readonly string[],
  slots: readonly Pick<ImageSlot, "id" | "src" | "alt">[],
  timeZone: string,
): GalleryPhoto[] {
  const seen = new Set<string>();
  const photo = (id: string, event: string, caption: string): GalleryPhoto[] => {
    const slot = slots.find((candidate) => candidate.id === id);
    if (!slot?.src || seen.has(id) || seen.has(slot.src)) return [];
    seen.add(id).add(slot.src);
    return [{ id, src: slot.src, alt: slot.alt, event, caption }];
  };
  const fromEvents = events
    .toSorted((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))
    .flatMap((event) => {
      const date = eventDay(event, timeZone).replace(/^\w+ /, "");
      return photosOf(event).flatMap((id) => photo(id, event.slug, `${event.title}, ${date}`));
    });
  return [...fromEvents, ...moments.flatMap((id) => photo(id, MOMENTS.id, MOMENTS.label))];
}

/** All, each special event, the Sunday meetings together, then club moments; only ones with photos. */
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
    { ...MOMENTS, count: count([MOMENTS.id]) },
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
