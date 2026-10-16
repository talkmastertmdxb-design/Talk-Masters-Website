import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageSlot } from "@/components/media/ImageSlot";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

const swatches = [
  ["tm-blue", "bg-tm-blue"],
  ["maroon", "bg-maroon"],
  ["gold", "bg-gold"],
  ["ink", "bg-ink"],
  ["surface", "bg-surface"],
  ["paper", "bg-paper"],
  ["soft-gray", "bg-soft-gray"],
  ["cool-gray", "bg-cool-gray"],
] as const;

/** Internal reference for tokens and image slots. Not available in production. */
export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_LABELS !== "true") {
    notFound();
  }

  return (
    <main id="main" className="container-site py-24">
      <p className="text-eyebrow text-ink-muted">Internal</p>
      <h1 className="text-h1 mt-4">Style guide</h1>

      <section aria-labelledby="colour" className="border-hairline mt-20 border-t pt-10">
        <h2 id="colour" className="text-h3">
          Colour
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {swatches.map(([name, className]) => (
            <li key={name} className="text-sm">
              <div className={`${className} rounded-card border-hairline aspect-[4/3] border`} />
              <span className="mt-2 block">{name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="type" className="border-hairline mt-20 border-t pt-10">
        <h2 id="type" className="text-h3">
          Type
        </h2>
        <p className="text-display mt-8">Everyone.</p>
        <p className="text-h1 mt-6">
          Lead with <em>Confidence.</em>
        </p>
        <p className="text-h2 mt-6">Where leaders are made</p>
        <p className="text-h3 mt-6">Inside a meeting</p>
        <p className="text-lead mt-6 max-w-[60ch]">
          Body lead. Direct, warm, active. Short sentences that speak to the visitor.
        </p>
        <p className="text-eyebrow text-ink-muted mt-6">Eyebrow label</p>
      </section>

      <section aria-labelledby="slots" className="border-hairline mt-20 border-t pt-10">
        <h2 id="slots" className="text-h3">
          Image slots ({content.imageSlots.filter((slot) => !slot.src).length} still need photos)
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.imageSlots.map((slot) => (
            <li key={slot.id}>
              <ImageSlot id={slot.id} sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" />
              <p className="text-ink-muted mt-2 text-sm">
                {slot.id} · {slot.aspectRatio}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
