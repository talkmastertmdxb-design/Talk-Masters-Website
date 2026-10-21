/**
 * Signature moment S3, "Inside a meeting" (SCROLL_ANIMATION_SYSTEM.md, Animations 10-12).
 * Scroll progress drives the meeting clock from 10:30 to 12:15.
 */

export interface AgendaItem {
  time: string;
  title: string;
  body: string;
  imageSlot: string;
}

export const agenda: readonly AgendaItem[] = [
  {
    time: "10:30",
    title: "Welcome",
    body: "Guests are greeted at the door, given a name badge and a seat. You'll meet the meeting's host, the Toastmaster.",
    imageSlot: "agenda-welcome",
  },
  {
    time: "10:40",
    title: "Prepared Speeches",
    body: "Members give speeches they've planned, each one a step in their own learning path. Five to seven minutes, timed with lights.",
    imageSlot: "agenda-prepared-speeches",
  },
  {
    time: "11:15",
    title: "Table Topics",
    body: "Volunteers answer a surprise question for one to two minutes. Guests can try it, or just enjoy watching.",
    imageSlot: "agenda-table-topics",
  },
  {
    time: "11:45",
    title: "Evaluations",
    body: "Every speaker gets kind, specific feedback: what worked, and one thing to try next time.",
    imageSlot: "agenda-evaluations",
  },
  {
    time: "12:15",
    title: "Awards",
    body: "The room votes for the best speaker, evaluator and Table Topics answer. Then everyone stays to chat.",
    imageSlot: "agenda-awards",
  },
];

const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h! * 60 + m!;
};

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

/** Index of the card in focus. Each card owns an equal share of the scroll. */
export function activeAgendaIndex(progress: number): number {
  return Math.round(clamp01(progress) * (agenda.length - 1));
}

/** Clock for any scroll position, interpolating between agenda times (e.g. 10:57 mid-way). */
export function agendaClock(progress: number): string {
  const position = clamp01(progress) * (agenda.length - 1);
  const index = Math.min(Math.floor(position), agenda.length - 2);
  const from = toMinutes(agenda[index]!.time);
  const to = toMinutes(agenda[index + 1]!.time);
  const minutes = Math.round(from + (to - from) * (position - index));
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}
