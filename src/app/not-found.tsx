import { ButtonLink } from "@/components/ui/Button";
import { VoiceLine } from "@/components/signature/VoiceLine";

/** On-brand 404 (FEATURES F-65): a path home and the guest CTA. */
export default function NotFound() {
  return (
    <main id="main" className="theme-dark grain hero-stage bg-ink relative isolate min-h-dvh text-white">
      <div className="container-site flex min-h-dvh flex-col justify-center py-32">
        <h1 className="text-h1 max-w-[14ch]">This page could not be found</h1>
        <p className="text-lead mt-6 max-w-[44ch] text-white/75">
          Even good speakers lose their place sometimes. Let&apos;s get you back on track.
        </p>
        <VoiceLine variant="underline" className="text-gold mt-10 h-8 w-64" />
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
