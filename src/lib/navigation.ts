import type { NavItem } from "@/components/layout/SiteHeader";

/** Only links to content that exists. Add items as each page ships (docs/IMPLEMENTATION_PLAN.md §2.4). */
export const mainNav: readonly NavItem[] = [
  { href: "/about", label: "Our story" },
  { href: "/members", label: "Members" },
  { href: "/#why-join", label: "Why join" },
  { href: "/#contact", label: "Contact" },
];
