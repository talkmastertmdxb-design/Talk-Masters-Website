import type { Metadata } from "next";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Book a guest visit",
  description:
    "Visit a Talk-Masters Club meeting as our guest. It's free, and you only speak if you want to.",
};

/** Temporary page until the booking form ships in Phase 6. */
export default function JoinPage() {
  const { meeting, contactEmail } = content.settings;

  return (
    <main id="main" className="theme-dark footer-glow grain bg-ink relative isolate min-h-dvh text-white">
      <div className="container-site flex min-h-dvh flex-col justify-center py-32">
        <h1 className="text-h1 max-w-[14ch]">Book a guest visit</h1>
        <p className="text-lead mt-8 max-w-[48ch] text-white/80">
          Online booking opens soon. Until then, email us and we&apos;ll save you a seat at the next meeting.
        </p>
        <dl className="mt-12 grid max-w-xl gap-6 sm:grid-cols-2">
          <div className="border-hairline-dark border-t pt-4">
            <dt className="text-muted text-sm">When</dt>
            <dd className="mt-1">
              {meeting.schedule}, from {meeting.startTime}
            </dd>
          </div>
          <div className="border-hairline-dark border-t pt-4">
            <dt className="text-muted text-sm">Where</dt>
            <dd className="mt-1">
              {meeting.venue}, {meeting.city}
            </dd>
          </div>
        </dl>
        <a
          href={`mailto:${contactEmail}?subject=${encodeURIComponent("Guest visit")}`}
          className="bg-maroon hover:bg-maroon-hover mt-12 inline-flex min-h-12 w-fit items-center rounded-full px-7 font-semibold"
        >
          Email us to book
        </a>
      </div>
    </main>
  );
}
