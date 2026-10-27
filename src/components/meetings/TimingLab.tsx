"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SpeechTiming } from "@/lib/content/schemas";
import { formatSpeechTime, timingSignal, type TimingSignal } from "@/lib/motion/timing";

interface TimingLabProps {
  timing: readonly SpeechTiming[];
}

/** A whole speech, to 30 seconds past red, plays back in this many seconds. */
const PLAYBACK_SECONDS = 12;
/** Past red, a speaker has about 30 seconds of grace to finish. */
const GRACE = 30;

const SIGNAL_TEXT: Record<TimingSignal, string> = {
  off: "No light yet",
  green: "Green: the minimum is reached",
  amber: "Amber: start bringing it home",
  red: "Red: time to land it",
};

/**
 * The timer's lights, to try: pick a kind of speech, then play it at speed or drag through
 * it. Green at the minimum, amber halfway, red at the maximum (src/lib/motion/timing.ts).
 */
export function TimingLab({ timing }: TimingLabProps) {
  const [choice, setChoice] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = useRef<number | null>(null);
  const elapsed = useRef(0);
  const moveTo = (value: number) => {
    elapsed.current = value;
    setSeconds(value);
  };

  const speech = timing[choice] ?? timing[0]!;
  const end = speech.red + GRACE;
  const signal = timingSignal(seconds, speech);

  useEffect(() => {
    if (!playing) return;
    const speed = end / PLAYBACK_SECONDS;
    let last = performance.now();
    const tick = (now: number) => {
      const step = ((now - last) / 1000) * speed;
      last = now;
      const next = Math.min(end, elapsed.current + step);
      elapsed.current = next;
      setSeconds(next);
      if (next >= end) {
        setPlaying(false);
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [playing, end]);

  const pick = (index: number) => {
    setChoice(index);
    moveTo(0);
    setPlaying(false);
  };

  const toggle = () => {
    if (!playing && seconds >= end) moveTo(0);
    setPlaying((value) => !value);
  };

  const at = (value: number) => `${(value / end) * 100}%`;

  return (
    <div className="timing-lab grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16" data-signal={signal}>
      <div className="flex flex-col gap-8 lg:col-span-5">
        <fieldset>
          <legend className="text-muted text-sm">Choose a speech</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {timing.map((item, index) => (
              <label key={item.label} className="timing-lab__choice">
                <input
                  type="radio"
                  name="speech"
                  className="sr-only"
                  checked={index === choice}
                  onChange={() => pick(index)}
                />
                <span className="font-semibold">{item.label}</span>
                <span className="text-sm text-white/65">
                  {formatSpeechTime(item.green)}–{formatSpeechTime(item.red)} · {item.detail}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <dl className="grid grid-cols-3 gap-3 text-sm">
          {(["green", "amber", "red"] as const).map((light) => (
            <div key={light} className="border-hairline-dark border-t pt-3">
              <dt className="text-white/65 capitalize">{light}</dt>
              <dd className="mt-1 font-serif text-2xl tabular-nums">{formatSpeechTime(speech[light])}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-panel border-hairline-dark flex flex-col items-center gap-8 border bg-white/[0.03] p-6 sm:p-10 lg:col-span-7">
        <div className="flex w-full items-center justify-between gap-6">
          <span aria-hidden="true" className="timing-lab__lamp" />
          <p className="text-right">
            <span className="block font-serif text-[clamp(3.5rem,2.5rem+4vw,6rem)] leading-none tabular-nums">
              {formatSpeechTime(Math.floor(seconds))}
            </span>
            <span className="text-muted mt-2 block text-sm" aria-live="polite">
              {SIGNAL_TEXT[signal]}
            </span>
          </p>
        </div>

        <div className="w-full">
          <div aria-hidden="true" className="relative h-2 rounded-full bg-white/10">
            <span
              className="timing-lab__zone bg-signal-green"
              style={{ left: at(speech.green), width: at(speech.amber - speech.green) }}
            />
            <span
              className="timing-lab__zone bg-gold"
              style={{ left: at(speech.amber), width: at(speech.red - speech.amber) }}
            />
            <span
              className="timing-lab__zone bg-signal-red"
              style={{ left: at(speech.red), width: at(GRACE) }}
            />
          </div>
          <label className="sr-only" htmlFor="speech-time">
            Time into the speech
          </label>
          <input
            id="speech-time"
            type="range"
            min={0}
            max={end}
            step={1}
            value={Math.floor(seconds)}
            aria-valuetext={`${formatSpeechTime(Math.floor(seconds))}, ${SIGNAL_TEXT[signal]}`}
            onChange={(event) => {
              setPlaying(false);
              moveTo(Number(event.target.value));
            }}
            className="timing-lab__range -mt-2 w-full"
          />
          <div aria-hidden="true" className="text-muted mt-2 flex justify-between text-xs tabular-nums">
            <span>0:00</span>
            <span>{formatSpeechTime(end)}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={toggle}
            className="timing-lab__button bg-gold text-ink hover:bg-gold-hover"
          >
            {playing ? (
              <Pause aria-hidden="true" className="size-4" />
            ) : (
              <Play aria-hidden="true" className="size-4" />
            )}
            {playing ? "Pause" : seconds > 0 && seconds < end ? "Resume" : "Play the speech"}
          </button>
          <button
            type="button"
            onClick={() => pick(choice)}
            className="timing-lab__button border border-white/25 text-white hover:border-white/60"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
