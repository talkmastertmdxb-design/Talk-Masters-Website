import { ViewTransition, type ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { mainNav } from "@/lib/navigation";

/**
 * Remounts on every route change, so the page (with its footer) exits and the next one enters:
 * the old page lifts away and dims while the new one wipes up from below (globals.css).
 * The header lives in the layout, outside this boundary, and stays put. Browser back/forward
 * is marked by MotionProvider and skips the animation, so it never fights iOS swipe-back.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div>
        {children}
        <div id="contact">
          <SiteFooter items={mainNav} />
        </div>
      </div>
    </ViewTransition>
  );
}
