import { RevealScope } from "@/components/motion/RevealScope";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
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
        lead="Students and retirees, engineers and teachers, parents and career changers. Different starting points, the same room, and stories worth hearing."
        imageSlot="members-hero"
      />

      <section aria-label="Member directory" className="py-section bg-soft-gray">
        <div className="container-site">
          {members.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-14 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
              {members.map((member) => (
                <MemberDirectoryCard key={member.slug} member={member} />
              ))}
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
