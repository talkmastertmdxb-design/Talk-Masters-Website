import type { NavItem } from "@/components/layout/SiteHeader";

/**
 * Plan.md launch navigation: Home · Join · Meetings · Events · Team · Members · Our Story · Achievements.
 * Home is the wordmark and Join is the "Book a guest visit" button. Events is added when
 * its page ships (Phase 6): only link to pages that exist.
 */
export const mainNav: readonly NavItem[] = [
  { href: "/meetings", label: "Meetings" },
  { href: "/team", label: "Team" },
  { href: "/members", label: "Members" },
  { href: "/pathways", label: "Pathways" },
  { href: "/our-story", label: "Our Story" },
  { href: "/achievements", label: "Achievements" },
];
