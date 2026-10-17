import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { firstName } from "@/lib/content/people";
import type { Member } from "@/lib/content/schemas";

interface MemberCardProps {
  member: Member;
}

/** "Software engineer at Example" / "Software engineer" / "Example" / nothing, as the member chose. */
export function workLine(member: Pick<Member, "occupation" | "organisation">): string | undefined {
  const { occupation, organisation } = member;
  if (occupation && organisation) return `${occupation} at ${organisation}`;
  return occupation ?? organisation;
}

/** The whole card is one link to the member's story. */
export function MemberCard({ member }: MemberCardProps) {
  const work = workLine(member);

  return (
    <article className="group relative">
      {member.imageSlot && (
        <ImageSlot
          id={member.imageSlot}
          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="media-zoom"
        />
      )}
      <h3 className="text-h3 mt-6">
        <Link href={`/members/${member.slug}`} className="after:absolute after:inset-0">
          {member.name}
        </Link>
      </h3>
      {work && <p className="text-ink-muted mt-1">{work}</p>}
      <p className="mt-4 max-w-[38ch] font-serif text-xl leading-snug italic">“{member.quote}”</p>
      <p className="nav-link text-tm-blue mt-5 inline-block font-semibold group-hover:bg-[length:100%_1px]">
        Read {firstName(member.name)}&apos;s story
      </p>
    </article>
  );
}
