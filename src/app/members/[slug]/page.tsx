import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageSlot } from "@/components/media/ImageSlot";
import { workLine } from "@/components/people/MemberCard";
import { content } from "@/lib/content";
import { firstName } from "@/lib/content/people";

export function generateStaticParams(): Array<{ slug: string }> {
  return content.members.map((member) => ({ slug: member.slug }));
}

const findMember = (slug: string) => content.members.find((member) => member.slug === slug);

export async function generateMetadata({ params }: PageProps<"/members/[slug]">): Promise<Metadata> {
  const member = findMember((await params).slug);
  if (!member) return {};
  return {
    title: `${member.name}'s story`,
    description: `${member.quote} How Toastmasters changed things for ${firstName(member.name)}.`,
  };
}

export default async function MemberStoryPage({ params }: PageProps<"/members/[slug]">) {
  const member = findMember((await params).slug);
  if (!member) notFound();

  const work = workLine(member);

  return (
    <main id="main">
      <article aria-labelledby="member-name">
        <header className="theme-dark grain hero-stage bg-ink relative isolate overflow-hidden text-white">
          <div className="container-site grid gap-12 pt-36 pb-20 md:grid-cols-12 md:items-end md:pt-44 md:pb-28">
            <div className="md:col-span-7">
              <Link href="/members" className="nav-link text-muted inline-flex items-center gap-2 text-sm">
                <ArrowLeft aria-hidden="true" className="size-4" />
                All members
              </Link>
              <h1 id="member-name" className="text-h1 mt-8">
                {member.name}
              </h1>
              <p className="text-lead mt-4 text-white/75">
                {[work, `Member since ${member.memberSince}`].filter(Boolean).join(". ")}
              </p>
              <blockquote className="text-gold mt-10 max-w-[30ch] font-serif text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] leading-snug italic">
                “{member.quote}”
              </blockquote>
            </div>
            {member.imageSlot && (
              <div className="md:col-span-4 md:col-start-9">
                <ImageSlot id={member.imageSlot} sizes="(min-width: 900px) 30vw, 100vw" priority />
              </div>
            )}
          </div>
        </header>

        <section aria-label="Before and today" className="bg-soft-gray">
          <dl className="container-site grid md:grid-cols-2">
            <div className="border-hairline border-b py-12 md:border-r md:border-b-0 md:pr-12">
              <dt className="text-eyebrow text-ink-muted">Before</dt>
              <dd className="text-h3 mt-4">{member.before}</dd>
            </div>
            <div className="py-12 md:pl-12">
              <dt className="text-eyebrow text-ink-muted">Today</dt>
              <dd className="text-h3 mt-4">{member.today}</dd>
            </div>
          </dl>
        </section>

        <section aria-label={`${firstName(member.name)}'s story`} className="py-section bg-white">
          <div className="container-site">
            <div className="mx-auto flex max-w-[62ch] flex-col gap-6 font-serif text-[1.3125rem] leading-[1.7]">
              {member.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
