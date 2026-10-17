import { ImageSlot } from "@/components/media/ImageSlot";
import { firstName, impactLabels, milestoneLabels, workLine } from "@/lib/content/people";
import type { Member } from "@/lib/content/schemas";
import { MemberJourney } from "./MemberJourney";

interface MemberDirectoryCardProps {
  member: Member;
}

/** Plan.md member directory card, with the full journey in a dialog. */
export function MemberDirectoryCard({ member }: MemberDirectoryCardProps) {
  const work = workLine(member);
  const first = firstName(member.name);
  const impacts = Object.entries(impactLabels).flatMap(([key, label]) => {
    const text = member.impact[key as keyof Member["impact"]];
    return text ? [{ label, text }] : [];
  });

  return (
    <article id={member.slug} aria-labelledby={`${member.slug}-name`} className="group">
      {member.imageSlot && (
        <div data-reveal="image" className="rounded-card overflow-hidden">
          <ImageSlot
            id={member.imageSlot}
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="media-zoom"
          />
        </div>
      )}
      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h3 id={`${member.slug}-name`} className="text-h3">
            {member.name}
          </h3>
          {member.position && <p className="text-maroon mt-1 text-sm font-semibold">{member.position}</p>}
          {work && <p className="text-ink-muted mt-1">{work}</p>}
        </div>
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} on LinkedIn (opens in a new tab)`}
            className="border-hairline text-tm-blue inline-flex size-11 shrink-0 items-center justify-center rounded-full border"
          >
            <span aria-hidden="true" className="text-sm font-bold">
              in
            </span>
          </a>
        )}
      </div>
      <p className="mt-4 max-w-[38ch] font-serif text-xl leading-snug italic">“{member.transformation}”</p>

      <MemberJourney id={member.slug} label={`Read ${first}'s journey`} title={`${member.name}'s journey`}>
        <h2 className="text-h2 pr-12">{member.name}</h2>
        {work && <p className="text-ink-muted mt-2">{work}</p>}

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <section>
            <h3 className="text-eyebrow text-ink-muted">Before Toastmasters</h3>
            <p className="text-h3 mt-3">{member.challenge}</p>
          </section>
          <section>
            <h3 className="text-eyebrow text-ink-muted">Today</h3>
            <p className="text-h3 mt-3">{member.transformation}</p>
          </section>
        </div>

        <section className="mt-12">
          <h3 className="text-eyebrow text-ink-muted">Their journey</h3>
          <ol className="mt-4">
            {member.journey.map((step) => (
              <li
                key={`${step.milestone}-${step.text}`}
                className="border-hairline grid gap-1 border-t py-4 sm:grid-cols-[12rem_1fr]"
              >
                <span className="font-semibold">{milestoneLabels[step.milestone]}</span>
                <span className="text-ink-muted">{step.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h3 className="text-eyebrow text-ink-muted">How Toastmasters changed things</h3>
          <dl className="mt-4 grid gap-6 sm:grid-cols-2">
            {impacts.map(({ label, text }) => (
              <div key={label} className="bg-soft-gray rounded-card p-5">
                <dt className="font-semibold">{label}</dt>
                <dd className="text-ink-muted mt-2">{text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="bg-ink rounded-card mt-12 p-6 text-white md:p-8">
          <h3 className="text-muted text-sm">{first}&apos;s advice for new guests</h3>
          <p className="text-gold mt-3 font-serif text-2xl leading-snug italic">“{member.advice}”</p>
        </section>
      </MemberJourney>
    </article>
  );
}
