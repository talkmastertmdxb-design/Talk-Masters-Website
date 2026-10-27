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
              <NextStoryCard />
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

/** Fills the grid's last slot with the next step: the guest's own first meeting. */
function NextStoryCard() {
  return (
    <aside
      aria-labelledby="next-story-title"
      data-reveal="up"
      className="rounded-card bg-ink border-gold/35 col-span-2 flex flex-col justify-end gap-3 border p-6 text-white sm:gap-4 sm:p-9 md:col-span-1 md:aspect-[4/5]"
    >
      <p className="text-gold text-[0.6875rem] font-bold tracking-[0.14em] uppercase sm:text-xs">
        Your story
      </p>
      <h2 id="next-story-title" className="font-serif text-[1.625rem] leading-[1.12] sm:text-[2.125rem]">
        The next story could start at your first meeting.
      </h2>
      <p className="text-[0.9375rem] leading-relaxed text-white/70">
        Come as a guest on the 2nd or 4th Sunday. Watch, listen, and speak only if you want to.
      </p>
      <ButtonLink href="/join" className="mt-2 self-stretch sm:self-start">
        Book a guest visit
      </ButtonLink>
    </aside>
  );
}
