import type { Metadata } from "next";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
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

/** /gallery: every photo of club moments, from events, meetings and the rest of the site. */
export default function GalleryPage() {
  const { events, gallery, imageSlots, settings } = content;
  const photos = galleryPhotos(events, gallery.moments, imageSlots, settings.meeting.timeZone);

  return (
    <RevealScope as="main" id="main">
      <PageBreadcrumb name="Gallery" path="/gallery" />
      <GalleryHero photos={photos} />

      <section aria-labelledby="photos-title" className="py-section bg-soft-gray overflow-x-clip">
        <div className="container-site">
          <h2 id="photos-title" data-reveal="lines" className="text-h2">
            Every photo
          </h2>
          <p data-reveal="up" className="text-ink-muted mt-4 max-w-[52ch] text-lg">
            Open any photo to see it full screen. On a phone, swipe to the next one.
          </p>
          <div className="mt-12">
            <PhotoGrid
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
