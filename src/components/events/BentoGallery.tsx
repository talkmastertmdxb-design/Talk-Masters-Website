"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { bentoSpan } from "@/lib/bento";
import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

export interface BentoPhoto {
  id: string;
  src: string;
  alt: string;
  /** The tile, rendered on the server (an ImageSlot). */
  tile: ReactNode;
}

interface BentoGalleryProps {
  label: string;
  photos: readonly BentoPhoto[];
}

/**
 * Bento gallery: photos from the day on an asymmetric grid, the best one first and largest.
 * Each tile opens the photo full screen in a native <dialog> (Esc closes, ←/→ step through).
 */
export function BentoGallery({ label, photos }: BentoGalleryProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  const show = (index: number) => {
    setOpen(index);
    if (!dialog.current?.open) dialog.current?.showModal();
  };
  const step = (by: number) =>
    setOpen((index) => (index === null ? null : (index + by + photos.length) % photos.length));
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") step(-1);
    else if (event.key === "ArrowRight") step(1);
  };
  const photo = open === null ? undefined : photos[open];

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
              <button type="button" onClick={() => show(index)} className="bento__button group">
                <span className="media-zoom block h-full">{item.tile}</span>
                <span className="sr-only">Open full screen: {item.alt}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialog}
        aria-label={photo ? photo.alt : label}
        className="lightbox"
        onKeyDown={onKeyDown}
        onClose={() => setOpen(null)}
        onClick={(event) => event.target === event.currentTarget && dialog.current?.close()}
      >
        {photo && (
          <div className="lightbox__frame">
            <div className="relative min-h-0 flex-1">
              <Image
                key={photo.id}
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <div className="lightbox__bar">
              <p className="text-muted max-w-[60ch] text-sm">{photo.alt}</p>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-muted text-sm tabular-nums">
                  {(open ?? 0) + 1} of {photos.length}
                </span>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="lightbox__btn"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="lightbox__btn"
                >
                  <ArrowRight aria-hidden="true" className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => dialog.current?.close()}
                  aria-label="Close"
                  className="lightbox__btn"
                  autoFocus
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
