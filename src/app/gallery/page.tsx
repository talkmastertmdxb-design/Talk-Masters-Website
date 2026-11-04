import type { Metadata } from "next";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import { MovingCollage } from "@/components/gallery/MovingCollage";
import { ImageSlot } from "@/components/media/ImageSlot";
import { RevealScope } from "@/components/motion/RevealScope";
import { PageBreadcrumb } from "@/components/seo/JsonLd";
import { content } from "@/lib/content";
import { galleryFilters, galleryPhotos, isMeeting } from "@/lib/content/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos from Talk-Masters Club in Dubai: special events like She Leads and CareerNova, and the Sunday meetings in between.",
  alternates: { canonical: "/gallery" },
};

/** /gallery: every photo from the club's events and meetings, in a moving collage. */
export default function GalleryPage() {
  const { events, imageSlots, settings } = content;
  const photos = galleryPhotos(events, imageSlots, settings.meeting.timeZone);
  const eventCount = new Set(photos.map((photo) => photo.event)).size;

  return (
    <RevealScope as="main" id="main">
      <PageBreadcrumb name="Gallery" path="/gallery" />
      <GalleryHero photos={photos} eventCount={eventCount} />

      <section aria-labelledby="photos-title" className="py-section bg-soft-gray overflow-x-clip">
        <div className="container-site">
          <h2 id="photos-title" data-reveal="lines" className="text-h2">
            Every photo
          </h2>
          <p data-reveal="up" className="text-ink-muted mt-4 max-w-[52ch] text-lg">
            The collage drifts slowly. Point at it to hold it still, and open any photo full screen.
          </p>
          <div className="mt-12">
            <MovingCollage
              photos={photos.map((photo) => ({
                ...photo,
                tile: (
                  <ImageSlot id={photo.id} sizes="(min-width: 80rem) 20vw, (min-width: 40rem) 33vw, 50vw" />
                ),
              }))}
              filters={galleryFilters(photos, events)}
              meetingSlugs={events.filter(isMeeting).map((event) => event.slug)}
            />
          </div>
        </div>
      </section>
    </RevealScope>
  );
}
