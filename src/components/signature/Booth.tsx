"use client";

import { Pause, Play, RotateCcw, Shuffle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { nextTopicIndex, ringOffset } from "@/lib/booth/booth";
import { formatSpeechTime, TABLE_TOPIC, timingSignal, type TimingSignal } from "@/lib/motion/timing";

interface BoothProps {
  topics: readonly string[];
}

type Status = "idle" | "running" | "paused";

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Stop automatically 30 seconds after red, like a real timer would wave you off. */
const AUTO_STOP = TABLE_TOPIC.red + 30;

const lightCopy: Record<TimingSignal, { label: string; announce: string }> = {
  off: { label: "Thinking time", announce: "" },
  green: { label: "Green", announce: "Green light: one minute. You've reached the minimum time." },
  amber: { label: "Amber", announce: "Amber light: one minute thirty. Start wrapping up." },
  red: { label: "Red", announce: "Red light: two minutes. Time to finish your thought." },
};

/** Signature moment S4: a real Table Topic, timed like a real meeting. No recording, no microphone. */
export function Booth({ topics }: BoothProps) {
  const [topic, setTopic] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const banked = useRef(0);
  const startedAt = useRef(0);

  useEffect(() => {
    if (status !== "running") return;
    const tick = () => {
      const seconds = banked.current + (performance.now() - startedAt.current) / 1000;
      setElapsed(Math.min(seconds, AUTO_STOP));
      if (seconds >= AUTO_STOP) setStatus("paused");
    };
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [status]);

  const shuffle = () => {
    setTopic((current) => nextTopicIndex(current, topics.length));
    reset();
  };
  const start = () => {
    startedAt.current = performance.now();
    setStatus("running");
  };
  const pause = () => {
    banked.current = elapsed;
    setStatus("paused");
  };
  const reset = () => {
    banked.current = 0;
    setElapsed(0);
    setStatus("idle");
  };

  const seconds = Math.floor(elapsed);
  const signal = timingSignal(seconds, TABLE_TOPIC);
  const finished = status === "paused" && seconds >= TABLE_TOPIC.green;

  return (
    <div
      data-signal={signal}
      className="booth rounded-panel border-hairline-dark bg-surface/70 border p-6 backdrop-blur md:p-10"
    >
      <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-muted text-sm">Your topic</p>
          <p aria-live="polite" className="text-h3 mt-3 min-h-[2.3em] max-w-[24ch]">
            {topic === null ? "Press “Give me a topic” to get a surprise question." : topics[topic]}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={shuffle} className="booth-btn booth-btn-primary">
              <Shuffle aria-hidden="true" className="size-4" />
              {topic === null ? "Give me a topic" : "New topic"}
            </button>
            {status === "running" ? (
              <button type="button" onClick={pause} className="booth-btn">
                <Pause aria-hidden="true" className="size-4" /> Pause
              </button>
            ) : (
              <button type="button" onClick={start} disabled={topic === null} className="booth-btn">
                <Play aria-hidden="true" className="size-4" />{" "}
                {status === "paused" ? "Resume" : "Start speaking"}
              </button>
            )}
            <button type="button" onClick={reset} disabled={elapsed === 0} className="booth-btn">
              <RotateCcw aria-hidden="true" className="size-4" /> Reset
            </button>
          </div>
        </div>

        <div className="relative mx-auto size-52 md:size-60">
          <svg viewBox="0 0 100 100" aria-hidden="true" className="size-full -rotate-90">
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="3" />
            <circle
              className="booth-ring"
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={ringOffset(elapsed, TABLE_TOPIC.red, CIRCUMFERENCE)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="booth-lamp size-3 rounded-full" aria-hidden="true" />
            <span
              className="mt-3 font-serif text-5xl tabular-nums"
              role="timer"
              aria-label={`Elapsed ${formatSpeechTime(seconds)}`}
            >
              {formatSpeechTime(seconds)}
            </span>
            <span className="text-muted mt-1 text-sm">{lightCopy[signal].label}</span>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="assertive">
        {status === "running" ? lightCopy[signal].announce : ""}
      </p>

      {finished && (
        <div className="border-hairline-dark mt-10 flex flex-col gap-4 border-t pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-lead max-w-[40ch]">
            You just did a Table Topic. Do it for real at our next meeting.
          </p>
          <ButtonLink href="/join">Book a guest visit</ButtonLink>
        </div>
      )}
    </div>
  );
}
