import { MemberCard } from "@/components/people/MemberCard";
import { ButtonLink } from "@/components/ui/Button";
import { content } from "@/lib/content";

/** Home band: proof that it works, from members of every walk of life. */
export function MemberStories() {
  const featured = content.members.filter((member) => member.featured).slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section aria-labelledby="member-stories-title" className="py-section bg-soft-gray">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-eyebrow text-ink-muted">Member stories</p>
            <h2 id="member-stories-title" className="text-h2 mt-5 max-w-[18ch]">
              How Toastmasters changed things for them
            </h2>
          </div>
          <ButtonLink href="/members" variant="dark" className="w-fit">
            Meet our members
          </ButtonLink>
        </div>
        <div className="mt-16 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((member) => (
            <MemberCard key={member.slug} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
