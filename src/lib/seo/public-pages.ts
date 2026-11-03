/**
 * The public pages, most important first: the sitemap lists them and IndexNow announces them.
 * The style guide and credits are left out on purpose. No path aliases here: scripts/indexnow.ts
 * imports this file directly with Node.
 */
export const PUBLIC_PAGES: ReadonlyArray<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/join", priority: 0.9 },
  { path: "/meetings", priority: 0.85 },
  { path: "/members", priority: 0.8 },
  { path: "/team", priority: 0.7 },
  { path: "/our-story", priority: 0.7 },
  { path: "/pathways", priority: 0.7 },
  { path: "/achievements", priority: 0.6 },
  { path: "/events", priority: 0.6 },
];
