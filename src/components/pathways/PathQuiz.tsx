"use client";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Mic,
  RotateCcw,
  Smile,
  Sparkles,
  Store,
  Telescope,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import type { Pathway, Pathways } from "@/lib/content/schemas";

interface PathQuizProps {
  goals: Pathways["quiz"]["goals"];
  places: Pathways["quiz"]["places"];
  paths: readonly Pathway[];
}

type Step = "goal" | "place" | "result";

const goalIcons: Record<string, LucideIcon> = {
  speak: Mic,
  lead: Users,
  persuade: Handshake,
  inspire: Sparkles,
  vision: Telescope,
  humour: Smile,
};

const placeIcons: Record<string, LucideIcon> = {
  work: BriefcaseBusiness,
  study: GraduationCap,
  business: Store,
  community: HeartHandshake,
};

interface OptionProps {
  icon: LucideIcon;
  label: string;
  hint?: string;
  pressed?: boolean;
  onPick: () => void;
}

/** One answer: a whole card is the tap target, with its icon, words and a nudge arrow. */
function Option({ icon: Icon, label, hint, pressed, onPick }: OptionProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onPick}
      className="group hover:border-gold/70 focus-visible:border-gold aria-pressed:border-gold aria-pressed:bg-gold/10 flex min-h-[5.5rem] w-full items-center gap-4 rounded-2xl border border-white/12 bg-white/[0.035] px-5 py-4 text-left transition-colors duration-(--duration-quick) hover:bg-white/[0.06]"
    >
      <span
        aria-hidden="true"
        className="text-gold group-hover:bg-gold group-hover:text-ink inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06] transition-colors duration-(--duration-quick)"
      >
        <Icon className="size-5" strokeWidth={1.6} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-serif text-[1.25rem] leading-tight text-white">{label}</span>
        {hint && <span className="text-sm leading-snug text-white/62">{hint}</span>}
      </span>
      <ArrowRight
        aria-hidden="true"
        className="text-gold size-4 shrink-0 -translate-x-1 opacity-0 transition duration-(--duration-quick) group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      />
    </button>
  );
}

/**
 * "Find your path": two taps to a starting path. A suggestion, not a test: the result points to
 * the path's details and to a guest visit, where the VP Education helps members choose for real.
 * Focus moves to each new question so keyboard and screen-reader users follow along.
 */
export function PathQuiz({ goals, places, paths }: PathQuizProps) {
  const [step, setStep] = useState<Step>("goal");
  const [goalId, setGoalId] = useState<string | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [step]);

  const go = (next: Step) => {
    moved.current = true;
    setStep(next);
  };

  const goal = goals.find((g) => g.id === goalId);
  const place = places.find((p) => p.id === placeId);
  const path = paths.find((p) => p.slug === goal?.path);
  const progress = { goal: 1, place: 2, result: 2 }[step];
  const questionClass =
    "mt-3 font-serif text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] leading-[1.12] text-white outline-none";

  return (
    // data-quiz-done warms the section's stage light to gold (globals.css).
    <div
      data-quiz-done={step === "result" ? "" : undefined}
      className="rounded-[2rem] border border-white/14 bg-white/5 p-5 shadow-[0_40px_100px_rgb(0_0_0/0.35)] backdrop-blur-xl sm:p-8 md:p-10"
    >
      {step !== "result" && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold tracking-[0.12em] text-white/70 tabular-nums">
            {progress} / 2
          </span>
          <span aria-hidden="true" className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/12">
            <span
              className="bg-gold block h-full rounded-full transition-[width] duration-(--duration-base) ease-(--ease-deliver)"
              style={{ width: `${progress * 50}%` }}
            />
          </span>
        </div>
      )}

      {step === "goal" && (
        <fieldset className="mt-6">
          <legend className="sr-only">Question 1 of 2</legend>
          <h3 ref={heading} tabIndex={-1} className={questionClass}>
            What do you most want to get better at?
          </h3>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {goals.map((g) => (
              <Option
                key={g.id}
                icon={goalIcons[g.id] ?? Sparkles}
                label={g.label}
                hint={g.hint}
                pressed={g.id === goalId}
                onPick={() => {
                  setGoalId(g.id);
                  go("place");
                }}
              />
            ))}
          </div>
        </fieldset>
      )}

      {step === "place" && (
        <fieldset className="mt-6">
          <legend className="sr-only">Question 2 of 2</legend>
          <h3 ref={heading} tabIndex={-1} className={questionClass}>
            Where will you use it most?
          </h3>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {places.map((p) => (
              <Option
                key={p.id}
                icon={placeIcons[p.id] ?? Sparkles}
                label={p.label}
                pressed={p.id === placeId}
                onPick={() => {
                  setPlaceId(p.id);
                  go("result");
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go("goal")}
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/75 hover:text-white"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back
          </button>
        </fieldset>
      )}

      {step === "result" && path && (
        <section aria-live="polite" aria-labelledby="quiz-result">
          <p className="text-eyebrow text-gold">Your starting path</p>
          <h3
            id="quiz-result"
            ref={heading}
            tabIndex={-1}
            className="mt-4 font-serif text-[clamp(2.5rem,1.8rem+2.6vw,4rem)] leading-none text-white outline-none"
          >
            {path.name}
          </h3>
          <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-white/80">
            {path.focus} {place?.line}
          </p>
          <ul aria-label="You'll practise" className="mt-6 flex flex-wrap gap-2">
            {path.skills.map((skill) => (
              <li key={skill} className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-white">
                {skill}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-white/10 pt-6 text-sm text-white/65">
            A starting point, not a test: on your first visit our VP Education helps you choose for real.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <ButtonLink href="/join" className="min-h-14 px-8 text-base">
              Book a guest visit
            </ButtonLink>
            <Link
              href={`#${path.slug}`}
              className="nav-link inline-flex min-h-11 items-center font-semibold text-white"
            >
              Read about {path.name}
            </Link>
            <button
              type="button"
              onClick={() => {
                setGoalId(null);
                setPlaceId(null);
                go("goal");
              }}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/75 hover:text-white"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Start again
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
