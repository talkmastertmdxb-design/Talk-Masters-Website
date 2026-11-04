import type { EchoPage, EchoScript } from "@/lib/content/schemas";

/** What Echo says where no page has its own lines. */
export const DEFAULT_NUDGE = "Want help?";

/** The page a path belongs to: "/events#she-leads" and "/events/x" are both "/events". */
export function pageKey(pathname: string): string {
  const [first = ""] = pathname.split(/[?#]/)[0]!.split("/").filter(Boolean);
  return `/${first}`;
}

/**
 * Echo's lines for the page the guest is on, from content/echo.json. Pages without their own
 * fall back to the general greeting and featured questions.
 */
export function pageScript(script: EchoScript, pathname: string): EchoPage {
  const key = pageKey(pathname);
  return (
    script.pages.find((page) => page.path === key) ?? {
      path: key,
      name: "this page",
      nudge: DEFAULT_NUDGE,
      greeting: script.greeting,
      questions: script.featured,
    }
  );
}

/** Said when a guest who has already talked to Echo moves to another page. */
export const nowOnLine = (page: Pick<EchoPage, "name">): string =>
  `Now you're on ${page.name}. Here's what people often ask here.`;
