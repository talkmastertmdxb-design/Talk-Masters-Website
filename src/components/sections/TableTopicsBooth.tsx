import { Booth } from "@/components/signature/Booth";
import { content } from "@/lib/content";

/** Table Topics Booth (Section 5, signature moment S4). */
export function TableTopicsBooth() {
  const topics = content.tableTopics.map((topic) => topic.prompt);

  return (
    <section
      id="try-it"
      aria-labelledby="booth-title"
      className="theme-dark footer-glow grain py-section relative isolate text-white"
    >
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4">
          <p data-reveal="up" className="text-eyebrow text-muted">
            Try it now
          </p>
          <h2 id="booth-title" data-reveal="lines" className="text-h2 mt-5 max-w-[14ch]">
            Your first Table Topic, right here.
          </h2>
          <p data-reveal="up" className="text-lead mt-6 max-w-[40ch] text-white/75">
            Get a surprise question, take a breath, and answer out loud. The light turns green at 1:00, amber
            at 1:30 and red at 2:00, just like at a meeting.
          </p>
        </div>
        <div data-reveal="up" className="lg:col-span-8">
          <Booth topics={topics} />
        </div>
      </div>
    </section>
  );
}
