import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { LaunchStage } from "@/components/launch/LaunchStage";
import { content } from "@/lib/content";
import { launchConfig, previewAllowed, serverTime } from "@/lib/launch/config";
import { launchDateLine, launchGoogleUrl } from "@/lib/launch/calendar";
import { previewSeconds } from "@/lib/launch/launch";
import { siteUrl } from "@/lib/site";
import "./launch.css";

export const metadata: Metadata = {
  title: { absolute: "Talk-Masters Club Dubai | Our new website is coming" },
  description:
    "The new Talk-Masters Club website is almost here. Add the launch to your calendar and be there when it opens.",
};

/**
 * The launch countdown. src/proxy.ts serves it for every page until the launch moment.
 * Outside production, /launch?in=300 rehearses the countdown for 300 seconds, finale included.
 */
export default function LaunchPage({ searchParams }: PageProps<"/launch">) {
  return (
    <main id="main" data-launch className="launch-root">
      <Suspense fallback={null}>
        <LaunchContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function LaunchContent({ searchParams }: Pick<PageProps<"/launch">, "searchParams">) {
  // Per request: the countdown starts from the server's own clock.
  await connection();
  const params = await searchParams;
  const now = serverTime();
  const config = launchConfig();
  const allowPreview = previewAllowed();
  const rehearsal = allowPreview ? previewSeconds(params.in) : null;
  const at = rehearsal !== null ? new Date(now + rehearsal * 1000) : (config.at ?? new Date(now));
  const { clubName, meeting } = content.settings;
  const event = { clubName, at, url: siteUrl.href };

  return (
    <LaunchStage
      launchAt={at.toISOString()}
      serverNow={now}
      dateLine={launchDateLine(at, meeting.timeZone)}
      calendar={{
        google: launchGoogleUrl(event),
        ics: `/launch.ics?${new URLSearchParams({ at: at.toISOString() })}`,
      }}
      previewSeconds={rehearsal}
    />
  );
}
