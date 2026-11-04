import { describe, expect, it } from "vitest";
import { content } from "@/lib/content";
import { echoSchema } from "@/lib/content/schemas";
import {
  BUBBLE_MEMORY_KEY,
  EMPTY_MEMORY,
  QUIET_AFTER,
  loadBubbleMemory,
  rememberNudge,
  saveBubbleMemory,
  shouldNudge,
} from "@/lib/echo/bubble";
import { allQuestions } from "@/lib/echo/conversation";
import { DEFAULT_NUDGE, nowOnLine, pageKey, pageScript } from "@/lib/echo/pages";
import { PUBLIC_PAGES } from "@/lib/seo/public-pages";

const script = content.echo;
const ids = new Set(allQuestions(script).map((question) => question.id));

describe("Echo's page scripts (content/echo.json)", () => {
  it("has lines for every public page, each offering questions that exist", () => {
    expect(script.pages.map((page) => page.path).toSorted()).toEqual(
      PUBLIC_PAGES.map((page) => page.path).toSorted(),
    );
    for (const page of script.pages) {
      expect(page.questions.length, page.path).toBeGreaterThanOrEqual(2);
      for (const id of page.questions) expect(ids.has(id), `${page.path}: ${id}`).toBe(true);
    }
  });

  it("rejects an unknown page, a repeated page and a question that doesn't exist", () => {
    const base = {
      greeting: "Hi",
      suggest: "Maybe?",
      fallback: "Sorry",
      topics: [
        {
          id: "t",
          label: "T",
          questions: ["a", "b"].map((id) => ({ id, question: "Q?", answer: "A.", keywords: ["q"] })),
        },
      ],
    };
    const page = (path: string, questions = ["a", "b"]) => ({
      path,
      name: "the page",
      nudge: "Hello?",
      greeting: "Hi there.",
      questions,
    });
    expect(echoSchema.safeParse({ ...base, pages: [page("/events")] }).success).toBe(true);
    expect(echoSchema.safeParse({ ...base, pages: [page("/nowhere")] }).success).toBe(false);
    expect(echoSchema.safeParse({ ...base, pages: [page("/events"), page("/events")] }).success).toBe(false);
    expect(echoSchema.safeParse({ ...base, pages: [page("/events", ["a", "missing"])] }).success).toBe(false);
  });
});

describe("pageKey and pageScript", () => {
  it("reads the page from any path, hash or query", () => {
    expect(pageKey("/")).toBe("/");
    expect(pageKey("/events")).toBe("/events");
    expect(pageKey("/events#she-leads")).toBe("/events");
    expect(pageKey("/gallery?photo=x")).toBe("/gallery");
  });

  it("speaks to the page the guest is on", () => {
    const gallery = pageScript(script, "/gallery");
    expect(gallery.nudge).toBe("Looking for a photo of yourself?");
    expect(gallery.questions).toContain("gallery-remove");
    expect(nowOnLine(gallery)).toBe("Now you're on the Gallery. Here's what people often ask here.");
  });

  it("falls back to the general greeting on a page without its own lines", () => {
    expect(pageScript(script, "/styleguide")).toMatchObject({
      nudge: DEFAULT_NUDGE,
      greeting: script.greeting,
      questions: script.featured,
    });
  });
});

describe("the bubble's memory", () => {
  it("speaks once on each kind of page", () => {
    const afterEvents = rememberNudge(EMPTY_MEMORY, "/events", false);
    expect(shouldNudge(afterEvents, "/events")).toBe(false);
    expect(shouldNudge(afterEvents, "/gallery")).toBe(true);
    expect(rememberNudge(afterEvents, "/events", false).seen).toEqual(["/events"]);
  });

  it(`goes quiet for the visit after ${QUIET_AFTER} dismissals`, () => {
    let memory = rememberNudge(EMPTY_MEMORY, "/events", true);
    expect(shouldNudge(memory, "/gallery")).toBe(true);
    memory = rememberNudge(memory, "/gallery", true);
    expect(shouldNudge(memory, "/pathways")).toBe(false);
  });

  it("is kept for the tab, and survives blocked or corrupted storage", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    };
    const memory = rememberNudge(EMPTY_MEMORY, "/events", true);
    saveBubbleMemory(storage, memory);
    expect(loadBubbleMemory(storage)).toEqual(memory);

    store.set(BUBBLE_MEMORY_KEY, "{not json");
    expect(loadBubbleMemory(storage)).toEqual(EMPTY_MEMORY);
    store.set(BUBBLE_MEMORY_KEY, JSON.stringify({ seen: [1], dismissals: "x" }));
    expect(loadBubbleMemory(storage)).toEqual(EMPTY_MEMORY);
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(loadBubbleMemory(blocked)).toEqual(EMPTY_MEMORY);
    expect(() => saveBubbleMemory(blocked, memory)).not.toThrow();
  });
});
