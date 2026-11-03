import { ArrowUpRight } from "lucide-react";
import { ImageSlot } from "@/components/media/ImageSlot";
import { ButtonLink } from "@/components/ui/Button";
import { SocialLinks } from "@/components/ui/SocialLinks";
import {
  cardEyebrow,
  clubLine,
  firstName,
  impactLabels,
  milestoneLabels,
  splitStory,
  workLine,
} from "@/lib/content/people";
import type { Member } from "@/lib/content/schemas";
import { MemberProfile } from "./MemberProfile";

interface MemberLink {
  slug: string;
  name: string;
}

interface MemberDirectoryCardProps {
  member: Member;
  /** "3 of 11": where this member sits in the directory. */
  position: string;
  /** The members either side, for the profile's previous and next links (wrapping round). */
  previous: MemberLink;
  next: MemberLink;
}

/**
 * Plan.md member directory card: a portrait card that opens into a full-screen profile.
 * One target per card; social links live in the profile.
 */
export function MemberDirectoryCard({ member, position, previous, next }: MemberDirectoryCardProps) {
  const work = workLine(member);
  const first = firstName(member.name);
  const club = clubLine(member);
  const impacts = Object.entries(impactLabels).flatMap(([key, label]) => {
    const text = member.impact[key as keyof Member["impact"]];
    return text ? [{ label, text }] : [];
  });

  const story = splitStory(member.story);
  const chapterId = (part: string): string => `${member.slug}-${part}`;
  const chapters = [
    { id: chapterId("story"), label: "Story" },
    { id: chapterId("journey"), label: "Journey" },
    ...(impacts.length > 0 ? [{ id: chapterId("changed"), label: "What changed" }] : []),
    ...(member.advice ? [{ id: chapterId("advice"), label: "Advice for guests" }] : []),
  ];

  const eyebrow = cardEyebrow(member);
  const hook = member.hook ?? member.headline;

  /**
   * The photo is the card: name and hook sit on a dark fade over it. Phones show the gold line
   * and name only (the hook needs width).
   */
  const card = (
    <span className="rounded-card bg-surface relative block overflow-hidden text-white [--slot-ratio:4/5]">
      {member.imageSlot && (
        <ImageSlot id={member.imageSlot} sizes="(min-width: 900px) 32vw, 46vw" className="media-zoom" />
      )}
      <span aria-hidden="true" className="member-card__scrim absolute inset-0" />
      <span className="absolute inset-x-3.5 bottom-3.5 flex flex-col gap-1 sm:inset-x-6 sm:bottom-6 sm:gap-2 lg:inset-x-7 lg:bottom-7">
        <span className="text-gold text-[0.6875rem] font-bold tracking-[0.1em] uppercase sm:text-xs sm:tracking-[0.14em]">
          {eyebrow.lead}
          {eyebrow.since && <span className="hidden md:inline"> · {eyebrow.since}</span>}
        </span>
        <span
          id={`${member.slug}-name`}
          className="font-serif text-[1.2rem] leading-[1.12] sm:text-[1.6rem] lg:text-[1.875rem]"
        >
          {member.name}
        </span>
        {hook && (
          <span className="hidden text-[0.9375rem] leading-relaxed text-white/80 sm:line-clamp-3">
            {hook}
          </span>
        )}
        <span className="mt-1 hidden items-center gap-2 text-sm font-semibold opacity-0 transition duration-(--duration-quick) group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none sm:inline-flex [@media(hover:none)]:opacity-100">
          Read story
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </span>
      </span>
    </span>
  );

  return (
    <article id={member.slug} aria-labelledby={`${member.slug}-name`} data-reveal="up" className="relative">
      <MemberProfile
        slug={member.slug}
        name={member.name}
        card={card}
        chapters={chapters}
        position={position}
        portrait={
          member.imageSlot && (
            <ImageSlot
              id={member.imageSlot}
              variant="backdrop"
              tone="full"
              sizes="(min-width: 1024px) 42vw, 100vw"
              priority
            />
          )
        }
      >
        <p data-profile-item className="text-eyebrow text-gold">
          Talk-Masters Club member
        </p>
        <h2
          id={`${member.slug}-profile-name`}
          data-profile-name
          className="mt-5 font-serif text-[clamp(3rem,1.6rem+5vw,7rem)] leading-[0.92] tracking-[-0.045em]"
        >
          {member.name}
        </h2>
        {work && (
          <p data-profile-item className="text-lead mt-6 max-w-[44ch] text-white/75">
            {work}
          </p>
        )}
        {club.length > 0 && (
          <ul data-profile-item aria-label="At Talk-Masters" className="mt-6 flex flex-wrap gap-2">
            {club.map((item) => (
              <li key={item} className="border-gold/45 text-gold rounded-full border px-3.5 py-1.5 text-sm">
                {item}
              </li>
            ))}
          </ul>
        )}
        <div data-profile-item>
          <SocialLinks links={member.links} name={member.name} className="mt-8 text-white/85" />
        </div>

        <section id={chapterId("story")} aria-label={`${first}'s story`} className="mt-14 scroll-mt-8">
          {story.lead && (
            <p
              data-profile-item
              className="max-w-[34ch] font-serif text-[clamp(1.5rem,1.15rem+1vw,2rem)] leading-[1.32]"
            >
              {story.lead}
            </p>
          )}
          {story.quote && (
            <figure
              data-profile-item
              className={`grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 ${story.lead ? "mt-10 border-t border-white/12 pt-10" : ""}`}
            >
              <span aria-hidden="true" className="text-gold font-serif text-[5rem] leading-[0.7]">
                “
              </span>
              <blockquote className="max-w-[32ch] font-serif text-[clamp(1.4rem,1.1rem+0.9vw,1.875rem)] leading-[1.35] italic">
                <p>{story.quote}</p>
              </blockquote>
            </figure>
          )}
          {story.rest && (
            <p data-profile-item className="mt-8 max-w-[60ch] text-lg leading-relaxed text-white/80">
              {story.rest}
            </p>
          )}

          <div data-profile-item className="mt-14 grid gap-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8">
            <h3 className="text-gold text-sm font-semibold sm:pt-1">Where it started</h3>
            <p className="max-w-[56ch] leading-relaxed text-white/80">{member.challenge}</p>
          </div>

          {member.contribution && (
            <div
              data-profile-item
              className="mt-10 grid gap-3 border-t border-white/12 pt-10 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8"
            >
              <h3 className="text-gold text-sm font-semibold sm:pt-1">What {first} brings to the club</h3>
              <p className="max-w-[40ch] font-serif text-xl leading-snug">{member.contribution}</p>
            </div>
          )}
        </section>

        <section id={chapterId("journey")} className="mt-20 scroll-mt-8">
          <h3 data-profile-item className="text-h3 font-serif">
            {first}&apos;s Toastmasters journey
          </h3>
          <ol className="mt-8 max-w-[60ch] border-b border-white/12">
            {member.journey.map((step) => (
              <li
                key={`${step.milestone}-${step.text}`}
                data-profile-item
                className="grid gap-1 border-t border-white/12 py-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6"
              >
                <span className="text-gold text-sm font-semibold sm:pt-0.5">
                  {milestoneLabels[step.milestone]}
                </span>
                <span className="leading-relaxed text-white/85">{step.text}</span>
              </li>
            ))}
          </ol>
        </section>

        {impacts.length > 0 && (
          <section id={chapterId("changed")} className="mt-20 scroll-mt-8">
            <h3 data-profile-item className="text-h3 font-serif">
              What changed
            </h3>
            {/* Hairlines between the answers: the gaps show the list's lighter ground. */}
            <dl className="rounded-card mt-8 grid gap-px overflow-hidden bg-white/12 sm:grid-cols-2">
              {impacts.map(({ label, text }) => (
                <div key={label} data-profile-item className="bg-ink p-6 md:p-7">
                  <dt className="text-gold font-serif text-2xl">{label}</dt>
                  <dd className="mt-3 leading-relaxed text-white/80">{text}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {member.advice && (
          <section
            id={chapterId("advice")}
            data-profile-item
            aria-labelledby={chapterId("advice-title")}
            className="rounded-card bg-maroon mt-20 scroll-mt-8 p-7 md:p-10"
          >
            <h3 id={chapterId("advice-title")} className="text-gold text-sm font-semibold">
              {first}&apos;s advice for new guests
            </h3>
            <p className="mt-4 font-serif text-[clamp(1.5rem,1.15rem+1vw,2.125rem)] leading-[1.25]">
              {member.advice}
            </p>
          </section>
        )}

        <div data-profile-item className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3">
          <ButtonLink href="/join">Book a guest visit</ButtonLink>
          <p className="text-muted text-sm">Meet {first} at a meeting.</p>
        </div>

        {/* Members one after another, without going back to the grid. */}
        <nav data-profile-item aria-label="More members" className="mt-14 border-t border-white/12 pt-8">
          <p className="text-sm text-white/65">{position}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <a
              href={`#${previous.slug}`}
              className="hover:border-gold flex min-h-16 flex-col justify-center rounded-2xl border border-white/15 px-4 py-3 transition-colors duration-(--duration-quick)"
            >
              <span className="text-xs text-white/65">Previous member</span>
              <span className="mt-0.5 font-serif text-lg leading-tight">{previous.name}</span>
            </a>
            <a
              href={`#${next.slug}`}
              className="hover:border-gold flex min-h-16 flex-col items-end justify-center rounded-2xl border border-white/15 px-4 py-3 text-right transition-colors duration-(--duration-quick)"
            >
              <span className="text-xs text-white/65">Next member</span>
              <span className="mt-0.5 font-serif text-lg leading-tight">{next.name}</span>
            </a>
          </div>
        </nav>
      </MemberProfile>

      {/* Over the photo's corner, beside the card's button (a link can't sit inside it). */}
      <SocialLinks
        links={member.links}
        name={member.name}
        className="social-links--glass absolute top-3 right-3 z-10 flex-row-reverse text-white sm:top-4 sm:right-4"
      />
    </article>
  );
}
