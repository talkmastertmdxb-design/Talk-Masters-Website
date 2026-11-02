import { describe, expect, it } from "vitest";
import { content } from "@/lib/content";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  LISTED_MEETINGS,
  meetingEventsJsonLd,
  serializeJsonLd,
  siteJsonLd,
  zonedIsoString,
} from "@/lib/seo/structured-data";

const site = new URL("https://www.talkmasters.ae");
const club = content.settings;
/** Sunday 1 November 2026, 9:00 Dubai: the next meetings are 8 and 22 November (2nd and 4th Sundays). */
const now = new Date("2026-11-01T05:00:00Z");

describe("siteJsonLd", () => {
  const graph = siteJsonLd(club, site, 2016)["@graph"] as Record<string, unknown>[];
  const [organization, website] = graph;

  it("describes the club as part of Toastmasters International, in its city", () => {
    expect(organization).toMatchObject({
      "@type": "Organization",
      "@id": "https://www.talkmasters.ae/#organization",
      name: "Talk-Masters Club",
      url: "https://www.talkmasters.ae/",
      foundingDate: "2016",
      parentOrganization: { name: "Toastmasters International", url: "https://www.toastmasters.org" },
      areaServed: { name: club.meeting.city },
    });
    expect(organization?.location).toMatchObject({
      name: club.meeting.venue,
      address: { addressLocality: club.meeting.city, addressCountry: "AE" },
    });
  });

  it("gives the club inbox, and leaves it out when there is none", () => {
    expect(organization?.email).toBe(club.contactEmail);
    const withoutEmail = siteJsonLd({ ...club, contactEmail: undefined }, site, 2016)["@graph"] as Record<
      string,
      unknown
    >[];
    expect(withoutEmail[0]).not.toHaveProperty("email");
  });

  it("links the club's own social profiles and logo", () => {
    expect(organization?.sameAs).toEqual(club.socials.map((social) => social.url));
    expect(organization?.logo).toEqual({
      "@type": "ImageObject",
      url: "https://www.talkmasters.ae/brand/talk-masters-badge.webp",
    });
  });

  it("names the website and points its publisher at the club", () => {
    expect(website).toMatchObject({
      "@type": "WebSite",
      url: "https://www.talkmasters.ae/",
      publisher: { "@id": "https://www.talkmasters.ae/#organization" },
    });
  });
});

describe("zonedIsoString", () => {
  it("writes Dubai wall time with its +04:00 offset", () => {
    expect(zonedIsoString(new Date("2026-11-08T06:30:00Z"), "Asia/Dubai")).toBe("2026-11-08T10:30:00+04:00");
  });

  it("handles zones behind UTC and half-hour offsets", () => {
    expect(zonedIsoString(new Date("2026-01-15T17:00:00Z"), "America/New_York")).toBe("2026-01-15T12:00:00-05:00");
    expect(zonedIsoString(new Date("2026-01-15T04:30:00Z"), "Asia/Kolkata")).toBe("2026-01-15T10:00:00+05:30");
  });
});

describe("meetingEventsJsonLd", () => {
  const events = meetingEventsJsonLd(club, site, now);

  it("lists the next meetings as free, in-person events at the venue", () => {
    expect(events).toHaveLength(LISTED_MEETINGS);
    expect(events[0]).toMatchObject({
      "@type": "Event",
      name: "Talk-Masters Club meeting",
      startDate: "2026-11-08T10:30:00+04:00",
      endDate: "2026-11-08T12:30:00+04:00",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      isAccessibleForFree: true,
      offers: { price: 0, priceCurrency: "AED", url: "https://www.talkmasters.ae/join" },
      location: { name: club.meeting.venue },
    });
    expect(events[1]?.startDate).toBe("2026-11-22T10:30:00+04:00");
  });

  it("fills Google's recommended fields: the members perform, and booking is open from now", () => {
    expect(events[0]?.performer).toEqual({
      "@type": "PerformingGroup",
      name: "Talk-Masters Club members",
      url: "https://www.talkmasters.ae/members",
    });
    expect(events[0]?.offers).toMatchObject({ validFrom: "2026-11-01T09:00:00+04:00" });
  });

  it("leaves out cancelled meetings", () => {
    const cancelled = { ...club, meeting: { ...club.meeting, cancelled: ["2026-11-08"] } };
    expect(meetingEventsJsonLd(cancelled, site, now)[0]?.startDate).toBe("2026-11-22T10:30:00+04:00");
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers the trail from 1 with absolute URLs", () => {
    expect(
      breadcrumbJsonLd(
        [
          { name: "Home", path: "/" },
          { name: "Meetings", path: "/meetings" },
        ],
        site,
      ),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.talkmasters.ae/" },
        { "@type": "ListItem", position: 2, name: "Meetings", item: "https://www.talkmasters.ae/meetings" },
      ],
    });
  });
});

describe("faqJsonLd", () => {
  it("carries every question and answer as the page shows them", () => {
    const data = faqJsonLd(content.faqs);
    const questions = data.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    expect(data["@type"]).toBe("FAQPage");
    expect(questions).toHaveLength(content.faqs.length);
    expect(questions[0]).toEqual({
      "@type": "Question",
      name: content.faqs[0]!.question,
      acceptedAnswer: { "@type": "Answer", text: content.faqs[0]!.answer },
    });
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so content can never close the script tag", () => {
    const json = serializeJsonLd({ text: "</script><script>alert(1)</script>" });
    expect(json).not.toContain("<");
    expect(JSON.parse(json)).toEqual({ text: "</script><script>alert(1)</script>" });
  });
});
