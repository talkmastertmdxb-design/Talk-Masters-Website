import { describe, expect, it } from "vitest";
import { content } from "@/lib/content";
import { galleryFilters, galleryPhotos, isMeeting, matchesFilter, MOMENTS } from "@/lib/content/gallery";

const { events, gallery, imageSlots, settings, testimonials } = content;
const timeZone = settings.meeting.timeZone;
const photos = galleryPhotos(events, gallery.moments, imageSlots, timeZone);
const meetingSlugs = events.filter(isMeeting).map((event) => event.slug);
const slotOf = (id: string) => imageSlots.find((slot) => slot.id === id);

describe("galleryPhotos", () => {
  it("holds every photo of club moments, each one once", () => {
    expect(photos.length).toBeGreaterThanOrEqual(130);
    expect(new Set(photos.map((photo) => photo.id)).size).toBe(photos.length);
    // Two slots can share a file (an agenda photo is also a meeting photo): shown once.
    expect(new Set(photos.map((photo) => photo.src)).size).toBe(photos.length);
  });

  it("includes the photos used on other pages, not only the events' own", () => {
    const ids = new Set(photos.map((photo) => photo.id));
    for (const id of ["members-hero", "meeting-awards", "path-dynamic-leadership", "club-celebration"]) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it("leaves portraits, posters and graphics out", () => {
    for (const photo of photos) {
      expect(photo.src, photo.id).not.toMatch(/^\/images\/(members|team)\//);
      expect(photo.id).not.toMatch(/^she-leads-(chief-guest|panel-moderator|emcee|sergeant)/);
      expect(photo.id).not.toMatch(/^award-/);
    }
  });

  it("starts with the most recent day, captions each photo, and ends with club moments", () => {
    expect(photos[0]?.event).toBe("she-leads");
    expect(photos.find((photo) => photo.event === "session-80")?.caption).toBe("Session 80, 10 August 2025");
    expect(photos.at(-1)?.caption).toBe(MOMENTS.label);
  });

  it("falls back to an event's Events-page photos when it has no album", () => {
    const [event] = events.filter((candidate) => candidate.slug === "she-leads");
    const bare = { ...event!, slug: "bare", album: [] };
    expect(galleryPhotos([bare], [], imageSlots, timeZone).map((photo) => photo.id)).toEqual(event!.gallery);
  });
});

describe("gallery moments content", () => {
  it("names only slots that exist and have a photo", () => {
    for (const id of gallery.moments) expect(slotOf(id)?.src, id).toBeTruthy();
  });
});

describe("galleryFilters", () => {
  const filters = galleryFilters(photos, events);

  it("offers All, each special event, the Sunday meetings, then club moments", () => {
    expect(filters.map((filter) => filter.id)).toEqual([
      "all",
      "she-leads",
      "careernova",
      "meetings",
      "moments",
    ]);
  });

  it("counts match what each filter shows, and add up to All", () => {
    for (const filter of filters) {
      expect(photos.filter((photo) => matchesFilter(photo, filter.id, meetingSlugs))).toHaveLength(
        filter.count,
      );
    }
    const [all, ...rest] = filters;
    expect(rest.reduce((sum, filter) => sum + filter.count, 0)).toBe(all!.count);
  });
});

describe("meetings and testimonials content", () => {
  it("shows four photos on each meeting card, all from its album", () => {
    for (const meeting of events.filter(isMeeting)) {
      expect(meeting.gallery).toHaveLength(4);
      expect(meeting.gallery.every((id) => meeting.album.includes(id))).toBe(true);
    }
  });

  it("gives every quote beside the video a portrait that exists", () => {
    for (const testimonial of testimonials) {
      expect(slotOf(testimonial.imageSlot ?? "")?.src, testimonial.name).toBeTruthy();
    }
  });
});
