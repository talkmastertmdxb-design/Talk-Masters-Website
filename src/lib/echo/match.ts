import type { EchoQuestion } from "@/lib/content/schemas";

export type MatchResult =
  | { kind: "answer"; question: EchoQuestion }
  | { kind: "suggest"; questions: EchoQuestion[] }
  | { kind: "none" };

/** Words that say nothing about the topic ("how do I…", "is there…"). */
const STOP_WORDS = new Set(
  (
    "a an the i im i'm me my we our you your is are am be do does did can could will would should " +
    "to of in on at for and or it its there this that what how when where who which any if about " +
    "with have has get go please there's whats"
  ).split(" "),
);

/** A keyword in the question scores this much; a phrase one more. A shared word scores 1. */
const KEYWORD_SCORE = 2;
const PHRASE_BONUS = 1;
/** An answer is given only when it's this far ahead of the next best. */
const CLEAR_LEAD = 2;
const MAX_SUGGESTIONS = 3;

const stem = (word: string): string =>
  word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word;

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
    .map((word) => stem(word.replace(/'/g, "")));
}

function score(query: string[], question: EchoQuestion): number {
  const padded = ` ${query.join(" ")} `;
  const keywordScore = question.keywords.reduce((total, keyword) => {
    const phrase = words(keyword);
    if (phrase.length === 0 || !padded.includes(` ${phrase.join(" ")} `)) return total;
    return total + KEYWORD_SCORE + (phrase.length > 1 ? PHRASE_BONUS : 0);
  }, 0);
  const own = new Set(words(question.question));
  const shared = new Set(query.filter((word) => own.has(word))).size;
  return keywordScore + shared;
}

/**
 * Finds the question a guest typed: the answer when one is clearly best, a few to choose from
 * when it's close, and nothing when no keyword matches, so Echo never guesses.
 */
export function matchQuestion(query: string, questions: readonly EchoQuestion[]): MatchResult {
  const typed = words(query);
  if (typed.length === 0) return { kind: "none" };
  const ranked = questions
    .map((question) => ({ question, score: score(typed, question) }))
    .filter((entry) => entry.score >= KEYWORD_SCORE)
    .toSorted((a, b) => b.score - a.score);

  const [best, runnerUp] = ranked;
  if (!best) return { kind: "none" };
  if (!runnerUp || best.score - runnerUp.score >= CLEAR_LEAD)
    return { kind: "answer", question: best.question };
  return { kind: "suggest", questions: ranked.slice(0, MAX_SUGGESTIONS).map((entry) => entry.question) };
}
