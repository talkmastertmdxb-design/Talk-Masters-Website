import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { MemberCard } from "@/components/people/MemberCard";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our members",
  description:
    "Meet the members of Talk-Masters Club: people of every age and background, and how Toastmasters changed their lives.",
};

export default function MembersPage() {
  const { members } = content;

  return (
    <main id="main">
      <PageHeader
        title="Our members"
        lead="Engineers and teachers, students and retirees, parents and career changers. In their own words, here's what changed."
      />

      <section aria-label="Member stories" className="py-section bg-soft-gray">
        <div className="container-site">
          {members.length > 0 ? (
            <div className="grid gap-x-6 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <MemberCard key={member.slug} member={member} />
              ))}
            </div>
          ) : (
            <p className="text-lead max-w-[48ch]">
              Member stories are on their way. Come to a meeting and hear them in person.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
