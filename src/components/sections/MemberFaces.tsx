import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { content } from "@/lib/content";

/**
 * Who it's for, in faces: members with a one-line headline (content/members.json), each a real
 * person with who they were and who they are now. Replaces the "Real People. Real Growth." slider.
 */
export function MemberFaces() {
  const members = content.members.filter((member) => member.headline && member.imageSlot);
  if (members.length === 0) return null;

  return (
    <section aria-labelledby="faces-title" className="py-section bg-soft-gray">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 id="faces-title" data-reveal="lines" className="text-h2 max-w-[16ch]">
            Engineers, educators, founders, first-timers.
          </h2>
          <p data-reveal="up" className="text-ink-muted max-w-[38ch]">
            Everyone here started as a guest. Some of them now train speakers for a living.
          </p>
        </div>

        <ul
          data-reveal="stagger"
          className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:mt-16 lg:grid-cols-5"
        >
          {members.map((member) => (
            <li key={member.slug} className="group relative flex flex-col gap-3">
              <div className="relative isolate aspect-[4/5] overflow-hidden rounded-lg">
                <ImageSlot
                  id={member.imageSlot!}
                  variant="backdrop"
                  tone="full"
                  sizes="(min-width: 1280px) 18vw, (min-width: 640px) 30vw, 45vw"
                  className="media-zoom"
                />
              </div>
              <h3 className="font-serif text-[1.375rem] leading-tight">
                <Link href={`/members#${member.slug}`} className="after:absolute after:inset-0">
                  {member.name}
                </Link>
              </h3>
              <p className="text-ink-muted -mt-1 text-sm leading-snug">{member.headline}</p>
            </li>
          ))}
        </ul>

        <Link
          href="/members"
          data-reveal="up"
          className="nav-link text-tm-blue mt-10 inline-flex min-h-11 items-center font-semibold"
        >
          Meet all our members
        </Link>
      </div>
    </section>
  );
}
