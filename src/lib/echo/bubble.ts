/**
 * When Echo's speech bubble may appear: once for each kind of page in a visit, and not at all
 * once the guest has waved it away twice. Kept in sessionStorage, so a new visit starts afresh.
 */
export interface BubbleMemory {
  /** Pages (see pageKey) where the bubble has already had its moment. */
  seen: string[];
  /** Times the guest closed it with its ×. */
  dismissals: number;
}

export const BUBBLE_MEMORY_KEY = "tm-echo-bubble-v2";
/** After this many dismissals Echo stays quiet for the rest of the visit. */
export const QUIET_AFTER = 2;
export const EMPTY_MEMORY: BubbleMemory = { seen: [], dismissals: 0 };

export const shouldNudge = (memory: BubbleMemory, page: string): boolean =>
  memory.dismissals < QUIET_AFTER && !memory.seen.includes(page);

/** The bubble has shown on `page`: opened, dismissed, or left on its own. */
export function rememberNudge(memory: BubbleMemory, page: string, dismissed: boolean): BubbleMemory {
  return {
    seen: memory.seen.includes(page) ? memory.seen : [...memory.seen, page],
    dismissals: memory.dismissals + (dismissed ? 1 : 0),
  };
}

export function loadBubbleMemory(storage: Pick<Storage, "getItem"> | undefined): BubbleMemory {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(BUBBLE_MEMORY_KEY) ?? "null");
    if (typeof parsed !== "object" || parsed === null) return EMPTY_MEMORY;
    const { seen, dismissals } = parsed as Record<string, unknown>;
    return Array.isArray(seen) &&
      seen.every((page) => typeof page === "string") &&
      typeof dismissals === "number"
      ? { seen, dismissals }
      : EMPTY_MEMORY;
  } catch {
    return EMPTY_MEMORY;
  }
}

export function saveBubbleMemory(storage: Pick<Storage, "setItem"> | undefined, memory: BubbleMemory): void {
  try {
    storage?.setItem(BUBBLE_MEMORY_KEY, JSON.stringify(memory));
  } catch {
    // Storage blocked: the bubble may come back on the next page, which is harmless.
  }
}
