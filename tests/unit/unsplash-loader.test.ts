import { describe, expect, it } from "vitest";
import { isUnsplashSrc, unsplashLoader } from "@/lib/images/unsplash-loader";

const src =
  "https://images.unsplash.com/photo-1729108629303-3d957cbb306d?ixid=abc&ixlib=rb-4.1.0&w=2400&q=80&fm=jpg";

describe("unsplashLoader", () => {
  it("asks the Unsplash CDN for the exact width next/image needs", () => {
    const url = new URL(unsplashLoader({ src, width: 828, quality: 70 }));
    expect(url.hostname).toBe("images.unsplash.com");
    expect(url.searchParams.get("w")).toBe("828");
    expect(url.searchParams.get("q")).toBe("70");
  });

  it("lets the CDN choose AVIF/WebP instead of forcing JPEG", () => {
    const url = new URL(unsplashLoader({ src, width: 640 }));
    expect(url.searchParams.get("auto")).toBe("format");
    expect(url.searchParams.has("fm")).toBe(false);
  });

  it("keeps Unsplash tracking parameters (API guideline: hotlink the original URL)", () => {
    const url = new URL(unsplashLoader({ src, width: 640 }));
    expect(url.searchParams.get("ixid")).toBe("abc");
  });

  it("defaults to quality 75", () => {
    expect(new URL(unsplashLoader({ src, width: 640 })).searchParams.get("q")).toBe("75");
  });
});

describe("isUnsplashSrc", () => {
  it("recognises Unsplash CDN images only", () => {
    expect(isUnsplashSrc(src)).toBe(true);
    expect(isUnsplashSrc("/images/hero.jpg")).toBe(false);
    expect(isUnsplashSrc("https://evil.example/images.unsplash.com/photo-1")).toBe(false);
  });
});
