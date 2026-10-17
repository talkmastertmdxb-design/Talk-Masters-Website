import { ImageSlot } from "@/components/media/ImageSlot";
import type { Officer } from "@/lib/content/schemas";

interface OfficerCardProps {
  officer: Officer;
  showBio?: boolean;
}

/** Executive Committee card: photo, name, position and personal leadership statement. */
export function OfficerCard({ officer, showBio = false }: OfficerCardProps) {
  return (
    <article aria-labelledby={`officer-${officer.slug}`} className="group">
      {officer.imageSlot && (
        <div data-reveal="image" className="rounded-card overflow-hidden">
          <ImageSlot
            id={officer.imageSlot}
            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 80vw"
            className="media-zoom"
          />
        </div>
      )}
      <p className="text-maroon mt-5 text-sm font-semibold">{officer.role}</p>
      <h3 id={`officer-${officer.slug}`} className="mt-1 font-serif text-2xl">
        {officer.name}
      </h3>
      <p className="text-ink-muted mt-3 max-w-[34ch] text-base leading-relaxed">“{officer.statement}”</p>
      {showBio && officer.bio && <p className="text-ink-muted mt-3 text-sm">{officer.bio}</p>}
      {showBio && <p className="text-ink-muted mt-3 text-sm">Term {officer.term}</p>}
    </article>
  );
}
