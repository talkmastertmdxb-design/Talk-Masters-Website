/**
 * next/image loader for Unsplash photos. Unsplash's CDN (imgix) resizes and picks
 * AVIF/WebP itself, and their API guidelines require hotlinking the original URL,
 * so these images bypass the Next.js optimizer entirely.
 */

interface LoaderParams {
  src: string;
  width: number;
  quality?: number;
}

const UNSPLASH_CDN = "images.unsplash.com";

export function isUnsplashSrc(src: string): boolean {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname === UNSPLASH_CDN;
  } catch {
    return false;
  }
}

export function unsplashLoader({ src, width, quality }: LoaderParams): string {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  url.searchParams.delete("fm");
  return url.toString();
}
