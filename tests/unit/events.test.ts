import { describe, expect, it } from "vitest";
import { eventWhen, upcomingEvents } from "@/lib/content/events";
import type { ClubEvent } from "@/lib/content/schemas";

const event = (slug: string, startsAt: string, endsAt?: string): ClubEvent => ({
  slug,
  title: slug,
  type: "meeting",
  startsAt,
  endsAt,
  venue: "Hor Al Anz Public Library, Dubai",
  summary: "A summary.",
  status: "published",
  placeholder: false,
});

const openHouse = event("open-house", "2026-11-14T10:30:00+04:00", "2026-11-14T12:30:00+04:00");
const contest = event("contest", "2026-12-05T16:00:00+04:00");

describe("upcomingEvents", () => {
  it("keeps events that haven't ended, soonest first", () => {
    expect(upcomingEvents([contest, openHouse], new Date("2026-10-22T08:00:00Z")).map((e) => e.slug)).toEqual(
      ["open-house", "contest"],
    );
  });

  it("keeps an event while it is happening and drops it once it ends", () => {
    expect(upcomingEvents([openHouse], new Date("2026-11-14T08:29:00Z"))).toHaveLength(1);
    expect(upcomingEvents([openHouse], new Date("2026-11-14T08:30:00Z"))).toHaveLength(0);
  });

  it("treats an event with no end time as two hours long", () => {
    expect(upcomingEvents([contest], new Date("2026-12-05T13:59:00Z"))).toHaveLength(1);
    expect(upcomingEvents([contest], new Date("2026-12-05T14:00:00Z"))).toHaveLength(0);
  });
});

describe("eventWhen", () => {
  it("gives the club-local date and time range", () => {
    expect(eventWhen(openHouse, "Asia/Dubai")).toEqual({
      day: "14",
      month: "Nov",
      date: "Saturday 14 November",
      time: "10:30 am – 12:30 pm",
    });
  });

  it("gives just the start time when there is no end", () => {
    expect(eventWhen(contest, "Asia/Dubai").time).toBe("4:00 pm");
  });
});
