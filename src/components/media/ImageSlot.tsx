import Image from "next/image";
import { content } from "@/lib/content";
import { resolveImageSlot, shouldShowPlaceholderLabels } from "@/lib/images/slots";
import { isUnsplashSrc } from "@/lib/images/unsplash-loader";
import { ImagePlaceholder, type ImageVariant } from "./ImagePlaceholder";
import { UnsplashImage } from "./UnsplashImage";

interface ImageSlotProps {
  /** Id from content/images.json */
  id: string;
  /** Responsive sizes hint for next/image, e.g. "(min-width: 900px) 50vw, 100vw" */
  sizes: string;
  /** Set only for the LCP image above the fold. */
  priority?: boolean;
  variant?: ImageVariant;
  /** Backdrops only: "dim" (default) sits behind text; "full" shows the photo at full strength. */
  tone?: "dim" | "full";
  className?: string;
}

/**
 * The only way pages render photography. While a slot has no photo it shows a
 * designed placeholder; adding the file and its path in content/images.json
 * swaps in the real image with no component changes (see docs/IMAGES.md).
 */
export function ImageSlot({
  id,
  sizes,
  priority = false,
  variant = "frame",
  tone = "dim",
  className = "",
}: ImageSlotProps) {
  const slot = resolveImageSlot(content.imageSlots, id);

  if (!slot.src) {
    return (
      <ImagePlaceholder
        slot={slot}
        variant={variant}
        showLabel={shouldShowPlaceholderLabels(process.env)}
        className={className}
      />
    );
  }

  const isBackdrop = variant === "backdrop";
  // Club photos go through the Next.js optimizer; Unsplash photos are served by their CDN.
  const Picture = isUnsplashSrc(slot.src) ? UnsplashImage : Image;

  return (
    <div
      data-image-slot={slot.id}
      style={isBackdrop ? undefined : { aspectRatio: `var(--slot-ratio, ${slot.aspectRatio})` }}
      className={
        isBackdrop
          ? `${tone === "dim" ? "backdrop-photo" : ""} absolute inset-0 -z-20 ${className}`
          : `rounded-card relative overflow-hidden ${className}`
      }
    >
      <Picture
        src={slot.src}
        alt={slot.alt}
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="object-cover"
        style={slot.focalPoint ? { objectPosition: slot.focalPoint } : undefined}
      />
    </div>
  );
}
