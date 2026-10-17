import { RevealScope } from "@/components/motion/RevealScope";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { OfficerCard } from "@/components/people/OfficerCard";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Executive Committee",
  description: "Meet the Talk-Masters Club Executive Committee, the members who lead the club this year.",
};

export default function TeamPage() {
  const { officers } = content;

  return (
    <RevealScope as="main" id="main">
      <PageHeader
        title="The Executive Committee"
        lead="Volunteer members who run the club this year, and who were once nervous first-time guests too."
        imageSlot="team-hero"
      />
      <section aria-label="Committee members" className="py-section bg-white">
        <div
          data-reveal="stagger"
          className="container-site grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
        >
          {officers.map((officer) => (
            <OfficerCard key={officer.slug} officer={officer} showBio />
          ))}
        </div>
      </section>
    </RevealScope>
  );
}
