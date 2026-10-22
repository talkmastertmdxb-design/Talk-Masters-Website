import { describe, expect, it } from "vitest";
import { content } from "@/lib/content";
import { GUEST_MESSAGE, formatPhone, whatsappLink } from "@/lib/content/contact";
import { settingsSchema } from "@/lib/content/schemas";

describe("whatsappLink", () => {
  it("opens a chat with the number", () => {
    expect(whatsappLink("+971502837168")).toBe("https://wa.me/971502837168");
  });

  it("types the guest's first message for them", () => {
    expect(whatsappLink("+971502837168", GUEST_MESSAGE)).toBe(
      "https://wa.me/971502837168?text=Hi!%20I'd%20like%20to%20visit%20a%20Talk-Masters%20meeting%20as%20a%20guest.",
    );
  });
});

describe("formatPhone", () => {
  it("groups UAE mobile numbers the way people write them", () => {
    expect(formatPhone("+971502837168")).toBe("+971 50 283 7168");
    expect(formatPhone("+971501600212")).toBe("+971 50 160 0212");
  });

  it("leaves other numbers as stored", () => {
    expect(formatPhone("+447700900123")).toBe("+447700900123");
  });
});

describe("club contacts", () => {
  it("are the VP Membership and VP Education on WhatsApp, with their photos", () => {
    expect(content.settings.contacts).toEqual([
      {
        name: "Lulu",
        role: "Vice President Membership",
        whatsapp: "+971502837168",
        imageSlot: "officer-vp-membership",
      },
      {
        name: "Mansoor",
        role: "Vice President Education",
        whatsapp: "+971501600212",
        imageSlot: "officer-vp-education",
      },
    ]);
  });

  it("rejects numbers that are not in international format", () => {
    const withNumber = (whatsapp: string) =>
      settingsSchema.shape.contacts.safeParse([{ name: "A", role: "B", whatsapp }]).success;
    expect(withNumber("050 283 7168")).toBe(false);
    expect(withNumber("+971502837168")).toBe(true);
  });
});

describe("club stats", () => {
  it("show real membership and no nationality count", () => {
    const stats = content.settings.stats;
    expect(stats.find((s) => s.label === "Active members")).toMatchObject({ value: 37, placeholder: false });
    expect(stats.some((s) => s.label === "Nationalities")).toBe(false);
  });
});
