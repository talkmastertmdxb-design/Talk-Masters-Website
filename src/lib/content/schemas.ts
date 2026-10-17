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

const consentedPerson = {
  name: z.string().min(1),
  role: z.string().min(1),
  imageSlot: imageSlotId.optional(),
  /** Written permission to publish name, words and photo (docs/PRD.md §8). */
  consent: z.boolean(),
  placeholder,
};

/** A story told in paragraphs, so members can write as much or as little as they like. */
const paragraphs = z.array(z.string().min(1)).min(1, "Add at least one paragraph");

const thisYear = new Date().getFullYear();

/** A member's own story: who they are, and how Toastmasters changed things. */
export const memberSchema = z.object({
  slug,
  ...consentedPerson,
  /** Job title, only if the member chose to share it. */
  occupation: z.string().min(1).optional(),
  /** Employer or school, only if the member chose to share it. */
  organisation: z.string().min(1).optional(),
  memberSince: z
    .number()
    .int()
    .min(1924)
    .max(thisYear + 1),
  /** One line, shown on cards. */
  quote: z.string().min(1),
  before: z.string().min(1),
  today: z.string().min(1),
  story: paragraphs,
  /** Shown on the home page. */
  featured: z.boolean().default(false),
  status: publishStatus,
});

export const founderSchema = z.object({
  slug,
  ...consentedPerson,
  occupation: z.string().min(1).optional(),
  quote: z.string().min(1),
  /** Their part of how the club began. */
  story: paragraphs,
});

/** The club's founding story (content/history.json). */
export const historySchema = z.object({
  foundedYear: z.number().int().min(1924).max(thisYear),
  charterDate: z.iso.date().optional(),
  clubNumber: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  story: paragraphs,
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
      "education",
      "other",
    ]),
    level: z.enum(["club", "area", "division", "district", "region", "international"]),
    year: z.string().regex(/^\d{4}-\d{4}$/, "Use the Toastmasters year, e.g. 2024-2025"),
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

export const officerSchema = z.object({
  slug,
  ...consentedPerson,
  term: z.string().min(1),
  bio: z.string().min(1),
});

export const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  placeholder,
});

export const tableTopicSchema = z.object({
  prompt: z.string().min(1),
});

export const imageSlotSchema = z.object({
  id: imageSlotId,
  alt: z.string().min(1),
  aspectRatio: z.string().regex(/^\d+\/\d+$/, "Use width/height, e.g. 4/5"),
  /** The photo this slot needs; shown on the placeholder until it arrives. */
  brief: z.string().min(1),
  /** Path under /public/images. null = placeholder. */
  src: z
    .string()
    .regex(/^\/images\/[\w./-]+\.(jpe?g|png|webp|avif)$/i, "Images must live in /public/images")
    .nullable(),
  focalPoint: z.string().optional(),
});

export type Settings = z.infer<typeof settingsSchema>;
export type ClubEvent = z.infer<typeof eventSchema>;
export type Member = z.infer<typeof memberSchema>;
export type Founder = z.infer<typeof founderSchema>;
export type History = z.infer<typeof historySchema>;
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
