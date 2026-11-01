import { cacheLife } from "next/cache";
import { content } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import { breadcrumbJsonLd, meetingEventsJsonLd, serializeJsonLd, type Crumb } from "@/lib/seo/structured-data";

type JsonLdData = Parameters<typeof serializeJsonLd>[0];

/** Structured data for search engines: a plain script tag, not next/script (it isn't code). */
export function JsonLd({ data }: { data: JsonLdData }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

/** Home → this page, for the breadcrumb trail in search results. */
export function PageBreadcrumb({ name, path }: Crumb) {
  return (
    <JsonLd
      data={breadcrumbJsonLd(
        [
          { name: "Home", path: "/" },
          { name, path },
        ],
        siteUrl,
      )}
    />
  );
}

/**
 * The next meetings as events. Prerendered with the page and refreshed daily, so the dates move
 * forward on their own between deploys.
 */
export async function MeetingEvents() {
  "use cache";
  cacheLife("days");
  return <JsonLd data={meetingEventsJsonLd(content.settings, siteUrl, new Date())} />;
}
