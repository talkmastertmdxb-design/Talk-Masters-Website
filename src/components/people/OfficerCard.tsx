import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { shortTerm } from "@/lib/content/people";
import type { Officer } from "@/lib/content/schemas";

type OfficerCardSize = "feature" | "standard" | "compact";

interface OfficerCardProps {
  officer: Officer;
  /** feature: the President, large with their statement; compact: photo, role and name only. */
  size?: OfficerCardSize;
  showBio?: boolean;
}

const imageSizes: Record<OfficerCardSize, string> = {
  feature: "(min-width: 768px) 40vw, 90vw",
  standard: "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw",
  compact: "(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 45vw",
};

/** Executive Committee card: photo, name, position and personal leadership statement. */
export function OfficerCard({ officer, size = "standard", showBio = false }: OfficerCardProps) {
  const isFeature = size === "feature";
  const isCompact = size === "compact";

  return (
    <article aria-labelledby={`officer-${officer.slug}`} className="group">
      {officer.imageSlot && (
        <div data-reveal="image" className="rounded-card overflow-hidden">
          <ImageSlot id={officer.imageSlot} sizes={imageSizes[size]} className="media-zoom" />
        </div>
      )}
      <p className={`text-maroon font-semibold ${isCompact ? "mt-4 text-xs" : "mt-5 text-sm"}`}>
        {isFeature ? `Club ${officer.role}, ${shortTerm(officer.term)}` : officer.role}
      </p>
      <h3
        id={`officer-${officer.slug}`}
        className={`mt-1 font-serif ${isFeature ? "text-[clamp(2rem,1.5rem+1.5vw,2.75rem)] leading-tight" : isCompact ? "text-xl" : "text-2xl"}`}
      >
        {officer.name}
      </h3>
      {!isCompact && (
        <p
          className={`text-ink-muted mt-3 leading-relaxed ${isFeature ? "max-w-[30ch] font-serif text-xl italic" : "max-w-[34ch] text-base"}`}
        >
          “{officer.statement}”
        </p>
      )}
      {showBio && officer.bio && <p className="text-ink-muted mt-3 text-sm">{officer.bio}</p>}
      {showBio && !isFeature && <p className="text-ink-muted mt-3 text-sm">Term {shortTerm(officer.term)}</p>}
      {officer.memberSlug && (
        <Link
          href={`/members#${officer.memberSlug}`}
          className={`nav-link text-tm-blue inline-flex min-h-11 items-center gap-1 font-semibold ${isCompact ? "mt-1 text-sm" : "mt-2"}`}
        >
          Read {officer.name}&apos;s story
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      )}
    </article>
  );
}
