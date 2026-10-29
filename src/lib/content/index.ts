import { z } from "zod";
import settingsJson from "@content/settings.json";
import historyJson from "@content/history.json";
import eventsJson from "@content/events.json";
import membersJson from "@content/members.json";
import foundersJson from "@content/founders.json";
import awardsJson from "@content/awards.json";
import testimonialsJson from "@content/testimonials.json";
import officersJson from "@content/officers.json";
import faqsJson from "@content/faqs.json";
import cultureJson from "@content/culture.json";
import pathwaysJson from "@content/pathways.json";
import imagesJson from "@content/images.json";
import meetingGuideJson from "@content/meeting-guide.json";
import { createRepository, type ContentRepository } from "./repository";
import {
  awardSchema,
  cultureSchema,
  eventSchema,
  faqSchema,
  founderSchema,
  historySchema,
  imageSlotSchema,
  meetingGuideSchema,
  memberSchema,
  officerSchema,
  parseContent,
  pathwaysSchema,
  settingsSchema,
  testimonialSchema,
} from "./schemas";

/** Validated once at build time. Invalid content fails the build with a readable message. */
export const content: ContentRepository = createRepository({
  settings: parseContent(settingsSchema, settingsJson, "content/settings.json"),
  history: parseContent(historySchema, historyJson, "content/history.json"),
  events: parseContent(z.array(eventSchema), eventsJson, "content/events.json"),
  members: parseContent(z.array(memberSchema), membersJson, "content/members.json"),
  founders: parseContent(z.array(founderSchema), foundersJson, "content/founders.json"),
  awards: parseContent(z.array(awardSchema), awardsJson, "content/awards.json"),
  testimonials: parseContent(z.array(testimonialSchema), testimonialsJson, "content/testimonials.json"),
  officers: parseContent(z.array(officerSchema), officersJson, "content/officers.json"),
  faqs: parseContent(z.array(faqSchema), faqsJson, "content/faqs.json"),
  culture: parseContent(cultureSchema, cultureJson, "content/culture.json"),
  pathways: parseContent(pathwaysSchema, pathwaysJson, "content/pathways.json"),
  imageSlots: parseContent(z.array(imageSlotSchema), imagesJson, "content/images.json"),
  meetingGuide: parseContent(meetingGuideSchema, meetingGuideJson, "content/meeting-guide.json"),
});

export type { ContentRepository } from "./repository";
export * from "./schemas";
