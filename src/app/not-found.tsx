import type { Metadata } from "next";
import { StageLight } from "@/components/motion/StageLight";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main id="main" className="theme-dark bg-ink relative isolate min-h-dvh overflow-hidden text-white">
      <StageLight preset="not-found" />
      {/* The number is scenery: a huge outlined italic 404 behind the words. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[-0.06em] bottom-4 -z-0 font-serif text-[clamp(8rem,4rem+24vw,30rem)] leading-none text-transparent italic select-none [-webkit-text-stroke:1.5px_rgb(214_176_106/0.4)] md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:[-webkit-text-stroke-color:rgb(214_176_106/0.5)]"
      >
        404
      </span>
      <div className="container-site relative flex min-h-dvh flex-col justify-center py-32">
        <p className="text-eyebrow text-gold">Page not found</p>
        <h1 className="text-h1 mt-5 max-w-[14ch]">You&apos;ve wandered off stage.</h1>
        <p className="text-lead mt-6 max-w-[44ch] text-white/80">
          This page could not be found. The spotlight is still on, though: let&apos;s get you back to the
          room.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/">Back to the home page</ButtonLink>
          <ButtonLink href="/join" variant="ghost">
            Book a guest visit
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
