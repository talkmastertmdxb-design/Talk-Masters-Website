import type { EchoQuestion, EchoScript } from "@/lib/content/schemas";
import { fillAnswer, type EchoFacts } from "./answers";
import { matchQuestion } from "./match";

/** A line in the chat window. */
export interface ChatLine {
  id: string;
  role: "user" | "echo";
  text: string;
}

/** The chips under the chat: every topic, one topic's questions, or a chosen few. */
export type ChatOptions =
  { kind: "topics" } | { kind: "topic"; topicId: string } | { kind: "questions"; ids: string[] };

export interface ChatState {
  lines: ChatLine[];
  options: ChatOptions;
}

/** What Echo says next, and the chips that follow it. */
export interface EchoReply {
  text: string;
  options: ChatOptions;
}

export const INITIAL_CHAT: ChatState = { lines: [], options: { kind: "topics" } };
export const ECHO_OPEN_EVENT = "echo:open";
export const ECHO_STORAGE_KEY = "tm-echo-chat-v2";
/** Typed questions are short; anything longer is cut, not refused. */
export const QUESTION_MAX_CHARS = 200;

/** Opens Echo from anywhere on the page (the FAQ's "Ask Echo" button). */
export function openEcho(): void {
  window.dispatchEvent(new CustomEvent(ECHO_OPEN_EVENT));
}

export const allQuestions = (script: EchoScript): EchoQuestion[] =>
  script.topics.flatMap((topic) => topic.questions);

let nextId = 0;
const lineId = () => `${Date.now().toString(36)}-${(nextId++).toString(36)}`;

export function withUserLine(chat: ChatState, text: string): ChatState {
  return { ...chat, lines: [...chat.lines, { id: lineId(), role: "user", text }] };
}

export function withEchoLine(chat: ChatState, reply: EchoReply): ChatState {
  return { lines: [...chat.lines, { id: lineId(), role: "echo", text: reply.text }], options: reply.options };
}

/** A chosen question's answer, followed by its related questions. */
export function answerQuestion(question: EchoQuestion, facts: EchoFacts): EchoReply {
  const related = question.related;
  return {
    text: fillAnswer(question.answer, facts),
    options: related.length > 0 ? { kind: "questions", ids: related } : { kind: "topics" },
  };
}

/** A typed question: answered when it's clear, a few suggestions when close, otherwise WhatsApp. */
export function answerTyped(script: EchoScript, typed: string, facts: EchoFacts): EchoReply {
  const match = matchQuestion(typed, allQuestions(script));
  if (match.kind === "answer") return answerQuestion(match.question, facts);
  if (match.kind === "suggest") {
    return { text: script.suggest, options: { kind: "questions", ids: match.questions.map((q) => q.id) } };
  }
  return { text: script.fallback, options: { kind: "topics" } };
}

const isLine = (value: unknown): value is ChatLine => {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.id === "string" &&
    (line.role === "user" || line.role === "echo") &&
    typeof line.text === "string"
  );
};

const isOptions = (value: unknown): value is ChatOptions => {
  if (typeof value !== "object" || value === null) return false;
  const options = value as Record<string, unknown>;
  if (options.kind === "topics") return true;
  if (options.kind === "topic") return typeof options.topicId === "string";
  return (
    options.kind === "questions" &&
    Array.isArray(options.ids) &&
    options.ids.every((id) => typeof id === "string")
  );
};

/** The chat so far in this browser tab; a fresh start if storage is blocked or holds anything unexpected. */
export function loadChat(storage: Pick<Storage, "getItem"> | undefined): ChatState {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(ECHO_STORAGE_KEY) ?? "null");
    if (typeof parsed !== "object" || parsed === null) return INITIAL_CHAT;
    const { lines, options } = parsed as Record<string, unknown>;
    return Array.isArray(lines) && lines.every(isLine) && isOptions(options)
      ? { lines, options }
      : INITIAL_CHAT;
  } catch {
    return INITIAL_CHAT;
  }
}

/** Keeps the chat for this tab only; a full or blocked storage is not worth interrupting the guest. */
export function saveChat(
  storage: Pick<Storage, "setItem" | "removeItem"> | undefined,
  chat: ChatState,
): void {
  try {
    if (chat.lines.length === 0) storage?.removeItem(ECHO_STORAGE_KEY);
    else storage?.setItem(ECHO_STORAGE_KEY, JSON.stringify(chat));
  } catch {
    // Private mode or quota: the chat simply isn't remembered.
  }
}
