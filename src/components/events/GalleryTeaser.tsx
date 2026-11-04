import { ImageSlot } from "@/components/media/ImageSlot";
import { ButtonLink } from "@/components/ui/Button";

interface GalleryTeaserProps {
  /** Six image slot ids, from different days. */
  photos: readonly string[];
}

/** /events, before the footer: a few photos and the way to the Gallery. */
export function GalleryTeaser({ photos }: GalleryTeaserProps) {
  return (
    <section aria-labelledby="gallery-teaser-title" className="py-section bg-soft-gray">
      <div className="container-site grid gap-12 md:grid-cols-12 md:items-center">
        <div className="md:col-span-5">
          <h2 id="gallery-teaser-title" data-reveal="lines" className="text-h1 max-w-[12ch]">
            Every photo, in one place
          </h2>
          <p data-reveal="up" className="text-ink-muted mt-6 max-w-[40ch] text-lg">
            The Gallery holds every photo from these days, and every meeting to come. Find yourself, or the
            person who made you laugh.
          </p>
          <div data-reveal="up" className="mt-8">
            <ButtonLink href="/gallery">Open the Gallery</ButtonLink>
          </div>
        </div>
        <ul aria-hidden="true" data-reveal="stagger" className="gallery-teaser md:col-span-7">
          {photos.slice(0, 6).map((id) => (
            <li key={id}>
              <ImageSlot id={id} sizes="(min-width: 56.25rem) 18vw, 30vw" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
