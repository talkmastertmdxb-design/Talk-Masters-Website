"use client";

import { ArrowLeft, ArrowUp, RotateCcw, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { EchoQuestion, EchoScript, Settings } from "@/lib/content/schemas";
import { echoFacts } from "@/lib/echo/answers";
import {
  allQuestions,
  answerQuestion,
  answerTyped,
  ECHO_OPEN_EVENT,
  INITIAL_CHAT,
  loadChat,
  QUESTION_MAX_CHARS,
  saveChat,
  withEchoLine,
  withUserLine,
  type ChatState,
  type EchoReply as Reply,
} from "@/lib/echo/conversation";
import { media } from "@/lib/motion/tokens";
import { EchoReply } from "./EchoReply";

/** How long Echo's three lights show before an answer: long enough to feel like a reply. */
const THINKING_MS = 650;
/** Echo says "Want help?" once the page has settled, and only until the guest opens or dismisses it. */
const BUBBLE_DELAY_MS = 2200;
/** It then steps aside on its own, so it never sits over the page for long. */
const BUBBLE_SHOWN_MS = 9000;
/** Matches the bubble's exit in globals.css. */
const BUBBLE_EXIT_MS = 300;
const BUBBLE_SEEN_KEY = "tm-echo-bubble-seen";

type BubbleState = "hidden" | "shown" | "leaving";

const sessionStore = (): Storage | undefined => {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
};

/** Echo's face, cut from the 3D figure, for the chat's header. */
function EchoFace({ size }: { size: number }) {
  return (
    <span
      aria-hidden="true"
      className="bg-tm-blue ring-gold/60 inline-flex shrink-0 overflow-hidden rounded-full ring-1"
      style={{ width: size, height: size }}
    >
      <Image src="/images/mascot/echo-3d-head.png" alt="" width={size} height={size} sizes={`${size}px`} />
    </span>
  );
}

interface EchoChatProps {
  /** content/echo.json: every question and answer. */
  script: EchoScript;
  /** The meeting rule, for live facts such as the next meeting date. */
  meeting: Settings["meeting"];
}

/**
 * Echo, the guest guide: a launcher in the corner of every page and a chat panel that grows out of
 * it. Answers are the club's own, from content/echo.json: guests tap a topic and a question, or
 * type one and Echo finds the closest. No AI, no network. Opens from anywhere with `openEcho()`.
 */
export function EchoChat({ script, meeting }: EchoChatProps) {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState<ChatState>(INITIAL_CHAT);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [bubble, setBubble] = useState<BubbleState>("hidden");
  const loaded = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const choices = useRef<HTMLDivElement>(null);
  /** Set when a chip is tapped: that chip disappears, so focus moves to the first new one. */
  const refocusChoices = useRef(false);
  const panelId = useId();
  const titleId = useId();

  const questions = new Map(allQuestions(script).map((question) => [question.id, question]));

  /** Shows the guest's line, then Echo's answer after a short "thinking" beat. */
  const reply = useCallback((said: string, answer: () => Reply) => {
    window.clearTimeout(timer.current);
    setChat((current) => withUserLine(current, said));
    const deliver = () => {
      setThinking(false);
      setChat((current) => withEchoLine(current, answer()));
    };
    if (window.matchMedia(media.reducedMotion).matches) {
      deliver();
      return;
    }
    setThinking(true);
    timer.current = window.setTimeout(deliver, THINKING_MS);
  }, []);

  const ask = (question: EchoQuestion) => {
    refocusChoices.current = true;
    reply(question.question, () => answerQuestion(question, echoFacts(meeting, new Date())));
  };

  /** The bubble has done its job once the guest opens Echo or waves it away: not again this visit. */
  const retireBubble = useCallback(() => {
    setBubble((current) => (current === "shown" ? "leaving" : current));
    try {
      sessionStore()?.setItem(BUBBLE_SEEN_KEY, "1");
    } catch {
      // Storage blocked: the bubble may simply come back on the next page.
    }
  }, []);

  const show = useCallback(() => {
    retireBubble();
    if (!loaded.current) {
      loaded.current = true;
      setChat(loadChat(sessionStore()));
    }
    setOpen(true);
  }, [retireBubble]);

  const hide = useCallback(() => {
    setOpen(false);
    launcher.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStore()?.getItem(BUBBLE_SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;
    const appear = window.setTimeout(() => setBubble("shown"), BUBBLE_DELAY_MS);
    const leave = window.setTimeout(retireBubble, BUBBLE_DELAY_MS + BUBBLE_SHOWN_MS);
    return () => {
      window.clearTimeout(appear);
      window.clearTimeout(leave);
    };
  }, [retireBubble]);

  useEffect(() => {
    if (bubble !== "leaving") return;
    const gone = window.setTimeout(() => setBubble("hidden"), BUBBLE_EXIT_MS);
    return () => window.clearTimeout(gone);
  }, [bubble]);

  useEffect(() => {
    window.addEventListener(ECHO_OPEN_EVENT, show);
    return () => window.removeEventListener(ECHO_OPEN_EVENT, show);
  }, [show]);

  useEffect(() => {
    if (loaded.current) saveChat(sessionStore(), chat);
  }, [chat]);

  // Escape closes Echo wherever focus is, even mid-answer while the chips are away.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hide]);

  useEffect(() => {
    if (!refocusChoices.current || thinking) return;
    refocusChoices.current = false;
    choices.current?.querySelector("button")?.focus({ preventScroll: true });
  }, [chat.options, thinking]);

  // Newest line in view; a topic's list of questions from its first question down.
  useEffect(() => {
    const el = log.current;
    if (!el) return;
    const list = choices.current;
    if (chat.options.kind === "topic" && list && !thinking) {
      el.scrollTop += list.getBoundingClientRect().top - el.getBoundingClientRect().top - 12;
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, [chat, thinking, open]);

  // Under reduced motion every property eases over 0.01ms (globals.css), visibility included, so
  // the box can still count as hidden for a frame or two after the panel opens: retry until it's taken.
  useEffect(() => {
    if (!open) return;
    let frame = 0;
    let tries = 0;
    const focusBox = () => {
      const box = input.current;
      box?.focus({ preventScroll: true });
      if (box && document.activeElement !== box && ++tries < 10) frame = requestAnimationFrame(focusBox);
    };
    frame = requestAnimationFrame(focusBox);
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const typed = draft.trim().slice(0, QUESTION_MAX_CHARS);
    if (!typed || thinking) return;
    setDraft("");
    reply(typed, () => answerTyped(script, typed, echoFacts(meeting, new Date())));
  };

  const startOver = () => {
    window.clearTimeout(timer.current);
    setThinking(false);
    setChat(INITIAL_CHAT);
    input.current?.focus();
  };

  const choose = (next: ChatState["options"]) => {
    refocusChoices.current = true;
    setChat((current) => ({ ...current, options: next }));
  };

  const featured = script.featured.flatMap((id) => questions.get(id) ?? []);
  const { options } = chat;
  const topic = options.kind === "topic" ? script.topics.find((t) => t.id === options.topicId) : undefined;
  const offered: EchoQuestion[] =
    options.kind === "topic"
      ? (topic?.questions ?? [])
      : options.kind === "questions"
        ? options.ids.flatMap((id) => questions.get(id) ?? [])
        : [];

  return (
    <div className="echo" data-open={open}>
      <div className="echo-launch">
        {bubble !== "hidden" && (
          <div className="echo-bubble" data-leaving={bubble === "leaving" || undefined}>
            <button type="button" onClick={show} className="echo-bubble__say">
              Want help?
            </button>
            <button
              type="button"
              onClick={retireBubble}
              className="echo-bubble__close"
              aria-label="Hide Echo's message"
            >
              <X aria-hidden="true" className="size-3" strokeWidth={3} />
            </button>
          </div>
        )}
        <button
          ref={launcher}
          type="button"
          onClick={() => (open ? hide() : show())}
          aria-label="Ask Echo"
          aria-expanded={open}
          aria-controls={panelId}
          className="echo-launcher"
        >
          {/* Echo stands on a round stage, his head breaking out over its rim. */}
          <span className="echo-stage" aria-hidden="true">
            <span className="echo-stage__echo">
              <Image
                src="/images/mascot/echo-3d-v2.png"
                alt=""
                width={614}
                height={800}
                sizes="64px"
                priority={false}
              />
            </span>
          </span>
        </button>
      </div>

      <section
        id={panelId}
        role="dialog"
        aria-labelledby={titleId}
        aria-hidden={!open}
        inert={!open}
        className="echo-panel rounded-card text-ink bg-white"
      >
        <header className="bg-ink flex items-center gap-3 px-5 py-4 text-white">
          <EchoFace size={40} />
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-serif text-xl leading-tight">
              Echo
            </h2>
            <p className="text-xs text-white/65">Your guide to a first visit</p>
          </div>
          {chat.lines.length > 0 && (
            <button type="button" onClick={startOver} className="echo-icon-button" aria-label="Start over">
              <RotateCcw aria-hidden="true" className="size-4" />
            </button>
          )}
          <button type="button" onClick={hide} className="echo-icon-button" aria-label="Close Echo">
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>

        <div ref={log} data-lenis-prevent className="echo-log">
          <div role="log" aria-live="polite" className="flex flex-col gap-2.5">
            <div className="echo-line echo-line--echo">
              <EchoReply text={script.greeting} />
            </div>
            {chat.lines.map((line) => (
              <div key={line.id} className={`echo-line echo-line--${line.role}`}>
                {line.role === "echo" ? <EchoReply text={line.text} /> : line.text}
              </div>
            ))}
            {thinking && (
              <div className="echo-line echo-line--echo" aria-label="Echo is typing">
                <span className="echo-typing" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
          </div>

          {!thinking && (
            <div ref={choices} className="echo-options">
              {options.kind === "topics" ? (
                <>
                  {featured.length > 0 && (
                    <ul aria-label="Popular questions" className="echo-chips mb-4">
                      {featured.map((question) => (
                        <li key={question.id}>
                          <button type="button" onClick={() => ask(question)} className="echo-chip">
                            {question.question}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-eyebrow text-ink-muted mb-2">Browse by topic</p>
                  <ul aria-label="Topics" className="echo-chips">
                    {script.topics.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => choose({ kind: "topic", topicId: t.id })}
                          className="echo-chip echo-chip--topic"
                        >
                          {t.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  {topic && <p className="text-eyebrow text-ink-muted mb-2">{topic.label}</p>}
                  <ul aria-label="Questions" className="echo-chips">
                    {offered.map((question) => (
                      <li key={question.id}>
                        <button type="button" onClick={() => ask(question)} className="echo-chip">
                          {question.question}
                        </button>
                      </li>
                    ))}
                    <li>
                      <button
                        type="button"
                        onClick={() => choose({ kind: "topics" })}
                        className="echo-chip echo-chip--back"
                      >
                        <ArrowLeft aria-hidden="true" className="size-3.5" />
                        All topics
                      </button>
                    </li>
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="border-hairline border-t px-4 pt-3 pb-4">
          <div className="echo-field">
            <label htmlFor={`${panelId}-question`} className="sr-only">
              Type a question for Echo
            </label>
            <textarea
              ref={input}
              id={`${panelId}-question`}
              rows={1}
              value={draft}
              maxLength={QUESTION_MAX_CHARS}
              placeholder="Or type a question…"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) submit(event);
              }}
              className="echo-input"
            />
            <button
              type="submit"
              disabled={thinking || !draft.trim()}
              aria-label="Send"
              className="echo-send bg-gold text-ink"
            >
              <ArrowUp aria-hidden="true" className="size-4.5" strokeWidth={2.25} />
            </button>
          </div>
          <p className="text-ink-muted mt-2 text-[0.6875rem] leading-snug">
            Answers from the Talk-Masters team. Can&apos;t find yours? Message the club on WhatsApp.
          </p>
        </form>
      </section>
    </div>
  );
}
