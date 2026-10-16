import type { ImageSlot } from "@/lib/content/schemas";

interface ImagePlaceholderProps {
  slot: Pick<ImageSlot, "id" | "alt" | "aspectRatio" | "brief">;
  /** Show the photo brief and slot id (dev and previews only). */
  showLabel: boolean;
  className?: string;
}

/**
 * Stand-in for a photo that hasn't been supplied yet. It reads as a deliberate
 * "stage" panel, not a broken image, and keeps the final aspect ratio so the
 * real photo drops in without layout shift.
 */
export function ImagePlaceholder({ slot, showLabel, className = "" }: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={slot.alt}
      data-image-slot={slot.id}
      data-placeholder="true"
      style={{ aspectRatio: slot.aspectRatio }}
      className={`stage-placeholder rounded-card relative isolate overflow-hidden ${className}`}
    >
      {showLabel && (
        <div className="bg-ink/60 absolute inset-x-4 bottom-4 flex flex-col gap-1 rounded-2xl border border-white/10 p-3 text-left backdrop-blur-md">
          <span className="text-eyebrow text-gold">Photo needed · {slot.id}</span>
          <span className="text-sm leading-snug text-white/85">{slot.brief}</span>
        </div>
      )}
    </div>
  );
}
