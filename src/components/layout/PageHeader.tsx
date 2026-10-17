import type { ReactNode } from "react";
import { ImageSlot } from "@/components/media/ImageSlot";
import { HeroIntro } from "@/components/sections/HeroIntro";

interface PageHeaderProps {
  title: string;
  lead: string;
  /** Optional backdrop photo (image slot id). */
  imageSlot?: string;
  children?: ReactNode;
}

/** Dark opening band for inner pages: the headline rises line by line, like the home hero. */
export function PageHeader({ title, lead, imageSlot, children }: PageHeaderProps) {
  return (
    <header className="theme-dark grain hero-stage bg-ink relative isolate overflow-hidden text-white">
      {imageSlot && <ImageSlot id={imageSlot} variant="backdrop" sizes="100vw" priority />}
      <HeroIntro className="container-site flex min-h-[70dvh] flex-col justify-end pt-40 pb-20 md:pt-48 md:pb-28">
        <h1 data-hero-reveal className="text-h1 max-w-[18ch]">
          {title}
        </h1>
        <p data-hero-item className="text-lead mt-8 max-w-[52ch] text-white/80">
          {lead}
        </p>
        {children}
      </HeroIntro>
    </header>
  );
}
