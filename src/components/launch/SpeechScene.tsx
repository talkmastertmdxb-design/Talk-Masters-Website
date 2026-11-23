"use client";

import gsap from "gsap";
import { useRef } from "react";
import type { LaunchPhase } from "@/lib/launch/launch";
import { AppleIcon, GoogleCalendarIcon, OutlookIcon } from "./CalendarIcons";
import { Countdown, LaunchBrand } from "./LaunchParts";
import type { SceneProps } from "./scenes";
import { useFinale, type FinaleBuilder } from "./useFinale";

const SIGNALS: Record<LaunchPhase, string> = {
  waiting: "The timing light comes on in the final minute.",
  green: "Green: the final minute has begun.",
  amber: "Amber: thirty seconds to go.",
  red: "Red: the speaker is about to begin.",
  live: "The new website is opening.",
};

/**
 * At zero the words step back, the stage light opens out from the speaker across the whole page,
 * the welcome line lands, and the light settles into the site's ink before the site loads (whose
 * home page then opens with its own intro, on the same ink).
 */
const openTheStage: FinaleBuilder = (q) =>
  gsap
    .timeline()
    .to(q(".sp__words, .sp__more"), { opacity: 0, y: 14, duration: 0.45, ease: "power2.in" }, 0.2)
    .fromTo(
      q(".sp__curtain"),
      { clipPath: "circle(0% at 72% 45%)" },
      { clipPath: "circle(150% at 72% 45%)", duration: 1.2, ease: "power3.inOut" },
      0.35,
    )
    .fromTo(
      q(".sp__welcome"),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      1.2,
    )
    .to(q(".sp__welcome"), { opacity: 0, duration: 0.35, ease: "power2.in" }, 2.5)
    .to(q(".sp__curtain"), { backgroundColor: "#0b1220", duration: 0.5, ease: "none" }, 2.55);

function Swoosh() {
  return (
    <svg className="sp__swoosh" viewBox="0 0 520 26" aria-hidden="true" focusable="false">
      <path d="M4 20 C 140 2, 330 0, 516 14" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="sp__cta-icon">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function Chevron({ direction }: { direction: "down" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={`sp__chevron sp__chevron--${direction}`}>
      <path d={direction === "down" ? "m6 9 6 6 6-6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}

function CalendarGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="sp__date-icon">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function SpeechScene({
  remaining,
  phase,
  dateLine,
  calendar,
  previewSeconds,
  photo,
  venueLine,
  finale,
  onFinaleDone,
}: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  useFinale(root, finale, openTheStage, onFinaleDone);

  return (
    <div ref={root} className="sp" data-phase={phase}>
      <div className="sp__words">
        <LaunchBrand />

        <div>
          <h1 className="sp__title">
            <span className="sp__line">A new stage.</span> <em className="sp__line">A louder voice.</em>
          </h1>
          <Swoosh />
        </div>

        <p className="sp__lead">Talk-Masters is getting ready for its next chapter. Be there when it opens.</p>

        <div className="sp__count">
          <p className="sp__eyebrow">The big reveal begins in</p>
          <Countdown remaining={remaining} phase={phase} />
          <p className="sp__when">{dateLine}, Dubai</p>
          <p className="sp__signal">
            <span aria-hidden="true" className="sp__lamps">
              <span className="sp__lamp sp__lamp--green" />
              <span className="sp__lamp sp__lamp--amber" />
              <span className="sp__lamp sp__lamp--red" />
            </span>
            <span>{SIGNALS[phase]}</span>
          </p>
        </div>

        <div className="sp__actions">
          <a className="sp__cta" href={calendar.google} target="_blank" rel="noopener noreferrer">
            Remind me on the day
            <BellIcon />
            <span className="sr-only"> (adds the launch to Google Calendar, opens in a new tab)</span>
          </a>
          <a className="sp__more-link" href="#save-the-date">
            More ways to save the date
            <Chevron direction="down" />
          </a>
        </div>
      </div>

      <section id="save-the-date" className="sp__more" aria-labelledby="save-the-date-title">
        <div className="sp__save">
          <h2 id="save-the-date-title" className="sp__save-title">
            Save the date
          </h2>
          <ul>
            <li>
              <a href={calendar.google} target="_blank" rel="noopener noreferrer">
                <GoogleCalendarIcon className="sp__app-icon" />
                Google Calendar<span className="sr-only"> (opens in a new tab)</span>
                <Chevron direction="right" />
              </a>
            </li>
            <li>
              <a href={calendar.ics} download="talk-masters-launch.ics">
                <AppleIcon className="sp__app-icon" />
                Apple Calendar
                <Chevron direction="right" />
              </a>
            </li>
            <li>
              <a href={calendar.ics} download="talk-masters-launch.ics">
                <OutlookIcon className="sp__app-icon" />
                Outlook
                <Chevron direction="right" />
              </a>
            </li>
          </ul>
        </div>
        <p className="sp__note">Talk-Masters Club · Sunday meetings at {venueLine}</p>
        {previewSeconds !== null && (
          <p className="sp__preview">Preview rehearsal. The live site is not affected.</p>
        )}
      </section>

      <div className="sp__stage">
        <span aria-hidden="true" className="sp__echo" />
        <figure className="sp__photo">
          {photo}
          <figcaption>Your turn is coming</figcaption>
        </figure>
        <p className="sp__date">
          <span className="sp__date-day">
            <CalendarGlyph />
            {dateLine}
          </span>
          <span className="sp__date-place">Dubai, UAE</span>
        </p>
      </div>

      <div aria-hidden="true" className="sp__curtain">
        <p className="sp__welcome">
          Welcome to the <em>new</em> Talk-Masters.
        </p>
      </div>
    </div>
  );
}
