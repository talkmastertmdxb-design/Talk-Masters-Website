import { z } from "zod";

/**
 * The guest-visit form hands off to WhatsApp, the club's most active channel (decided
 * 2026-10-22): the visitor's details become a message, ready to send to an officer.
 * Nothing is stored or sent by the site, so there is no server, consent or spam step.
 */

/** "What's coming up for you?" (docs/GROWTH_PLAN.md §6.2). Order is display order. */
export const MOMENTS = {
  interview: { label: "A job interview", sentence: "I have a job interview coming up." },
  pitch: { label: "A pitch or presentation", sentence: "I have a pitch or presentation to give." },
  promotion: { label: "A promotion", sentence: "I'm working towards a promotion." },
  toast: { label: "A wedding toast", sentence: "I'll be giving a speech at a wedding or celebration." },
  "new-in-dubai": { label: "New in Dubai", sentence: "I'm new in Dubai and looking for a community." },
  curious: { label: "Just curious", sentence: "I'm just curious to see what it's like." },
} as const;

export type Moment = keyof typeof MOMENTS;
export const MOMENT_IDS = Object.keys(MOMENTS) as Moment[];

/** The meeting choice when a guest hasn't picked a date. */
export const UNSURE = "unsure";

const NAME_MAX = 80;
export const NOTE_MAX = 500;

/** "" and whitespace count as "left out" for optional fields. */
const optionalText = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    schema.optional(),
  );

export const guestRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please tell us your name")
    .max(NAME_MAX, `Please keep your name under ${NAME_MAX} characters`),
  meeting: z.union([z.iso.date(), z.literal(UNSURE)], "Choose a meeting, or “Not sure yet”"),
  /** The officer's WhatsApp number; the form checks it against content/settings.json. */
  contact: z.string().regex(/^\+[1-9]\d{7,14}$/),
  moment: optionalText(z.enum(MOMENT_IDS as [Moment, ...Moment[]])),
  note: optionalText(z.string().trim().max(NOTE_MAX, `Please keep your note under ${NOTE_MAX} characters`)),
});

export type GuestRequest = z.infer<typeof guestRequestSchema>;

export interface GuestMessageParts {
  /** May be empty while the visitor is still typing. */
  name: string;
  contactName: string;
  /** "Saturday 7 November", or null when the guest isn't sure yet. */
  meetingLabel: string | null;
  moment?: Moment;
  note?: string;
}

/** The WhatsApp message, exactly as the officer will receive it. */
export function guestMessage({ name, contactName, meetingLabel, moment, note }: GuestMessageParts): string {
  const who = name.trim() || "[your name]";
  const when = meetingLabel
    ? ` at the meeting on ${meetingLabel}. Could you save me a seat?`
    : ". I'm not sure which date yet.";
  const opening = `Hi ${contactName}! I'm ${who}, and I'd like to visit Talk-Masters as a guest${when}`;
  return [opening, moment && MOMENTS[moment].sentence, note?.trim()].filter(Boolean).join("\n\n");
}
