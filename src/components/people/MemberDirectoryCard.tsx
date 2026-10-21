import { ArrowUpRight } from "lucide-react";
import { ImageSlot } from "@/components/media/ImageSlot";
import { ButtonLink } from "@/components/ui/Button";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { clubLine, firstName, impactLabels, milestoneLabels, workLine } from "@/lib/content/people";
import type { Member } from "@/lib/content/schemas";
import { MemberProfile } from "./MemberProfile";

interface MemberDirectoryCardProps {
  member: Member;
}

/**
 * Plan.md member directory card: a compact portrait card that opens into a full-screen
 * profile. One target per card (the photo and name); social links sit below it.
 */
export function MemberDirectoryCard({ member }: MemberDirectoryCardProps) {
  const work = workLine(member);
  const first = firstName(member.name);
  const club = clubLine(member);
  const impacts = Object.entries(impactLabels).flatMap(([key, label]) => {
    const text = member.impact[key as keyof Member["impact"]];
    return text ? [{ label, text }] : [];
  });

  const card = (
    <>
      {member.imageSlot && (
        <span className="rounded-card relative block overflow-hidden">
          <ImageSlot
            id={member.imageSlot}
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw"
            className="media-zoom"
          />
          <span
            aria-hidden="true"
            className="text-ink absolute bottom-3 left-3 inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold opacity-0 backdrop-blur-sm transition duration-(--duration-quick) group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
          >
            View profile
            <ArrowUpRight className="size-3.5" />
          </span>
        </span>
      )}
      <span id={`${member.slug}-name`} className="mt-4 block font-serif text-xl leading-tight sm:text-2xl">
        {member.name}
      </span>
      {member.position && (
        <span className="text-maroon mt-1 block text-xs font-semibold">{member.position}</span>
      )}
      {work && <span className="text-ink-muted mt-1 line-clamp-2 block text-sm">{work}</span>}
    </>
  );

  return (
    <article id={member.slug} aria-labelledby={`${member.slug}-name`} data-reveal="up">
      <MemberProfile
        slug={member.slug}
        name={member.name}
        card={card}
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
          className="mt-5 font-serif text-[clamp(2.75rem,1.6rem+4.2vw,6rem)] leading-[0.95] tracking-tight"
        >
          {member.name}
        </h2>
        {work && (
          <p data-profile-item className="text-lead mt-5 max-w-[44ch] text-white/70">
            {work}
          </p>
        )}
        {club.length > 0 && (
          <ul data-profile-item aria-label="At Talk-Masters" className="mt-6 flex flex-wrap gap-2">
            {club.map((item) => (
              <li key={item} className="border-gold/35 text-gold rounded-full border px-3.5 py-1.5 text-sm">
                {item}
              </li>
            ))}
          </ul>
        )}
        <div data-profile-item>
          <SocialLinks links={member.links} name={member.name} className="mt-8 text-white/85" />
        </div>

        <p
          data-profile-item
          className="mt-14 max-w-[40ch] font-serif text-[clamp(1.45rem,1.15rem+0.9vw,2rem)] leading-snug"
        >
          {member.story}
        </p>

        {/* "Today" is left out: the subtitle and story already say it. */}
        <section data-profile-item className="mt-14 max-w-[60ch]">
          <h3 className="text-eyebrow text-white/55">Where it started</h3>
          <p className="mt-4 text-white/80">{member.challenge}</p>
        </section>

        {member.contribution && (
          <section
            data-profile-item
            className="rounded-card mt-14 border border-white/10 bg-white/[0.04] p-6 md:p-8"
          >
            <h3 className="text-eyebrow text-gold">What {first} brings to the club</h3>
            <p className="mt-3 font-serif text-xl leading-snug">{member.contribution}</p>
          </section>
        )}

        <section className="mt-16">
          <h3 data-profile-item className="text-eyebrow text-white/55">
            {first}&apos;s Toastmasters journey
          </h3>
          <ol className="relative mt-8 max-w-[60ch]">
            <span
              data-profile-line
              aria-hidden="true"
              className="bg-gold/60 absolute top-2 bottom-2 left-[7px] w-px origin-top"
            />
            {member.journey.map((step) => (
              <li
                key={`${step.milestone}-${step.text}`}
                data-profile-item
                className="relative grid gap-1 pb-9 pl-10 last:pb-0"
              >
                <span
                  aria-hidden="true"
                  className="border-gold bg-ink absolute top-1.5 left-0 size-[15px] rounded-full border-2"
                />
                <span className="text-gold text-sm font-semibold">{milestoneLabels[step.milestone]}</span>
                <span className="text-white/80">{step.text}</span>
              </li>
            ))}
          </ol>
        </section>

        {impacts.length > 0 && (
          <section className="mt-16">
            <h3 data-profile-item className="text-eyebrow text-white/55">
              What changed
            </h3>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {impacts.map(({ label, text }) => (
                <div
                  key={label}
                  data-profile-item
                  className="rounded-card border border-white/10 bg-white/[0.04] p-6"
                >
                  <dt className="text-gold text-sm font-semibold">{label}</dt>
                  <dd className="mt-2 text-white/80">{text}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section data-profile-item className="border-gold mt-16 max-w-[48ch] border-l-2 pl-6">
          <h3 className="text-sm text-white/55">{first}&apos;s advice for new guests</h3>
          <p className="mt-3 font-serif text-2xl leading-snug italic">{member.advice}</p>
        </section>

        <div data-profile-item className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-3">
          <ButtonLink href="/join">Book a guest visit</ButtonLink>
          <p className="text-muted text-sm">Meet {first} at a meeting. Guests never have to speak.</p>
        </div>
      </MemberProfile>

      <SocialLinks links={member.links} name={member.name} className="text-ink/70 mt-4" />
    </article>
  );
}
