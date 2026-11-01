import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Photo credits",
  description: "Credits for the photography used on the Talk-Masters Club website.",
  alternates: { canonical: "/credits" },
};

/** Unsplash attribution (API guidelines) for the temporary scene photos. */
export default function CreditsPage() {
  const credited = content.imageSlots.flatMap((slot) =>
    slot.credit ? [{ ...slot, credit: slot.credit }] : [],
  );

  return (
    <main id="main">
      <PageHeader
        title="Photo credits"
        lead="Some scene photos are from Unsplash until we replace them with our own. Thank you to these photographers."
      />
      <section aria-label="Credits" className="py-section bg-white">
        <div className="container-site">
          {credited.length > 0 ? (
            <ul className="max-w-3xl">
              {credited.map((slot) => (
                <li
                  key={slot.id}
                  className="border-hairline flex flex-wrap justify-between gap-2 border-t py-4 last:border-b"
                >
                  <span className="text-ink-muted">{slot.alt}</span>
                  <span>
                    Photo by{" "}
                    <a
                      href={slot.credit.profileUrl}
                      className="nav-link text-tm-blue"
                      rel="noopener noreferrer"
                    >
                      {slot.credit.name}
                    </a>{" "}
                    on{" "}
                    <a
                      href={slot.credit.photoUrl}
                      className="nav-link text-tm-blue"
                      rel="noopener noreferrer"
                    >
                      Unsplash
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lead text-ink-muted">All photos on this site belong to Talk-Masters Club.</p>
          )}
        </div>
      </section>
    </main>
  );
}
