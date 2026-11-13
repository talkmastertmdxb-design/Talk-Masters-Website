import Image from "next/image";
import badge from "../../../public/brand/talk-masters-badge.webp";
import { remainingSentence, type LaunchPhase, type Remaining } from "@/lib/launch/launch";

const pad = (value: number): string => String(value).padStart(2, "0");
const unit = (value: number, word: string): string => (value === 1 ? word : `${word}s`);

/** The badge and name, not a link: there is nowhere to go yet. */
export function LaunchBrand() {
  return (
    <p className="launch-brand">
      <Image src={badge} alt="" width={44} height={44} sizes="44px" priority />
      <span>
        <span className="launch-brand__name">Talk-Masters</span>
        <span className="launch-brand__club">A Toastmasters International club</span>
      </span>
    </p>
  );
}

interface CountdownProps {
  remaining: Remaining;
  phase: LaunchPhase;
}

/**
 * Cards for each unit; leading zero units (0 days, 00 hours) are left out, so a short countdown
 * shows only what is left. In the final minute: one card of seconds. Screen readers get one
 * sentence that changes once a minute (role="timer" is never announced on its own).
 */
export function Countdown({ remaining: left, phase }: CountdownProps) {
  const finalMinute = phase !== "waiting";
  const all = [
    { value: left.days, text: String(left.days), word: "day" },
    { value: left.hours, text: pad(left.hours), word: "hour" },
    { value: left.minutes, text: pad(left.minutes), word: "minute" },
    { value: left.seconds, text: pad(left.seconds), word: "second" },
  ];
  // Always keep minutes and seconds; days and hours only while they are above zero.
  const firstNonZero = all.findIndex((part) => part.value > 0);
  const units = all.slice(firstNonZero < 0 ? 2 : Math.min(firstNonZero, 2));

  return (
    <div role="timer" className="launch-count">
      <span className="sr-only">
        {finalMinute ? "Less than a minute to go" : `${remainingSentence(left)} to go`}
      </span>
      {finalMinute ? (
        <span aria-hidden="true" className="launch-count__final">
          <span className="launch-count__num">{left.total}</span>
          <span className="launch-count__word">{unit(left.total, "second")} to go</span>
        </span>
      ) : (
        <span aria-hidden="true" className="launch-count__cards">
          {units.map((part) => (
            <span key={part.word} className="launch-count__card">
              <span className="launch-count__num">{part.text}</span>
              <span className="launch-count__word">{unit(part.value, part.word)}</span>
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
