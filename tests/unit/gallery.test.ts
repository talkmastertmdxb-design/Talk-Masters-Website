import { describe, expect, it } from "vitest";
import { content } from "@/lib/content";
import { galleryFilters, galleryPhotos, isMeeting, matchesFilter } from "@/lib/content/gallery";

const { events, imageSlots, settings, testimonials } = content;
const photos = galleryPhotos(events, imageSlots, settings.meeting.timeZone);
const meetingSlugs = events.filter(isMeeting).map((event) => event.slug);

describe("galleryPhotos", () => {
  it("shows each photo once, every one with a file", () => {
    expect(photos.length).toBeGreaterThan(80);
    expect(new Set(photos.map((photo) => photo.id)).size).toBe(photos.length);
    expect(photos.every((photo) => photo.src.startsWith("/images/"))).toBe(true);
  });

  it("starts with the most recent day and captions each photo with its day", () => {
    expect(photos[0]?.event).toBe("she-leads");
    expect(photos.find((photo) => photo.event === "session-80")?.caption).toBe("Session 80, 10 August 2025");
  });

  it("falls back to an event's Events-page photos when it has no album", () => {
    const [event] = events.filter((candidate) => candidate.slug === "she-leads");
    const bare = { ...event!, slug: "bare", album: [] };
    const fromBare = galleryPhotos([bare], imageSlots, settings.meeting.timeZone);
    expect(fromBare.map((photo) => photo.id)).toEqual(event!.gallery);
  });
});

describe("galleryFilters", () => {
  const filters = galleryFilters(photos, events);

  it("offers All, each special event, then the Sunday meetings together", () => {
    expect(filters.map((filter) => filter.id)).toEqual(["all", "she-leads", "careernova", "meetings"]);
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
      const slot = imageSlots.find((candidate) => candidate.id === testimonial.imageSlot);
      expect(slot?.src, testimonial.name).toBeTruthy();
    }
  });
});
