import type { ReactNode } from "react";
import type { LaunchPhase, Remaining } from "@/lib/launch/launch";

export interface LaunchCalendar {
  google: string;
  ics: string;
}

/** Everything the launch scene shows, and the finale it plays at zero. */
export interface SceneProps {
  remaining: Remaining;
  phase: LaunchPhase;
  /** "Sunday 13 December at 10:30 am". */
  dateLine: string;
  calendar: LaunchCalendar;
  /** Preview links only: says this is a rehearsal. */
  previewSeconds: number | null;
  /** The stage photo, an <ImageSlot> rendered on the server (it reads content/images.json). */
  photo: ReactNode;
  /** True from zero: play the finale, then call onFinaleDone. */
  finale: boolean;
  onFinaleDone: () => void;
}
