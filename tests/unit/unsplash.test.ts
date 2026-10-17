import { describe, expect, it } from "vitest";
import { pickPhoto, toSlotPhoto, type UnsplashPhoto } from "@/lib/images/unsplash";

const photo = (overrides: Partial<UnsplashPhoto> = {}): UnsplashPhoto => ({
  id: "abc123",
  width: 4000,
  height: 3000,
  urls: { raw: "https://images.unsplash.com/photo-1?ixid=x" },
  links: {
    html: "https://unsplash.com/photos/abc123",
    download_location: "https://api.unsplash.com/photos/abc123/download",
  },
  user: { name: "Jane Doe", links: { html: "https://unsplash.com/@jane" } },
  ...overrides,
});

describe("pickPhoto", () => {
  it("skips Unsplash+ (paid) photos", () => {
    const picked = pickPhoto([
      photo({ id: "paid", premium: true }),
      photo({ id: "plus", plus: true }),
      photo({ id: "free" }),
    ]);
    expect(picked?.id).toBe("free");
  });

  it("skips photos too small for a full-width hero", () => {
    expect(pickPhoto([photo({ id: "tiny", width: 800, height: 600 }), photo({ id: "big" })])?.id).toBe("big");
  });

  it("returns undefined when nothing qualifies", () => {
    expect(pickPhoto([photo({ premium: true })])).toBeUndefined();
  });
});

describe("toSlotPhoto", () => {
  it("hotlinks the Unsplash CDN, as the API guidelines require", () => {
    const result = toSlotPhoto(photo(), "talk_masters");
    expect(result.src.startsWith("https://images.unsplash.com/")).toBe(true);
  });

  it("credits the photographer with referral links", () => {
    const { credit } = toSlotPhoto(photo(), "talk_masters");
    expect(credit.name).toBe("Jane Doe");
    expect(credit.profileUrl).toBe("https://unsplash.com/@jane?utm_source=talk_masters&utm_medium=referral");
    expect(credit.photoUrl).toBe(
      "https://unsplash.com/photos/abc123?utm_source=talk_masters&utm_medium=referral",
    );
  });
});
