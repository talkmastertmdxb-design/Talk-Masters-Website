import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // A full Content-Security-Policy is added in Phase 10, once third-party scripts are known.
  // It must allow frame-src https://www.google.com for the footer's venue map.
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // No remotePatterns on purpose: Unsplash photos use their own CDN via
    // src/lib/images/unsplash-loader.ts, so the optimizer only serves /public/images.
    // Most club photos are 1600px wide; the hero's opening photo is 2400px for sharp
    // retina screens (Next never resizes a photo up past its own width).
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2400],
    // 75 everywhere; 90 only for the hero photos, where small faces show compression.
    qualities: [75, 90],
    // Keep optimised images for 31 days: fewer re-transformations on Vercel's free plan.
    // Replacing a photo? Give the file a new name (docs/IMAGES.md), or visitors keep the old one.
    minimumCacheTTL: 2_678_400,
  },
  async redirects() {
    return [{ source: "/about", destination: "/our-story", permanent: true }];
  },
  async headers() {
    // Photos, the video and brand files change rarely and are renamed when they do.
    const longCache = [
      { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/videos/:file*", headers: longCache },
      { source: "/images/:file*", headers: longCache },
      { source: "/brand/:file*", headers: longCache },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
