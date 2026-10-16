import { z } from "zod";
import settingsJson from "@content/settings.json";
import eventsJson from "@content/events.json";
import storiesJson from "@content/stories.json";
import testimonialsJson from "@content/testimonials.json";
import officersJson from "@content/officers.json";
import faqsJson from "@content/faqs.json";
import tableTopicsJson from "@content/table-topics.json";
import imagesJson from "@content/images.json";
import { createRepository, type ContentRepository } from "./repository";
import {
  eventSchema,
  faqSchema,
  imageSlotSchema,
  officerSchema,
  parseContent,
  settingsSchema,
  storySchema,
  tableTopicSchema,
  testimonialSchema,
} from "./schemas";

/** Validated once at build time. Invalid content fails the build with a readable message. */
export const content: ContentRepository = createRepository({
  settings: parseContent(settingsSchema, settingsJson, "content/settings.json"),
  events: parseContent(z.array(eventSchema), eventsJson, "content/events.json"),
  stories: parseContent(z.array(storySchema), storiesJson, "content/stories.json"),
  testimonials: parseContent(z.array(testimonialSchema), testimonialsJson, "content/testimonials.json"),
  officers: parseContent(z.array(officerSchema), officersJson, "content/officers.json"),
  faqs: parseContent(z.array(faqSchema), faqsJson, "content/faqs.json"),
  tableTopics: parseContent(z.array(tableTopicSchema), tableTopicsJson, "content/table-topics.json"),
  imageSlots: parseContent(z.array(imageSlotSchema), imagesJson, "content/images.json"),
});

export type { ContentRepository } from "./repository";
export * from "./schemas";
