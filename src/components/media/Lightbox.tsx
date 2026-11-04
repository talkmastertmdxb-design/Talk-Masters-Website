"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Share2, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

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
  /** A link that opens this photo, for the Share button. Without it there is no Share button. */
  shareLink?: (photo: LightboxPhoto) => string;
}

/** How far a swipe must travel before it changes photo. */
const SWIPE_PX = 40;

/**
 * A photo full screen in a native modal <dialog>: Esc or a click outside closes it, ←/→ or a
 * swipe step through `photos` (wrapping round), and focus returns to whatever opened it. With
 * `shareLink`, a Share button hands the photo's link to the phone's share sheet, or copies it.
 */
export function Lightbox({ label, photos, index, onChange, shareLink }: LightboxProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const swipeStart = useRef<number | null>(null);
  const [shared, setShared] = useState<string | null>(null);
  const photo = index === null ? undefined : photos[index];

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (photo && !el.open) el.showModal();
    else if (!photo && el.open) el.close();
  }, [photo]);

  const step = (by: number) => {
    setShared(null);
    if (index !== null && photos.length > 0) onChange((index + by + photos.length) % photos.length);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") step(-1);
    else if (event.key === "ArrowRight") step(1);
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipeStart.current === null) return;
    const travel = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(travel) >= SWIPE_PX) step(travel < 0 ? 1 : -1);
  };

  const share = async () => {
    if (!photo || !shareLink) return;
    const url = shareLink(photo);
    try {
      if (navigator.share) {
        await navigator.share({ title: photo.caption ?? "Talk-Masters", text: photo.alt, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared("Link copied");
    } catch (error) {
      // Closing the share sheet is not a failure; anything else is shown, never swallowed.
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShared("Couldn't share. Copy the address bar instead.");
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-label={photo ? photo.alt : label}
      className="lightbox"
      onKeyDown={onKeyDown}
      onClose={() => {
        setShared(null);
        onChange(null);
      }}
      onClick={(event) => event.target === event.currentTarget && dialog.current?.close()}
    >
      {photo && (
        <div className="lightbox__frame">
          <div
            className="relative min-h-0 flex-1 touch-pan-y"
            onPointerDown={(event) => (swipeStart.current = event.clientX)}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (swipeStart.current = null)}
          >
            <Image
              key={photo.id}
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="100vw"
              draggable={false}
              className="object-contain select-none"
            />
          </div>
          <div className="lightbox__bar">
            <p className="text-muted max-w-[60ch] text-sm">
              {photo.caption && <span className="mr-2 font-semibold text-white">{photo.caption}</span>}
              {photo.alt}
            </p>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <span aria-live="polite" className="text-gold text-sm">
                {shared}
              </span>
              <span className="text-muted text-sm tabular-nums">
                {(index ?? 0) + 1} of {photos.length}
              </span>
              {shareLink && (
                <button type="button" onClick={share} aria-label="Share this photo" className="lightbox__btn">
                  <Share2 aria-hidden="true" className="size-4" />
                </button>
              )}
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
