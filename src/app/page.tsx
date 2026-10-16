import { ImageSlot } from "@/components/media/ImageSlot";
import { content } from "@/lib/content";

/**
 * Foundation holding page. The full "Opening / Body / Close" home page is built
 * in Phase 5 (docs/IMPLEMENTATION_PLAN.md §7).
 */
export default function Home() {
  const { clubName, parentOrganisation, meeting } = content.settings;

  return (
    <main id="main" className="theme-dark grain bg-ink relative isolate overflow-hidden text-white">
      <div className="container-site grid min-h-dvh items-center gap-12 py-24 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-eyebrow text-muted">
            {clubName} · {parentOrganisation}
          </p>
          <h1 className="text-h1 mt-6">
            Find your voice.
            <br />
            Lead with <em className="text-gold">Confidence.</em>
            <br />
            Inspire the world.
          </h1>
          <p className="text-lead mt-8 max-w-[52ch] text-white/80">
            A public speaking and leadership club open to everyone, of every age and background.
          </p>
          <p className="border-hairline-dark text-muted mt-10 inline-flex rounded-full border px-5 py-2 text-sm">
            Next meeting: {meeting.schedule}, {meeting.startTime} · {meeting.venue}
          </p>
        </div>
        <div className="md:col-span-5">
          <ImageSlot id="hero-stage" sizes="(min-width: 900px) 40vw, 100vw" priority />
        </div>
      </div>
    </main>
  );
}
