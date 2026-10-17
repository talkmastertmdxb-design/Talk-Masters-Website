import { z } from "zod";

/**
 * One schema per content type. Types, validation and the future Google Drive
 * sync all derive from this file (see docs/ARCHITECTURE.md §4).
 */

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase-kebab-case, e.g. open-house-evening");

/** Marks club-supplied content that has not been confirmed yet. Blocks launch. */
const placeholder = z.boolean().default(false);

const publishStatus = z.enum(["draft", "published"]);
const imageSlotId = slug;

/** A story told in paragraphs, so people can write as much or as little as they like. */
const paragraphs = z.array(z.string().min(1)).min(1, "Add at least one paragraph");

const thisYear = new Date().getFullYear();

export const statSchema = z.object({
  label: z.string().min(1),
  value: z.number().int().nonnegative(),
  suffix: z.string().default(""),
  placeholder,
});

export const settingsSchema = z.object({
  clubName: z.string().min(1),
  parentOrganisation: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  meeting: z.object({
    schedule: z.string().min(1),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:MM, e.g. 19:00"),
    durationMinutes: z.number().int().positive(),
    venue: z.string().min(1),
    city: z.string().min(1),
    mapUrl: z.url().optional(),
    placeholder,
  }),
  contactEmail: z.email(),
  socials: z
    .array(
      z.object({
        network: z.enum(["instagram", "linkedin", "facebook", "youtube", "whatsapp", "x"]),
        url: z.url(),
      }),
    )
    .default([]),
  stats: z.array(statSchema),
  placeholder,
});

export const eventSchema = z
  .object({
    slug,
    title: z.string().min(1),
    type: z.enum(["meeting", "contest", "workshop", "social", "other"]),
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }).optional(),
    venue: z.string().min(1),
    summary: z.string().min(1),
    status: publishStatus,
    imageSlot: imageSlotId.optional(),
    placeholder,
  })
  .refine((event) => !event.endsAt || Date.parse(event.endsAt) > Date.parse(event.startsAt), {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  });

const person = {
  name: z.string().min(1),
  imageSlot: imageSlotId.optional(),
  /** Written permission to publish name, words and photo (docs/CONTENT_REQUESTS.md). */
  consent: z.boolean(),
  placeholder,
};

const consentedPerson = { ...person, role: z.string().min(1) };

/** Plan.md member journey milestones. */
export const JOURNEY_MILESTONES = [
  "first-meeting",
  "first-table-topic",
  "first-speech",
  "leadership-role",
  "other",
] as const;

/**
 * A member directory card plus its expanded journey (Plan.md §Members Page).
 * Position, work, company and LinkedIn are all optional: members choose what to share.
 */
export const memberSchema = z.object({
  slug,
  ...person,
  /** Club position, if any (e.g. Vice President Education). */
  position: z.string().min(1).optional(),
  /** Degree or job role. */
  occupation: z.string().min(1).optional(),
  /** Company or organisation. */
  organisation: z.string().min(1).optional(),
  linkedin: z
    .url()
    .regex(/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//, "Use a linkedin.com profile link")
    .optional(),
  /** For the future directory filter. */
  segment: z.enum(["student", "professional", "executive", "alumni", "officer"]).optional(),
  /** Before Toastmasters: the challenge they faced, in one sentence. */
  challenge: z.string().min(1),
  /** Today: their transformation, in one sentence. */
  transformation: z.string().min(1),
  journey: z
    .array(z.object({ milestone: z.enum(JOURNEY_MILESTONES), text: z.string().min(1) }))
    .min(1, "Add at least one journey milestone"),
  impact: z
    .object({
      career: z.string().min(1).optional(),
      leadership: z.string().min(1).optional(),
      confidence: z.string().min(1).optional(),
      networking: z.string().min(1).optional(),
    })
    .refine((impact) => Object.values(impact).some(Boolean), "Describe at least one area of impact"),
  /** One piece of advice for new guests. */
  advice: z.string().min(1),
  /** Shown in the home page Member Spotlight. */
  spotlight: z.boolean().default(false),
  status: publishStatus,
});

export const founderSchema = z.object({
  slug,
  ...consentedPerson,
  /** Degree or profession. */
  profession: z.string().min(1).optional(),
  quote: z.string().min(1),
  /** Their personal story. */
  story: paragraphs,
});

/** The founders timeline, exactly as in Plan.md. Order matters. */
export const FOUNDING_STAGES = [
  "idea",
  "planning",
  "club-formation",
  "chartering",
  "first-meeting",
  "first-achievement",
  "today",
] as const;

/** The club's founding story for /our-story (content/history.json). */
export const historySchema = z.object({
  foundedYear: z.number().int().min(1924).max(thisYear),
  charterDate: z.iso.date().optional(),
  clubNumber: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  /** Why Talk-Masters was created. */
  why: paragraphs,
  timeline: z
    .array(
      z.object({
        stage: z.enum(FOUNDING_STAGES),
        /** Free text, e.g. "March 2019". */
        date: z.string().min(1).optional(),
        text: z.string().min(1),
      }),
    )
    .refine(
      (items) =>
        items.length === FOUNDING_STAGES.length &&
        items.every((item, i) => item.stage === FOUNDING_STAGES[i]),
      { message: `The timeline must list every stage in order: ${FOUNDING_STAGES.join(" → ")}` },
    ),
  legacy: z.string().min(1),
  placeholder,
});

/**
 * Toastmasters recognition. Programme years run July to June, e.g. "2024-2025".
 * Smedley = the Smedley Award for adding new members in August and September.
 */
export const awardSchema = z
  .object({
    slug,
    title: z.string().min(1),
    programme: z.enum([
      "distinguished-club",
      "smedley",
      "talk-up-toastmasters",
      "beat-the-clock",
      "contest",
      "representation",
      "education",
      "other",
    ]),
    level: z.enum(["club", "area", "division", "district", "region", "international"]),
    year: z.string().regex(/^\d{4}-\d{4}$/, "Use the Toastmasters year, e.g. 2024-2025"),
    /** When it happened, if known. Places it on the achievement timeline. */
    achievedOn: z.iso.date().optional(),
    /** Omit when the club itself won; otherwise the member's name (with their consent). */
    recipient: z.string().min(1).optional(),
    description: z.string().min(1),
    imageSlot: imageSlotId.optional(),
    placeholder,
  })
  .refine(
    (award) => {
      const [start, end] = award.year.split("-").map(Number);
      return end === start! + 1;
    },
    { message: "A Toastmasters year spans two consecutive years, e.g. 2024-2025", path: ["year"] },
  );

export const testimonialSchema = z.object({
  quote: z.string().min(1),
  ...consentedPerson,
});

/** Executive Committee member (home section and /team). */
export const officerSchema = z.object({
  slug,
  ...consentedPerson,
  term: z.string().min(1),
  /** Personal leadership statement. */
  statement: z.string().min(1),
  bio: z.string().min(1).optional(),
});

export const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  placeholder,
});

export const tableTopicSchema = z.object({
  prompt: z.string().min(1),
});

const localImage = /^\/images\/[\w./-]+\.(jpe?g|png|webp|avif)$/i;
const unsplashImage = /^https:\/\/images\.unsplash\.com\/photo-[\w-]+(\?[\w=&.%-]*)?$/;

export const imageSlotSchema = z.object({
  id: imageSlotId,
  alt: z.string().min(1),
  aspectRatio: z.string().regex(/^\d+\/\d+$/, "Use width/height, e.g. 4/5"),
  /** The photo this slot needs; shown on the placeholder until it arrives. */
  brief: z.string().min(1),
  /** /images/… (club photo) or an Unsplash CDN URL (temporary stock). null = placeholder. */
  src: z
    .string()
    .refine(
      (src) => localImage.test(src) || unsplashImage.test(src),
      "Use a file in /public/images or an images.unsplash.com URL",
    )
    .nullable(),
  focalPoint: z.string().optional(),
  /** Set by scripts/fetch-unsplash.ts. Shown on /credits. */
  credit: z.object({ name: z.string().min(1), profileUrl: z.url(), photoUrl: z.url() }).optional(),
  /** How to fill this slot from Unsplash until a real club photo exists. Never for portraits. */
  unsplash: z
    .object({
      photoId: z.string().min(1).optional(),
      query: z.string().min(1),
      orientation: z.enum(["landscape", "portrait", "squarish"]),
    })
    .optional(),
});

export type Settings = z.infer<typeof settingsSchema>;
export type ClubEvent = z.infer<typeof eventSchema>;
export type Member = z.infer<typeof memberSchema>;
export type JourneyMilestone = (typeof JOURNEY_MILESTONES)[number];
export type Founder = z.infer<typeof founderSchema>;
export type History = z.infer<typeof historySchema>;
export type FoundingStage = (typeof FOUNDING_STAGES)[number];
export type Award = z.infer<typeof awardSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type Officer = z.infer<typeof officerSchema>;
export type Faq = z.infer<typeof faqSchema>;
export type TableTopic = z.infer<typeof tableTopicSchema>;
export type ImageSlot = z.infer<typeof imageSlotSchema>;

export class ContentError extends Error {
  constructor(source: string, details: string) {
    super(`Invalid content in ${source}:\n${details}`);
    this.name = "ContentError";
  }
}

/** Validates content and fails with an error a non-developer can act on. */
export function parseContent<T extends z.ZodType>(schema: T, data: unknown, source: string): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ContentError(source, z.prettifyError(result.error));
  }
  return result.data;
}
