"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useEffect, useRef, type KeyboardEvent } from "react";

export interface LightboxPhoto {
  id: string;
  src: string;
  alt: string;
  /** Where the photo is from, e.g. "Session 80, 10 August 2025". */
  caption?: string;
}

interface LightboxProps {
  /** Names the dialog until a photo is open. */
  label: string;
  photos: readonly LightboxPhoto[];
  /** The open photo's position in `photos`, or null when closed. */
  index: number | null;
  onChange: (index: number | null) => void;
}

/**
 * A photo full screen in a native modal <dialog>: Esc or a click outside closes it, ←/→ step
 * through `photos` (wrapping round), and focus returns to whatever opened it.
 */
export function Lightbox({ label, photos, index, onChange }: LightboxProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const photo = index === null ? undefined : photos[index];

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (photo && !el.open) el.showModal();
    else if (!photo && el.open) el.close();
  }, [photo]);

  const step = (by: number) => {
    if (index !== null && photos.length > 0) onChange((index + by + photos.length) % photos.length);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") step(-1);
    else if (event.key === "ArrowRight") step(1);
  };

  return (
    <dialog
      ref={dialog}
      aria-label={photo ? photo.alt : label}
      className="lightbox"
      onKeyDown={onKeyDown}
      onClose={() => onChange(null)}
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
            <p className="text-muted max-w-[60ch] text-sm">
              {photo.caption && <span className="mr-2 font-semibold text-white">{photo.caption}</span>}
              {photo.alt}
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-muted text-sm tabular-nums">
                {(index ?? 0) + 1} of {photos.length}
              </span>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="lightbox__btn"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next photo" className="lightbox__btn">
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
  );
}
