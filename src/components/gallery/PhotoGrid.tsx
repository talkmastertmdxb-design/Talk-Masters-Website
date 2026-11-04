"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Lightbox } from "@/components/media/Lightbox";
import { matchesFilter, type GalleryFilter, type GalleryPhoto } from "@/lib/content/gallery";
import { toColumns } from "@/lib/content/testimonial-columns";

export interface GridPhoto extends GalleryPhoto {
  /** The tile, rendered on the server (an ImageSlot). */
  tile: ReactNode;
}

interface PhotoGridProps {
  photos: readonly GridPhoto[];
  filters: readonly GalleryFilter[];
  meetingSlugs: readonly string[];
}

/** Columns by screen width: phones, tablets, wide screens. */
const COLUMNS = [
  { query: "(min-width: 80rem)", count: 5 },
  { query: "(min-width: 40rem)", count: 3 },
] as const;
/** Photos shown at first, and added by each "Show more". */
export const PAGE = 40;

function columnCount(): number {
  return COLUMNS.find(({ query }) => window.matchMedia(query).matches)?.count ?? 2;
}

/** The link that opens /gallery on one photo, for sharing. */
const photoLink = (photo: Pick<GalleryPhoto, "id">): string =>
  `${window.location.origin}/gallery?photo=${encodeURIComponent(photo.id)}`;

/**
 * The Gallery's photos as a still masonry grid: the first 40, then 40 more at a time. Filters
 * narrow it to one event, the Sunday meetings or club moments; any photo opens full screen,
 * with a link to share it. The address can pick a filter (?from=<event>, from the Events page)
 * or open one photo (?photo=<slot id>, a shared link).
 */
export function PhotoGrid({ photos, filters, meetingSlugs }: PhotoGridProps) {
  const [filter, setFilter] = useState("all");
  const [columns, setColumns] = useState(5);
  const [visible, setVisible] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const focusFrom = useRef<number | null>(null);

  useEffect(() => {
    // The page is static, so the address is only known after hydration: reading it while
    // rendering would make the first client render differ from the server's HTML.
    const params = new URLSearchParams(window.location.search);
    const shared = photos.findIndex((photo) => photo.id === params.get("photo"));
    const from = params.get("from");
    const wanted = from && meetingSlugs.includes(from) ? "meetings" : from;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (shared >= 0) {
      setVisible(Math.max(PAGE, shared + 1));
      setOpen(shared);
    } else if (wanted && filters.some((candidate) => candidate.id === wanted)) setFilter(wanted);

    const update = () => setColumns(columnCount());
    update();
    /* eslint-enable react-hooks/set-state-in-effect */
    const lists = COLUMNS.map(({ query }) => window.matchMedia(query));
    for (const list of lists) list.addEventListener("change", update);
    return () => {
      for (const list of lists) list.removeEventListener("change", update);
    };
  }, [photos, filters, meetingSlugs]);

  const matching = useMemo(
    () => photos.filter((photo) => matchesFilter(photo, filter, meetingSlugs)),
    [photos, filter, meetingSlugs],
  );
  const shown = matching.slice(0, visible);
  const dealt = toColumns(
    shown.map((photo, index) => ({ photo, index })),
    columns,
    0,
  );
  const left = matching.length - shown.length;

  // After "Show more", focus lands on the first new photo rather than staying on the button.
  useEffect(() => {
    if (focusFrom.current === null) return;
    grid.current?.querySelector<HTMLElement>(`[data-index="${focusFrom.current}"]`)?.focus();
    focusFrom.current = null;
  }, [visible]);

  const choose = (id: string) => {
    setFilter(id);
    setVisible(PAGE);
  };
  const showMore = () => {
    focusFrom.current = shown.length;
    setVisible((count) => count + PAGE);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Show photos from" className="flex flex-wrap gap-2">
          {filters.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={filter === option.id}
              onClick={() => choose(option.id)}
              className="collage__chip"
            >
              {option.label}
              <span className="collage__count">{option.count}</span>
            </button>
          ))}
        </div>
        <p aria-live="polite" className="text-ink-muted text-sm">
          Showing {shown.length} of {matching.length}
        </p>
      </div>

      <div ref={grid} className="collage mt-8">
        {dealt.map((column, c) => (
          <ul key={`${filter}-${columns}-${c}`} className="collage__copy">
            {column.map(({ photo, index }) => (
              <li key={photo.id}>
                <button
                  type="button"
                  data-index={index}
                  onClick={() => setOpen(index)}
                  className="collage__tile group"
                >
                  <span className="media-zoom block">{photo.tile}</span>
                  <span className="collage__caption">{photo.caption}</span>
                  <span className="sr-only">Open full screen: {photo.alt}</span>
                </button>
              </li>
            ))}
          </ul>
        ))}
      </div>

      {left > 0 && (
        <div className="mt-10 flex justify-center">
          <button type="button" onClick={showMore} className="collage__more">
            Show {Math.min(PAGE, left)} more
          </button>
        </div>
      )}

      <Lightbox
        label="Gallery photos"
        photos={matching}
        index={open}
        onChange={setOpen}
        shareLink={photoLink}
      />
    </div>
  );
}
