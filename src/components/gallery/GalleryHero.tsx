import { getImageProps } from "next/image";
import { ImageStreamHero } from "@/components/ui/ImageStreamHero";
import type { GalleryPhoto } from "@/lib/content/gallery";

interface GalleryHeroProps {
  photos: readonly GalleryPhoto[];
  /** How many events the photos come from. */
  eventCount: number;
}

/** One photo per card: 9 on each rail, none repeated (the cards are small, so are the files). */
const CORRIDOR_PHOTOS = 18;

/** Every nth photo, so the corridor mixes all the events instead of showing the newest one. */
function spread<T>(items: readonly T[], count: number): T[] {
  if (items.length <= count) return [...items];
  const step = items.length / count;
  return Array.from({ length: count }, (_, index) => items[Math.floor(index * step)]!);
}

/**
 * /gallery's white opening: the headline over a corridor of club photos rushing toward the
 * viewer. The corridor is decorative; the photos themselves are in the collage below.
 */
export function GalleryHero({ photos, eventCount }: GalleryHeroProps) {
  const images = spread(photos, CORRIDOR_PHOTOS).map((photo) => ({
    src: getImageProps({ src: photo.src, alt: "", width: 640, height: 640, sizes: "640px" }).props.src,
  }));

  return (
    <section data-header="light" aria-labelledby="gallery-title" className="bg-white">
      <ImageStreamHero
        images={images}
        axis={72}
        speed={32}
        className="h-[34rem] [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] md:h-[clamp(36rem,92svh,52rem)]"
      >
        <div className="relative z-10 flex h-full flex-col items-center justify-between px-(--site-gutter) pt-32 pb-10 text-center md:pt-36">
          <div className="max-w-[44rem] bg-[radial-gradient(closest-side,rgb(255_255_255/0.95)_55%,rgb(255_255_255/0))] px-10 py-6">
            <h1 id="gallery-title" data-reveal="lines" className="text-display text-balance">
              The club, as the camera saw it
            </h1>
            <p data-reveal="up" className="text-ink-muted mx-auto mt-6 max-w-[44ch] text-lg">
              Every special event and Sunday meeting, from the first nervous minute to the group photo.
            </p>
          </div>
          <p
            data-reveal="up"
            className="text-ink-muted rounded-full bg-white/85 px-4 py-1.5 text-sm backdrop-blur-sm"
          >
            {photos.length} photos from {eventCount} days, with more after every meeting
          </p>
        </div>
      </ImageStreamHero>
    </section>
  );
}
