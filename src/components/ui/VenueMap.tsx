interface VenueMapProps {
  /** A Google Maps embed link (validated in content/settings.json). */
  src: string;
  /** Where it is, for screen readers: "Hor Al Anz Public Library, Dubai". */
  place: string;
  className?: string;
}

/**
 * Google's map of the venue. It loads only as the visitor nears it (loading="lazy"), so pages
 * don't pay for it up front, and Google's own cooperative gestures keep the page scrolling on
 * phones: one finger scrolls the page, two move the map.
 */
export function VenueMap({ src, place, className = "" }: VenueMapProps) {
  return (
    <div
      className={`rounded-card relative aspect-[4/3] overflow-hidden border border-white/14 bg-white/5 sm:aspect-[16/9] lg:aspect-auto lg:h-80 ${className}`}
    >
      <iframe
        src={src}
        title={`Map: ${place}`}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}
