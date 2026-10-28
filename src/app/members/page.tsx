import { RevealScope } from "@/components/motion/RevealScope";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { MemberDirectoryCard } from "@/components/people/MemberDirectoryCard";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Members",
  description:
    "Meet the people behind the voices at Talk-Masters Club: members of every age and background, and how Toastmasters changed their lives.",
};

/**
 * Plan.md: Members Page. A directory of compact cards that open into full-screen
 * profiles (MemberProfile); no individual member pages. Filters (students, professionals, executives, alumni, officers)
 * are a future enhancement; `segment` is already stored for them.
 */
export default function MembersPage() {
  const { members } = content;

  return (
    <RevealScope as="main" id="main">
      <PageHeader
        title="Meet the people behind the voices"
        lead="Engineers and teachers, parents and career changers. Different starting points, the same room, and stories worth hearing."
        imageSlot="members-hero"
      />

      <section aria-label="Member directory" className="py-section bg-soft-gray">
        <div className="container-site">
          {members.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:gap-8">
              {members.map((member) => (
                <MemberDirectoryCard key={member.slug} member={member} />
              ))}
              <NextStoryCard
                columnsLeft={3 - (members.length % 3)}
                fillsPhoneGap={members.length % 2 === 1}
              />
            </div>
          ) : (
            <p className="text-lead max-w-[48ch]">
              Member stories are on their way. Come to a meeting and hear them in person.
            </p>
          )}
        </div>
      </section>
    </RevealScope>
  );
}

/**
 * Desktop rows of three: the card spans whatever the last row has left, so it never sits alone
 * beside empty space. One column left keeps the portrait shape; wider spans become a banner.
 */
const NEXT_STORY_SPAN: Record<number, string> = {
  1: "md:col-span-1 md:aspect-[4/5]",
  2: "md:col-span-2 md:justify-center md:px-12",
  3: "md:col-span-3 md:justify-center md:px-14 md:py-14",
};

interface NextStoryCardProps {
  /** Empty slots in the last desktop row of three. */
  columnsLeft: number;
  /** An odd number of members leaves one slot in the two-column rows below desktop. */
  fillsPhoneGap: boolean;
}

/** Below desktop: a full-width card, or a compact one in the last member's row. */
const PHONE_SHAPE = {
  full: {
    card: "col-span-2 p-6 sm:p-9",
    title: "text-[1.625rem]",
    copy: "",
    button: "self-stretch sm:self-start",
  },
  gap: {
    card: "col-span-1 p-4 max-md:aspect-[4/5] sm:p-6",
    title: "text-[1.2rem] sm:text-[1.625rem]",
    copy: "max-md:hidden",
    button: "self-stretch px-4 max-md:min-h-11 max-md:text-sm",
  },
} as const;

/** Fills the grid's last slots with the next step: the guest's own first meeting. */
function NextStoryCard({ columnsLeft, fillsPhoneGap }: NextStoryCardProps) {
  const phone = PHONE_SHAPE[fillsPhoneGap ? "gap" : "full"];
  return (
    <aside
      aria-labelledby="next-story-title"
      data-reveal="up"
      className={`rounded-card bg-ink border-gold/35 flex flex-col justify-end gap-3 border text-white sm:gap-4 md:p-9 ${phone.card} ${NEXT_STORY_SPAN[columnsLeft] ?? NEXT_STORY_SPAN[1]}`}
    >
      <p className="text-gold text-[0.6875rem] font-bold tracking-[0.14em] uppercase sm:text-xs">
        Your story
      </p>
      <h2 id="next-story-title" className={`font-serif leading-[1.12] md:text-[2.125rem] ${phone.title}`}>
        The next story could start at your first meeting.
      </h2>
      <p className={`text-[0.9375rem] leading-relaxed text-white/70 ${phone.copy}`}>
        Come as a guest on the 2nd or 4th Sunday. Watch, listen, and speak only if you want to.
      </p>
      <ButtonLink href="/join" className={`mt-2 md:self-start ${phone.button}`}>
        <span>
          Book a <span className="hidden sm:inline">guest </span>visit
        </span>
      </ButtonLink>
    </aside>
  );
}
