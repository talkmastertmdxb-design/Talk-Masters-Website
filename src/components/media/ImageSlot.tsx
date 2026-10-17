import Image from "next/image";
import { content } from "@/lib/content";
import { resolveImageSlot, shouldShowPlaceholderLabels } from "@/lib/images/slots";
import { ImagePlaceholder, type ImageVariant } from "./ImagePlaceholder";

interface ImageSlotProps {
  /** Id from content/images.json */
  id: string;
  /** Responsive sizes hint for next/image, e.g. "(min-width: 900px) 50vw, 100vw" */
  sizes: string;
  /** Set only for the LCP image above the fold. */
  priority?: boolean;
  variant?: ImageVariant;
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

  return (
    <div
      data-image-slot={slot.id}
      style={isBackdrop ? undefined : { aspectRatio: slot.aspectRatio }}
      className={
        isBackdrop
          ? `backdrop-photo absolute inset-0 -z-20 ${className}`
          : `rounded-card relative overflow-hidden ${className}`
      }
    >
      <Image
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
