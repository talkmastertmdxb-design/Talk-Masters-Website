import type { ImageSlot } from "@/lib/content/schemas";

export type ImageVariant = "frame" | "backdrop";

interface ImagePlaceholderProps {
  slot: Pick<ImageSlot, "id" | "alt" | "aspectRatio" | "brief">;
  /** Show the photo brief and slot id (dev and previews only). */
  showLabel: boolean;
  /** frame: a rounded image at its final aspect ratio. backdrop: fills its positioned parent. */
  variant?: ImageVariant;
  className?: string;
}

/**
 * Stand-in for a photo that hasn't been supplied yet. It reads as a deliberate
 * "stage" panel, not a broken image, and keeps the final aspect ratio so the
 * real photo drops in without layout shift.
 */
export function ImagePlaceholder({
  slot,
  showLabel,
  variant = "frame",
  className = "",
}: ImagePlaceholderProps) {
  const isBackdrop = variant === "backdrop";

  return (
    <div
      role="img"
      aria-label={slot.alt}
      data-image-slot={slot.id}
      data-placeholder="true"
      style={isBackdrop ? undefined : { aspectRatio: slot.aspectRatio }}
      className={
        isBackdrop
          ? `absolute inset-0 -z-20 ${className}`
          : `stage-placeholder rounded-card relative isolate overflow-hidden ${className}`
      }
    >
      {showLabel && (
        <div
          className={`bg-ink/60 absolute flex flex-col gap-1 rounded-2xl border border-white/10 p-3 text-left backdrop-blur-md ${
            isBackdrop ? "right-4 bottom-4 max-w-64" : "inset-x-4 bottom-4"
          }`}
        >
          <span className="text-gold text-xs font-semibold">Photo needed: {slot.id}</span>
          <span className="text-sm leading-snug text-white/85">{slot.brief}</span>
        </div>
      )}
    </div>
  );
}
