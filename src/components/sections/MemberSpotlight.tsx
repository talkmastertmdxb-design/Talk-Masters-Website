import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { Slider } from "@/components/ui/Slider";
import { content } from "@/lib/content";
import { workLine } from "@/lib/content/people";

const SPOTLIGHT_COUNT = 4;

/** Plan.md: "Real People. Real Growth." Four spotlight cards; authentic social proof. */
export function MemberSpotlight() {
  const members = content.members.filter((member) => member.spotlight).slice(0, SPOTLIGHT_COUNT);
  if (members.length === 0) return null;

  return (
    <section aria-labelledby="spotlight-title" className="py-section bg-soft-gray overflow-hidden">
      <div className="container-site flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 id="spotlight-title" data-reveal="lines" className="text-display max-w-[10ch]">
          Real People. Real Growth.
        </h2>
        <Link href="/members" data-reveal="up" className="nav-link text-tm-blue w-fit font-semibold">
          Meet all our members
        </Link>
      </div>

      <div data-reveal="up" className="mt-14 md:mt-20">
        <Slider label="Member spotlight stories">
          {members.map((member) => {
            const work = workLine(member);
            return (
              <li
                key={member.slug}
                className="group relative w-[82vw] shrink-0 snap-start sm:w-[24rem] lg:w-[27rem]"
              >
                {member.imageSlot && (
                  <div className="rounded-card overflow-hidden">
                    <ImageSlot
                      id={member.imageSlot}
                      sizes="(min-width: 1024px) 27rem, 82vw"
                      className="media-zoom"
                    />
                  </div>
                )}
                <h3 className="text-h3 mt-6">{member.name}</h3>
                {work && <p className="text-ink-muted mt-1">{work}</p>}
                <p className="text-ink-muted mt-5 italic">“{member.challenge}”</p>
                <p className="mt-2 font-serif text-xl leading-snug">“{member.transformation}”</p>
                <Link
                  href={`/members#${member.slug}`}
                  className="nav-link text-tm-blue mt-5 inline-block font-semibold after:absolute after:inset-0"
                >
                  Read more<span className="sr-only"> about {member.name}</span>
                </Link>
              </li>
            );
          })}
        </Slider>
      </div>
    </section>
  );
}
