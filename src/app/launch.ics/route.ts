import { connection, type NextRequest } from "next/server";
import { content } from "@/lib/content";
import { launchCalendar } from "@/lib/launch/calendar";
import { launchConfig } from "@/lib/launch/config";
import { parseLaunchAt } from "@/lib/launch/launch";
import { siteUrl } from "@/lib/site";

/** The launch as an .ics file (Apple Calendar, Outlook). `?at=` carries a rehearsal's time. */
export async function GET(request: NextRequest): Promise<Response> {
  await connection();
  const at = parseLaunchAt({ env: request.nextUrl.searchParams.get("at") ?? undefined }) ?? launchConfig().at;
  if (!at) return new Response("No launch is scheduled.", { status: 404 });

  return new Response(launchCalendar({ clubName: content.settings.clubName, at, url: siteUrl.href }), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="talk-masters-launch.ics"',
      "Cache-Control": "no-store",
    },
  });
}
