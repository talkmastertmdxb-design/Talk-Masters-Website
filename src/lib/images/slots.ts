import type { ImageSlot } from "@/lib/content/schemas";

type SlotLike = Pick<ImageSlot, "id" | "alt" | "aspectRatio" | "brief" | "src">;

/** Looks up a slot by id. An unknown id is a programming error, so fail the build. */
export function resolveImageSlot<T extends SlotLike>(slots: readonly T[], id: string): T {
  const slot = slots.find((candidate) => candidate.id === id);
  if (!slot) {
    throw new Error(`Unknown image slot "${id}". Add it to content/images.json.`);
  }
  return slot;
}

interface LabelEnv {
  NODE_ENV?: string;
  NEXT_PUBLIC_SHOW_PLACEHOLDER_LABELS?: string;
}

/** Briefs ("Photo: speaker at lectern") help the team in dev and previews, never in production. */
export function shouldShowPlaceholderLabels(env: LabelEnv): boolean {
  if (env.NEXT_PUBLIC_SHOW_PLACEHOLDER_LABELS === "true") return true;
  if (env.NEXT_PUBLIC_SHOW_PLACEHOLDER_LABELS === "false") return false;
  return env.NODE_ENV !== "production";
}
