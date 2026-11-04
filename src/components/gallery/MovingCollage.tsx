"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Lightbox } from "@/components/media/Lightbox";
import { matchesFilter, type GalleryFilter, type GalleryPhoto } from "@/lib/content/gallery";
import { toColumns } from "@/lib/content/testimonial-columns";

export interface CollagePhoto extends GalleryPhoto {
  /** The tile, rendered on the server (an ImageSlot). */
  tile: ReactNode;
}

interface MovingCollageProps {
  photos: readonly CollagePhoto[];
  filters: readonly GalleryFilter[];
  meetingSlugs: readonly string[];
}

/** Columns by screen width: phones, tablets, wide screens. */
const COLUMNS = [
  { query: "(min-width: 80rem)", count: 5 },
  { query: "(min-width: 40rem)", count: 3 },
] as const;
/** Each column repeats its photos until it has this many, so its loop never shows a gap. */
const MIN_PER_COLUMN = 5;
/** Seconds each photo spends drifting through, so more photos don't mean faster drift. */
const SECONDS_PER_PHOTO = 7;

function columnCount(): number {
  return COLUMNS.find(({ query }) => window.matchMedia(query).matches)?.count ?? 2;
}

/**
 * The Gallery's moving collage: every photo in drifting masonry columns, neighbours drifting in
 * opposite directions. Pointing at it or tabbing into it holds it still; any photo opens full
 * screen. Filters narrow it to one event, or to the Sunday meetings (also from `?from=` in the
 * address, as the Events page links). Reduced motion: a still masonry grid, every photo once.
 */
export function MovingCollage({ photos, filters, meetingSlugs }: MovingCollageProps) {
  const [filter, setFilter] = useState("all");
  const [columns, setColumns] = useState(5);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get("from");
    // An event that is one of the Sunday meetings opens the meetings filter.
    const wanted = from && meetingSlugs.includes(from) ? "meetings" : from;
    // The page is static, so the address is only known after hydration: reading it while
    // rendering would make the first client render differ from the server's HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (wanted && filters.some((candidate) => candidate.id === wanted)) setFilter(wanted);

    const update = () => setColumns(columnCount());
    update();
    const lists = COLUMNS.map(({ query }) => window.matchMedia(query));
    for (const list of lists) list.addEventListener("change", update);
    return () => {
      for (const list of lists) list.removeEventListener("change", update);
    };
  }, [filters, meetingSlugs]);

  const shown = useMemo(
    () => photos.filter((photo) => matchesFilter(photo, filter, meetingSlugs)),
    [photos, filter, meetingSlugs],
  );
  const dealt = useMemo(() => toColumns(shown, columns, MIN_PER_COLUMN), [shown, columns]);

  const tile = (photo: CollagePhoto, key: string, hidden: boolean) => (
    <li key={key} aria-hidden={hidden || undefined}>
      <button
        type="button"
        tabIndex={hidden ? -1 : undefined}
        onClick={() => setOpen(shown.findIndex((candidate) => candidate.id === photo.id))}
        className="collage__tile group"
      >
        <span className="media-zoom block">{photo.tile}</span>
        <span className="collage__caption">{photo.caption}</span>
        <span className="sr-only">Open full screen: {photo.alt}</span>
      </button>
    </li>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Show photos from" className="flex flex-wrap gap-2">
          {filters.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
              className="collage__chip"
            >
              {option.label}
              <span className="collage__count">{option.count}</span>
            </button>
          ))}
        </div>
        <p aria-live="polite" className="text-ink-muted text-sm">
          {shown.length} photos
        </p>
      </div>

      <div className="collage mt-8">
        {dealt.map((column, index) => {
          // Only a photo's first appearance is offered to screen readers and the keyboard; the
          // repeats and the loop's second copy are decoration.
          const seen = new Set<string>();
          const first = column.map((photo) => {
            const repeat = seen.has(photo.id);
            seen.add(photo.id);
            return repeat;
          });
          return (
            <div
              key={`${filter}-${columns}-${index}`}
              className="collage__col"
              style={
                {
                  "--collage-duration": `${column.length * SECONDS_PER_PHOTO}s`,
                  "--collage-direction": index % 2 === 0 ? "normal" : "reverse",
                } as CSSProperties
              }
            >
              <div className="collage__track">
                <ul className="collage__copy">
                  {column.map((photo, i) => tile(photo, `${photo.id}-${i}`, first[i]!))}
                </ul>
                <ul aria-hidden="true" className="collage__copy collage__copy--loop">
                  {column.map((photo, i) => tile(photo, `loop-${photo.id}-${i}`, true))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <Lightbox label="Gallery photos" photos={shown} index={open} onChange={setOpen} />
    </div>
  );
}
