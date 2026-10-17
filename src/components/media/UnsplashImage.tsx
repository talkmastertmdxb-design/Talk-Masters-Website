"use client";

import Image, { type ImageProps } from "next/image";
import { unsplashLoader } from "@/lib/images/unsplash-loader";

/**
 * next/image with the Unsplash loader. A client component because loader
 * functions cannot be passed from Server Components.
 */
export function UnsplashImage({ alt, ...props }: Omit<ImageProps, "loader">) {
  return <Image {...props} alt={alt} loader={unsplashLoader} />;
}
