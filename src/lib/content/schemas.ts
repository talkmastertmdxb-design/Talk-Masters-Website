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

/** Lowercase weekday names, Sunday first (the order Date#getDay uses). */
export const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function isTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Club photos are WebP only: smaller files, and every current browser supports it (docs/IMAGES.md). */
const localImage = /^\/images\/[\w./-]+\.webp$/i;
const localVideo = /^\/videos\/[\w./-]+\.mp4$/i;

/**
 * A short, compressed video in /public/videos (raw footage stays in assets/source/video).
 * Captions must be burned in: it plays muted until the visitor turns the sound on.
 */
export const videoSchema = z.object({
  src: z.string().regex(localVideo, "Use an .mp4 file in /public/videos, e.g. /videos/member-voices.mp4"),
  poster: z.string().regex(localImage, "Use a .webp image in /public/images"),
  /** What the video shows, for screen readers and as the player's accessible name. */
  title: z.string().min(1),
  durationSeconds: z.number().positive(),
  captionsBurnedIn: z.literal(true, "Burn the captions into the video so it works without sound"),
  /** Lines quoted word for word from the video, shown beside it. */
  quotes: z.array(z.string().min(1)).max(3, "Quote at most 3 lines").default([]),
});

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
  /** When regular meetings happen, e.g. the 1st and 3rd Saturday. The site works out the dates. */
  meeting: z.object({
    weekday: z.enum(WEEKDAYS),
    weeksOfMonth: z
      .array(z.number().int().min(1).max(5))
      .min(1, "Add at least one week, e.g. [1, 3] for the 1st and 3rd")
      .refine((weeks) => new Set(weeks).size === weeks.length, "List each week once"),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:MM, e.g. 19:00"),
    durationMinutes: z.number().int().positive(),
    /** IANA time zone the meeting times are in. */
    timeZone: z.string().refine(isTimeZone, "Use a time zone name such as Asia/Dubai").default("Asia/Dubai"),
    /** Dates with no meeting (holidays, Ramadan breaks), e.g. "2026-12-19". */
    cancelled: z.array(z.iso.date()).default([]),
    venue: z.string().min(1),
    city: z.string().min(1),
    mapUrl: z.url().optional(),
    placeholder,
  }),
  /** Optional: the club has no shared inbox yet, so guests contact officers on WhatsApp. */
  contactEmail: z.email().optional(),
  /** Who guests can message, in the order shown. */
  contacts: z
    .array(
      z.object({
        name: z.string().min(1),
        role: z.string().min(1),
        /** International format, digits only after the +, e.g. +971502837168. */
        whatsapp: z.string().regex(/^\+[1-9]\d{7,14}$/, "Use the international format, e.g. +971502837168"),
      }),
    )
    .min(1, "Add at least one contact"),
  socials: z
    .array(
      z.object({
        network: z.enum(["instagram", "linkedin", "facebook", "youtube", "whatsapp", "x"]),
        url: z.url(),
      }),
    )
    .default([]),
  stats: z.array(statSchema),
  /** Image slot ids the hero rotates through, first one first (it is also the intro photo). */
  heroSlides: z
    .array(imageSlotId)
    .min(1, "Add at least one hero photo")
    .max(5, "Keep the hero to 5 photos or fewer"),
  /** The members' video on the home page. Leave it out to hide the section. */
  highlightVideo: videoSchema.optional(),
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

export const PROFILE_NETWORKS = ["linkedin", "youtube", "x", "instagram", "website"] as const;

/** Each network's link must point at that network, so a typo can't send people somewhere else. */
const profileHosts: Record<(typeof PROFILE_NETWORKS)[number], RegExp> = {
  linkedin: /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//,
  youtube: /^https:\/\/(www\.)?youtube\.com\//,
  x: /^https:\/\/(www\.)?(x|twitter)\.com\//,
  instagram: /^https:\/\/(www\.)?instagram\.com\//,
  website: /^https:\/\//,
};

export const profileLinkSchema = z
  .object({ network: z.enum(PROFILE_NETWORKS), url: z.url() })
  .refine((link) => profileHosts[link.network].test(link.url), {
    message: "The link doesn't match its network (e.g. a linkedin.com address for LinkedIn)",
    path: ["url"],
  });

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
  /** Public profiles the member chose to share, shown in this order. One per network. */
  links: z
    .array(profileLinkSchema)
    .refine(
      (links) => new Set(links.map((link) => link.network)).size === links.length,
      "List each network once",
    )
    .default([]),
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
  /**
   * The profile's lead paragraph: their personal story with the club, or what Toastmasters
   * means to them. Not a repeat of their job title (that is `occupation`).
   */
  story: z.string().min(1),
  /** What they bring to the club, for "What [name] brings to the club". */
  contribution: z.string().min(1).optional(),
  /** The year they joined Talk-Masters, for "Member since 2024". */
  memberSince: z.number().int().min(1924).max(thisYear).optional(),
  /** Short club facts shown under the name, e.g. "Featured speaker, 100th meeting". */
  clubHighlights: z.array(z.string().min(1).max(48)).max(3, "Keep it to 3 highlights").default([]),
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
  division: z.string().min(1).optional(),
  area: z.string().min(1).optional(),
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
      "Use a .webp file in /public/images (convert JPG/PNG first) or an images.unsplash.com URL",
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
      /** 0 = first suitable search result; raise it to try the next one. */
      pick: z.number().int().nonnegative().optional(),
    })
    .optional(),
});

export type Settings = z.infer<typeof settingsSchema>;
export type ClubEvent = z.infer<typeof eventSchema>;
export type Member = z.infer<typeof memberSchema>;
export type ProfileLink = z.infer<typeof profileLinkSchema>;
export type ProfileNetwork = ProfileLink["network"];
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
export type Video = z.infer<typeof videoSchema>;

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
