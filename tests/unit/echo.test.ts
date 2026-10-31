import { describe, expect, it } from "vitest";
import { content } from "@/lib/content";
import { echoSchema, type EchoQuestion } from "@/lib/content/schemas";
import { echoFacts, fillAnswer } from "@/lib/echo/answers";
import {
  ECHO_OPEN_EVENT,
  ECHO_STORAGE_KEY,
  INITIAL_CHAT,
  allQuestions,
  answerQuestion,
  answerTyped,
  loadChat,
  openEcho,
  saveChat,
  withUserLine,
} from "@/lib/echo/conversation";
import { parseReply } from "@/lib/echo/links";
import { matchQuestion } from "@/lib/echo/match";

/** A Thursday in Dubai: the next meeting is Sunday 25 October (the 4th Sunday). */
const THURSDAY = new Date("2026-10-22T08:00:00Z");
const script = content.echo;
const facts = echoFacts(content.settings.meeting, THURSDAY);
const byId = (id: string) => allQuestions(script).find((question) => question.id === id)!;

describe("content/echo.json", () => {
  it("has a question bank across every topic, each with an answer and keywords", () => {
    expect(script.topics.length).toBeGreaterThanOrEqual(5);
    expect(allQuestions(script).length).toBeGreaterThanOrEqual(30);
  });

  it("rejects duplicate ids, unknown related questions and unknown {tokens}", () => {
    const question = (id: string, extra: Partial<EchoQuestion> = {}) => ({
      id,
      question: "Q?",
      answer: "A.",
      keywords: ["q"],
      ...extra,
    });
    const echo = (questions: unknown[]) => ({
      greeting: "Hi",
      suggest: "Maybe?",
      fallback: "Sorry",
      topics: [{ id: "t", label: "T", questions }],
    });
    expect(echoSchema.safeParse(echo([question("a"), question("a")])).success).toBe(false);
    expect(echoSchema.safeParse(echo([question("a", { related: ["missing"] })])).success).toBe(false);
    expect(echoSchema.safeParse(echo([question("a", { answer: "On {sometime}." })])).success).toBe(false);
    expect(echoSchema.safeParse(echo([question("a", { answer: "At {venue}." })])).success).toBe(true);
  });
});

describe("echoFacts and fillAnswer (live facts in answers)", () => {
  it("fills meeting facts from the site's settings", () => {
    expect(facts).toMatchObject({
      schedule: "2nd & 4th Sunday of every month",
      time: "10:30 am – 12:30 pm",
      start: "10:30 am",
      arrive: "10:15 am",
      venue: "Hor Al Anz Public Library, Dubai",
      nextMeeting: "on Sunday 25 October",
    });
    expect(fillAnswer(byId("when-where").answer, facts)).toContain(
      "on the 2nd & 4th Sunday of every month, 10:30 am – 12:30 pm, at Hor Al Anz Public Library, Dubai",
    );
  });

  it("falls back sensibly when a fact is missing", () => {
    const meeting = {
      ...content.settings.meeting,
      weeksOfMonth: [],
      arriveTime: undefined,
      mapUrl: undefined,
    };
    const missing = echoFacts(meeting, THURSDAY);
    expect(missing.nextMeeting).toBe("still to be announced: ask us on WhatsApp");
    expect(missing.arrive).toBe("10:30 am");
    // A link with no address keeps only its words.
    expect(fillAnswer("[Open the map]({mapUrl})", missing)).toBe("Open the map");
  });

  it("produces only safe links in every answer", () => {
    for (const question of allQuestions(script)) {
      const links = parseReply(fillAnswer(question.answer, facts)).filter(
        (segment) => segment.type === "link",
      );
      for (const link of links) expect(link.type === "link" && link.href).toMatch(/^(\/|https:\/\/)/);
    }
  });
});

describe("matchQuestion (typed questions)", () => {
  const questions = allQuestions(script);
  const answered = (query: string) => {
    const result = matchQuestion(query, questions);
    return result.kind === "answer" ? result.question.id : result.kind;
  };

  it.each([
    ["parking?", "parking"],
    ["How much does it cost to become a member", "fees"],
    ["can I wear jeans", "wear"],
    ["I'm scared of public speaking", "nervous"],
    ["when is the next meeting", "when-where"],
    ["Is breakfast included?", "food"],
    ["What are table topics", "table-topics"],
    ["How do I book a guest visit?", "book"],
    ["can my kids come", "children"],
    ["Do you meet on zoom", "online"],
  ])("answers %j with %s", (query, id) => {
    expect(answered(query)).toBe(id);
  });

  it("offers a few close questions when it can't tell which one is meant", () => {
    const result = matchQuestion("how long", questions);
    expect(result.kind).toBe("suggest");
    if (result.kind === "suggest") {
      expect(result.questions.length).toBeGreaterThan(1);
      expect(result.questions.length).toBeLessThanOrEqual(3);
      expect(result.questions.map((question) => question.id)).toEqual(
        expect.arrayContaining(["how-long", "path-length"]),
      );
    }
  });

  it("admits it doesn't know rather than guessing", () => {
    expect(answered("what's the weather like in Paris")).toBe("none");
    expect(answered("   ")).toBe("none");
    expect(answered("?!")).toBe("none");
  });
});

describe("the conversation", () => {
  it("starts with the topics and no lines", () => {
    expect(INITIAL_CHAT).toEqual({ lines: [], options: { kind: "topics" } });
  });

  it("answers a chosen question, then offers its related questions", () => {
    const asked = withUserLine(INITIAL_CHAT, "Will I have to speak?");
    const reply = answerQuestion(byId("will-speak"), facts);
    expect(asked.lines).toHaveLength(1);
    expect(asked.lines[0]).toMatchObject({ role: "user", text: "Will I have to speak?" });
    expect(INITIAL_CHAT.lines).toHaveLength(0);
    expect(reply.text).toContain("Only if you want to");
    expect(reply.options).toEqual({ kind: "questions", ids: ["nervous", "table-topics"] });
  });

  it("answers typed questions, suggests, or falls back to WhatsApp and the topics", () => {
    expect(answerTyped(script, "parking?", facts).text).toBe("Yes, parking is free on Sundays.");
    const suggest = answerTyped(script, "how long", facts);
    expect(suggest.text).toBe(script.suggest);
    expect(suggest.options.kind).toBe("questions");
    expect(answerTyped(script, "tell me a joke about cats", facts)).toEqual({
      text: script.fallback,
      options: { kind: "topics" },
    });
  });

  it("remembers the chat for the tab, and survives blocked or corrupted storage", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    };
    const chat = withUserLine(INITIAL_CHAT, "Hi");
    saveChat(storage, chat);
    expect(loadChat(storage)).toEqual(chat);
    saveChat(storage, INITIAL_CHAT);
    expect(store.has(ECHO_STORAGE_KEY)).toBe(false);
    expect(loadChat(storage)).toEqual(INITIAL_CHAT);

    store.set(ECHO_STORAGE_KEY, "{not json");
    expect(loadChat(storage)).toEqual(INITIAL_CHAT);
    store.set(ECHO_STORAGE_KEY, JSON.stringify({ lines: [{ id: 1, role: "admin" }], options: {} }));
    expect(loadChat(storage)).toEqual(INITIAL_CHAT);
    expect(loadChat(undefined)).toEqual(INITIAL_CHAT);

    const blocked = {
      setItem: () => {
        throw new Error("QuotaExceeded");
      },
      removeItem: () => {},
    };
    expect(() => saveChat(blocked, chat)).not.toThrow();
  });

  it("opens Echo from anywhere on the page", () => {
    let heard = 0;
    const listener = () => heard++;
    window.addEventListener(ECHO_OPEN_EVENT, listener);
    openEcho();
    window.removeEventListener(ECHO_OPEN_EVENT, listener);
    expect(heard).toBe(1);
  });
});

describe("parseReply (links in Echo's answers)", () => {
  it("turns markdown links to the club's own pages and WhatsApp into links", () => {
    expect(parseReply("Book on [the guest page](/join) or [WhatsApp](https://wa.me/971502837168).")).toEqual([
      { type: "text", text: "Book on " },
      { type: "link", text: "the guest page", href: "/join" },
      { type: "text", text: " or " },
      { type: "link", text: "WhatsApp", href: "https://wa.me/971502837168" },
      { type: "text", text: "." },
    ]);
  });

  it("allows the venue's map link", () => {
    const [segment] = parseReply("[Map](https://www.google.com/maps/search/?api=1&query=Library)");
    expect(segment).toEqual({
      type: "link",
      text: "Map",
      href: "https://www.google.com/maps/search/?api=1&query=Library",
    });
  });

  it("keeps only the label of any other link", () => {
    expect(
      parseReply("See [this](https://evil.example) or [that](javascript:alert(1)) or [x](//evil.example)"),
    ).toEqual([{ type: "text", text: "See this or that or x" }]);
  });

  it("drops markdown emphasis markers, and returns nothing for an empty reply", () => {
    expect(parseReply("You are **very** welcome")).toEqual([{ type: "text", text: "You are very welcome" }]);
    expect(parseReply("")).toEqual([]);
  });
});

describe("Echo's featured questions and the club's latest answers", () => {
  const questions = allQuestions(script);
  const answered = (query: string) => {
    const result = matchQuestion(query, questions);
    return result.kind === "answer" ? result.question.id : result.kind;
  };

  it("leads with what Talk-Masters is and what happens there", () => {
    expect(script.featured).toEqual(["what-talkmasters", "what-happens", "book"]);
    expect(byId("what-talkmasters").question).toBe("What is Talk-Masters?");
    expect(byId("what-happens").question).toBe("What happens at Talk-Masters?");
  });

  it("rejects a featured question that doesn't exist", () => {
    const echo = {
      greeting: "Hi",
      suggest: "Maybe?",
      fallback: "Sorry",
      featured: ["missing"],
      topics: [
        { id: "t", label: "T", questions: [{ id: "a", question: "Q?", answer: "A.", keywords: ["q"] }] },
      ],
    };
    expect(echoSchema.safeParse(echo).success).toBe(false);
  });

  it("knows children are welcome, She Leads, and that meetings are in person", () => {
    expect(byId("children").answer).toMatch(/children and teenagers are welcome/);
    expect(byId("events").answer).toContain("She Leads");
    expect(fillAnswer(byId("online").answer, facts)).toBe(
      "Not at the moment: all our meetings are in person, at Hor Al Anz Public Library, Dubai.",
    );
    for (const id of ["children", "events", "online"]) expect(byId(id).placeholder).toBe(false);
  });

  it.each([
    ["What is Talk-Masters?", "what-talkmasters"],
    ["tell me about talkmasters", "what-talkmasters"],
    ["what is she leads", "events"],
    ["are kids welcome", "children"],
  ])("answers %j with %s", (query, id) => {
    expect(answered(query)).toBe(id);
  });
});
