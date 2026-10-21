"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Video } from "@/lib/content/schemas";
import { media } from "@/lib/motion/tokens";

/** ambient: muted, looping preview; watching: the visitor chose sound, so native controls take over. */
type Mode = "ambient" | "watching";

interface HighlightVideoProps {
  video: Video;
}

interface NetworkInformation {
  saveData?: boolean;
}

/** Autoplay is motion and data: never under reduced motion or Data Saver. */
function allowsAmbientPlay(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return connection?.saveData !== true && !window.matchMedia(media.reducedMotion).matches;
}

const formatDuration = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;

/**
 * A portrait video that previews muted while it is on screen (its captions are burned in,
 * so it reads without sound) and plays from the start with sound when asked.
 * Nothing downloads until it plays (preload="none"); the poster stands in until then.
 */
export function HighlightVideo({ video }: HighlightVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  /** Set when the visitor pauses the preview, so scrolling back never restarts it. */
  const userPaused = useRef(false);
  const [mode, setMode] = useState<Mode>("ambient");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || mode !== "ambient") return;
    // React doesn't reliably set the muted property, and browsers only autoplay muted video.
    el.muted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          el.pause();
        } else if (!userPaused.current && allowsAmbientPlay()) {
          el.play().catch(() => {
            // Autoplay refused (e.g. low-power mode): the poster and buttons remain.
          });
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mode]);

  const togglePreview = (): void => {
    const el = ref.current;
    if (!el) return;
    if (playing) {
      userPaused.current = true;
      el.pause();
    } else {
      userPaused.current = false;
      el.muted = true;
      void el.play().catch(() => undefined);
    }
  };

  const watchWithSound = (): void => {
    const el = ref.current;
    if (!el) return;
    setMode("watching");
    el.muted = false;
    el.currentTime = 0;
    void el.play().catch(() => undefined);
    el.focus();
  };

  const watching = mode === "watching";

  return (
    <figure className="relative mx-auto w-[min(100%,24rem,calc(78svh*9/16))]">
      <div className="rounded-panel relative aspect-[9/16] overflow-hidden bg-black shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)] ring-1 ring-white/10">
        <video
          ref={ref}
          className="absolute inset-0 size-full object-cover"
          poster={video.poster}
          preload="none"
          playsInline
          muted
          loop={!watching}
          controls={watching}
          aria-label={video.title}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(event) => {
            const { currentTime, duration } = event.currentTarget;
            setProgress(duration ? currentTime / duration : 0);
          }}
        >
          <source src={video.src} type="video/mp4" />
        </video>

        {!watching && (
          <>
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-white/15">
              <span
                className="bg-gold block h-full origin-left"
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>
            <p className="absolute top-4 left-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {formatDuration(video.durationSeconds)} · Captions on
            </p>
            <div className="from-ink/90 absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-linear-to-t to-transparent p-4 pt-20">
              <button
                type="button"
                onClick={togglePreview}
                aria-label={playing ? "Pause the preview" : "Play the preview without sound"}
                className="hover:border-gold inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm transition-colors duration-(--duration-quick)"
              >
                {playing ? (
                  <Pause aria-hidden="true" className="size-4" />
                ) : (
                  <Play aria-hidden="true" className="size-4" />
                )}
              </button>
              <button
                type="button"
                onClick={watchWithSound}
                className="text-ink hover:bg-gold inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold transition-colors duration-(--duration-quick)"
              >
                <Volume2 aria-hidden="true" className="size-4" />
                Play with sound
              </button>
            </div>
          </>
        )}
      </div>
      <figcaption className="sr-only">{video.title}</figcaption>
    </figure>
  );
}
