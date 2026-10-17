import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImagePlaceholder } from "@/components/media/ImagePlaceholder";
import { resolveImageSlot, shouldShowPlaceholderLabels } from "@/lib/images/slots";

const slots = [
  { id: "hero-stage", alt: "Speaker on stage", aspectRatio: "4/5", brief: "Speaker at lectern", src: null },
  { id: "venue", alt: "Venue entrance", aspectRatio: "16/9", brief: "Entrance", src: "/images/venue.jpg" },
] as const;

describe("resolveImageSlot", () => {
  it("returns the slot when it exists", () => {
    expect(resolveImageSlot(slots, "venue").src).toBe("/images/venue.jpg");
  });

  it("fails fast on an unknown slot id", () => {
    expect(() => resolveImageSlot(slots, "missing")).toThrow(/Unknown image slot "missing"/);
  });
});

describe("shouldShowPlaceholderLabels", () => {
  it("shows labels outside production", () => {
    expect(shouldShowPlaceholderLabels({ NODE_ENV: "development" })).toBe(true);
  });

  it("hides labels in production unless explicitly enabled for a preview", () => {
    expect(shouldShowPlaceholderLabels({ NODE_ENV: "production" })).toBe(false);
    expect(
      shouldShowPlaceholderLabels({ NODE_ENV: "production", NEXT_PUBLIC_SHOW_PLACEHOLDER_LABELS: "true" }),
    ).toBe(true);
  });
});

describe("ImagePlaceholder", () => {
  it("exposes the alt text as an accessible image and keeps the aspect ratio", () => {
    render(<ImagePlaceholder slot={slots[0]} showLabel />);
    const img = screen.getByRole("img", { name: "Speaker on stage" });
    // The ratio can be overridden per context with --slot-ratio (e.g. pinned sections).
    expect(img.getAttribute("style")).toContain("var(--slot-ratio, 4/5)");
    expect(screen.getByText("Speaker at lectern")).toBeInTheDocument();
  });

  it("hides the production-unfriendly brief when labels are off", () => {
    render(<ImagePlaceholder slot={slots[0]} showLabel={false} />);
    expect(screen.queryByText("Speaker at lectern")).not.toBeInTheDocument();
  });
});
