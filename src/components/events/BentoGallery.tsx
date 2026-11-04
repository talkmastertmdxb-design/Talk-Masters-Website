"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Lightbox, type LightboxPhoto } from "@/components/media/Lightbox";
import { bentoSpan } from "@/lib/bento";

export interface BentoPhoto extends LightboxPhoto {
  /** The tile, rendered on the server (an ImageSlot). */
  tile: ReactNode;
}

interface BentoGalleryProps {
  label: string;
  photos: readonly BentoPhoto[];
}

/**
 * Bento gallery: photos from the day on an asymmetric grid, the best one first and largest.
 * Each tile opens the photo full screen (Lightbox).
 */
export function BentoGallery({ label, photos }: BentoGalleryProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <ul aria-label={label} className="bento">
        {photos.map((item, index) => {
          const span = bentoSpan(index, photos.length);
          return (
            <li
              key={item.id}
              className="bento__tile"
              style={
                {
                  "--wide-col": span.wide[0],
                  "--wide-row": span.wide[1],
                  "--narrow-col": span.narrow,
                } as CSSProperties
              }
            >
              <button type="button" onClick={() => setOpen(index)} className="bento__button group">
                <span className="media-zoom block h-full">{item.tile}</span>
                <span className="sr-only">Open full screen: {item.alt}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Lightbox label={label} photos={photos} index={open} onChange={setOpen} />
    </>
  );
}
