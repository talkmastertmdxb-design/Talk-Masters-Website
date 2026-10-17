/**
 * Helpers for scripts/fetch-unsplash.ts. Unsplash photos are temporary stand-ins
 * for scene shots (stage, audience, rooms) until the club's own photos arrive.
 * API guidelines: hotlink images.unsplash.com, trigger download_location, credit the photographer.
 */

export interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  premium?: boolean;
  plus?: boolean;
  urls: { raw: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
}

export interface SlotPhoto {
  src: string;
  credit: { name: string; profileUrl: string; photoUrl: string };
}

const MIN_LONG_EDGE = 2000;

/** First free (not Unsplash+) photo large enough for full-width use. */
export function pickPhoto(results: readonly UnsplashPhoto[]): UnsplashPhoto | undefined {
  return results.find(
    (photo) => !photo.premium && !photo.plus && Math.max(photo.width, photo.height) >= MIN_LONG_EDGE,
  );
}

const withReferral = (url: string, appName: string): string => {
  const parsed = new URL(url);
  parsed.searchParams.set("utm_source", appName);
  parsed.searchParams.set("utm_medium", "referral");
  return parsed.toString();
};

export function toSlotPhoto(photo: UnsplashPhoto, appName: string): SlotPhoto {
  const src = new URL(photo.urls.raw);
  src.searchParams.set("w", "2400");
  src.searchParams.set("q", "80");
  src.searchParams.set("fm", "jpg");
  return {
    src: src.toString(),
    credit: {
      name: photo.user.name,
      profileUrl: withReferral(photo.user.links.html, appName),
      photoUrl: withReferral(photo.links.html, appName),
    },
  };
}
