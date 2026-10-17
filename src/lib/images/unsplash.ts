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
  description?: string | null;
  alt_description?: string | null;
  urls: { raw: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
}

export interface SlotPhoto {
  src: string;
  credit: { name: string; profileUrl: string; photoUrl: string };
}

const MIN_LONG_EDGE = 2000;

/** Real photography only: skip anything described as generated, rendered or drawn. */
const NOT_A_PHOTO =
  /\b(ai|a\.i\.|generated|midjourney|dall-?e|stable diffusion|render(ed|ing)?|3d|cgi|illustration|vector|digital art)\b/i;

const isRealPhoto = (photo: UnsplashPhoto): boolean =>
  !NOT_A_PHOTO.test(`${photo.description ?? ""} ${photo.alt_description ?? ""}`);

/**
 * The nth (default first) free photo, not Unsplash+, large enough for full-width use.
 * Use `pick` in images.json to swap a weak result for the next one.
 */
export function pickPhoto(results: readonly UnsplashPhoto[], nth = 0): UnsplashPhoto | undefined {
  return results.filter(
    (photo) =>
      !photo.premium &&
      !photo.plus &&
      isRealPhoto(photo) &&
      Math.max(photo.width, photo.height) >= MIN_LONG_EDGE,
  )[nth];
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
  return {
    src: src.toString(),
    credit: {
      name: photo.user.name,
      profileUrl: withReferral(photo.user.links.html, appName),
      photoUrl: withReferral(photo.links.html, appName),
    },
  };
}
