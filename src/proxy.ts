import { NextResponse, type NextRequest } from "next/server";
import { launchConfig, previewAllowed } from "@/lib/launch/config";
import { isLaunched } from "@/lib/launch/launch";

const LAUNCH_PATH = "/launch";

/**
 * The launch gate. Until the launch moment every page answers with the countdown (a rewrite,
 * so the address bar keeps the page the visitor asked for and reloads straight into it at
 * zero). The site's pages are never sent, so nothing can be read early. After the moment
 * this does nothing, and /launch itself sends visitors home. No deploy is needed at zero.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname, searchParams } = request.nextUrl;
  const gated = !isLaunched(launchConfig().at, Date.now());

  if (pathname === LAUNCH_PATH) {
    const previewing = previewAllowed() && searchParams.has("in");
    return gated || previewing ? NextResponse.next() : NextResponse.redirect(new URL("/", request.url));
  }
  if (!gated) return NextResponse.next();

  const countdown = request.nextUrl.clone();
  countdown.pathname = LAUNCH_PATH;
  countdown.search = "";
  return NextResponse.rewrite(countdown);
}

export const config = {
  // Everything except build assets, public files, share images, and the calendar files
  // (people subscribed to the meetings calendar keep receiving it).
  matcher: [
    "/((?!_next/|images/|brand/|videos/|opengraph-image|twitter-image|icon|apple-icon|favicon|robots\\.txt|sitemap\\.xml|meetings\\.ics|launch\\.ics|.*\\.(?:txt|html|xml|png|jpe?g|webp|avif|svg|ico|mp4|webm)$).*)",
  ],
};
