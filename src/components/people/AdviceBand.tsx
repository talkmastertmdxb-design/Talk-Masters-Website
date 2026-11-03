import type { CSSProperties } from "react";
import {
  Testimonial,
  TestimonialAuthor,
  TestimonialAuthorName,
  TestimonialQuote,
} from "@/components/ui/Testimonial";
import { content } from "@/lib/content";
import type { Member } from "@/lib/content/schemas";

/** Seconds each card stays in view, so more advice doesn't mean faster sliding. */
const SECONDS_PER_CARD = 7;

type Advice = Pick<Member, "slug" | "name" | "adviceShort">;

/**
 * One piece of advice as a card that opens the member's profile (/members#slug). The copy that
 * makes the loop seamless can't take focus.
 */
function AdviceCard({ member, copy }: { member: Advice; copy: boolean }) {
  return (
    <li className="w-72 shrink-0 motion-reduce:w-auto motion-reduce:shrink sm:w-80">
      <a
        href={`#${member.slug}`}
        tabIndex={copy ? -1 : undefined}
        // A quote inside a link loses its text in some browsers' accessible names; say it plainly.
        aria-label={`“${member.adviceShort}” ${member.name}`}
        className="hover:bg-soft-gray border-ink/10 block h-full rounded-xl border bg-white transition-colors duration-(--duration-quick)"
      >
        <Testimonial>
          <TestimonialQuote className="text-ink font-serif text-base leading-normal">
            <p>“{member.adviceShort}”</p>
          </TestimonialQuote>
          <TestimonialAuthor>
            <TestimonialAuthorName className="text-ink">{member.name}</TestimonialAuthorName>
          </TestimonialAuthor>
        </Testimonial>
      </a>
    </li>
  );
}

/**
 * Members page: the advice members give every new guest, as one row of cards sliding past.
 * Hover or keyboard focus pauses it; a card opens that member's profile. Reduced motion: the
 * same cards, still and wrapped.
 */
export function AdviceBand() {
  const members = content.members.filter((member) => member.adviceShort);
  if (members.length === 0) return null;

  const half = (copy: boolean) => (
    <ul aria-hidden={copy || undefined} className="advice-band__half m-0 list-none pl-0">
      {members.map((member) => (
        <AdviceCard key={member.slug} member={member} copy={copy} />
      ))}
    </ul>
  );

  return (
    <section aria-labelledby="advice-title" className="text-ink overflow-hidden bg-white py-16 md:py-20">
      <div className="container-site">
        <h2 id="advice-title" data-reveal="lines" className="text-h2 max-w-[20ch]">
          The advice we give every new guest
        </h2>
        <p data-reveal="up" className="text-ink-muted mt-4 max-w-[48ch]">
          In our members&apos; own words. Choose a card to read the story behind it.
        </p>
      </div>
      <div data-reveal="up" className="advice-band__row mt-10 md:mt-12">
        <div
          className="advice-band__track"
          style={{ "--advice-duration": `${members.length * SECONDS_PER_CARD}s` } as CSSProperties}
        >
          {half(false)}
          {half(true)}
        </div>
      </div>
    </section>
  );
}
