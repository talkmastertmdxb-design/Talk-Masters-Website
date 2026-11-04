import type { EchoQuestion, EchoScript } from "@/lib/content/schemas";
import { fillAnswer, type EchoFacts } from "./answers";
import { whatsappLink } from "@/lib/content/contact";
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
  /** The page (see pageKey) the conversation last spoke about, so moving on is noticed once. */
  page?: string;
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
  return {
    ...chat,
    lines: [...chat.lines, { id: lineId(), role: "echo", text: reply.text }],
    options: reply.options,
  };
}

/** A chosen question's answer, followed by its related questions. */
export function answerQuestion(question: EchoQuestion, facts: EchoFacts): EchoReply {
  const related = question.related;
  return {
    text: fillAnswer(question.answer, facts),
    options: related.length > 0 ? { kind: "questions", ids: related } : { kind: "topics" },
  };
}

/** What a guest sends the club when Echo can't answer: their own question, already typed. */
export const askClubMessage = (typed: string): string => `Hi! I have a question about Talk-Masters: ${typed}`;

/**
 * A typed question: answered when it's clear, a few suggestions when close. Otherwise Echo says
 * so and offers WhatsApp to the club's contact, with the question already written.
 */
export function answerTyped(
  script: EchoScript,
  typed: string,
  facts: EchoFacts,
  whatsapp?: string,
): EchoReply {
  const match = matchQuestion(typed, allQuestions(script));
  if (match.kind === "answer") return answerQuestion(match.question, facts);
  if (match.kind === "suggest") {
    return { text: script.suggest, options: { kind: "questions", ids: match.questions.map((q) => q.id) } };
  }
  // Echo's replies carry links as [label](url): the five characters encodeURIComponent leaves
  // alone (! ' ( ) *) would end the link early or fail its safety check, so they are encoded too.
  const href = whatsapp
    ? whatsappLink(whatsapp, askClubMessage(typed)).replace(
        /[!'()*]/g,
        (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
      )
    : undefined;
  const ask = href
    ? ` [Ask the club on WhatsApp](${href})`
    : " Message the club on WhatsApp from [the guest page](/join).";
  return { text: `${script.fallback}${ask}`, options: { kind: "topics" } };
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
    const { lines, options, page } = parsed as Record<string, unknown>;
    if (!(Array.isArray(lines) && lines.every(isLine) && isOptions(options))) return INITIAL_CHAT;
    return typeof page === "string" ? { lines, options, page } : { lines, options };
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
