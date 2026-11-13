"use client";

import gsap from "gsap";
import Image from "next/image";
import { Fragment, useRef, type CSSProperties } from "react";
import speaker from "../../../public/images/launch/speech-animation.webp";
import type { LaunchPhase } from "@/lib/launch/launch";
import { Countdown, LaunchBrand } from "./LaunchParts";
import type { SceneProps } from "./scenes";
import { useFinale, type FinaleBuilder } from "./useFinale";

/** The headline is "read out": a highlighter sweeps under each word as it is spoken. */
const WORDS = ["Something", "big", "is", "about", "to", "take", "the", "stage."] as const;
const WORD_GAP_S = 0.42;

const SIGNALS: Record<LaunchPhase, string> = {
  waiting: "The timing light comes on in the final minute.",
  green: "Green: the final minute has begun.",
  amber: "Amber: thirty seconds to go.",
  red: "Red: the speaker is about to begin.",
  live: "The new website is opening.",
};

/**
 * At zero the highlighter finishes the sentence, sweeps across the whole page in coral, the
 * welcome line lands, and the coral deepens into the site's ink before the site loads (whose
 * home page then opens with its own intro, on the same ink).
 */
const sweep: FinaleBuilder = (q) =>
  gsap
    .timeline()
    .set(q(".sp__word"), { backgroundSize: "100% 100%" })
    .to(q(".sp__text, .sp__art"), { opacity: 0, y: 14, duration: 0.4, ease: "power2.in" }, 0.35)
    .fromTo(q(".sp__sweep"), { scaleX: 0 }, { scaleX: 1, duration: 0.95, ease: "power3.inOut" }, 0.45)
    .fromTo(
      q(".sp__welcome"),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      1.25,
    )
    .to(q(".sp__welcome"), { opacity: 0, duration: 0.35, ease: "power2.in" }, 2.45)
    .to(q(".sp__sweep"), { backgroundColor: "#0b1220", duration: 0.5, ease: "none" }, 2.5);

function Grain() {
  return (
    <svg className="sp__grain" aria-hidden="true" focusable="false">
      <filter id="sp-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#sp-grain)" />
    </svg>
  );
}

export function SpeechScene({
  remaining,
  phase,
  dateLine,
  calendar,
  previewSeconds,
  finale,
  onFinaleDone,
}: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  useFinale(root, finale, sweep, onFinaleDone);

  return (
    <div ref={root} className="sp" data-phase={phase}>
      <span aria-hidden="true" className="sp__grad" />
      <span aria-hidden="true" className="sp__silk" />
      <Grain />

      <div className="sp__top">
        <LaunchBrand />
      </div>

      <div className="sp__text">
        <p className="sp__date">{dateLine}, Dubai time</p>
        <h1 className="sp__title">
          {WORDS.map((word, index) => (
            <Fragment key={word}>
              <span
                className="sp__word"
                style={{ animationDelay: `${(index * WORD_GAP_S).toFixed(2)}s` } as CSSProperties}
              >
                {word}
              </span>{" "}
            </Fragment>
          ))}
        </h1>
        <p className="sp__lead">
          Talk-Masters Club is preparing a brand new website. Be there when it opens.
        </p>
        <div className="sp__count">
          <Countdown remaining={remaining} phase={phase} />
          <p className="sp__signal">
            <span aria-hidden="true" className="sp__lamps">
              <span className="sp__lamp sp__lamp--green" />
              <span className="sp__lamp sp__lamp--amber" />
              <span className="sp__lamp sp__lamp--red" />
            </span>
            <span>{SIGNALS[phase]}</span>
          </p>
        </div>
        <p className="sp__save">
          Save the date:{" "}
          <a href={calendar.google} target="_blank" rel="noopener noreferrer">
            Google Calendar<span className="sr-only"> (opens in a new tab)</span>
          </a>{" "}
          or <a href={calendar.ics}>Apple or Outlook</a>
        </p>
        {previewSeconds !== null && (
          <p className="sp__preview">Preview rehearsal. The live site is not affected.</p>
        )}
      </div>

      <div className="sp__art">
        {/* Animated: served as is (the optimizer would keep only the first frame). */}
        <Image src={speaker} alt="" priority unoptimized sizes="(min-width: 56.25rem) 40vw, 260px" />
      </div>

      <div aria-hidden="true" className="sp__sweep">
        <p className="sp__welcome">Welcome to the new Talk-Masters.</p>
      </div>
    </div>
  );
}
