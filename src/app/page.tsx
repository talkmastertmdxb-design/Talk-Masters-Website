import type { Metadata } from "next";
import { RevealScope } from "@/components/motion/RevealScope";
import { About } from "@/components/sections/About";
import { ExecutiveCommittee } from "@/components/sections/ExecutiveCommittee";
import { Faq } from "@/components/sections/Faq";
import { FearStory } from "@/components/sections/FearStory";
import { Hero } from "@/components/sections/Hero";
import { InsideMeeting } from "@/components/sections/InsideMeeting";
import { MemberFaces } from "@/components/sections/MemberFaces";
import { MemberVoices } from "@/components/sections/MemberVoices";
import { PathwaysTeaser } from "@/components/sections/PathwaysTeaser";
import { WhoItsFor } from "@/components/sections/WhoItsFor";
import { Workplaces } from "@/components/sections/Workplaces";

/** The title and description come from the root layout; the home page only adds its canonical. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * The home page is a speech (docs/IMPLEMENTATION_PLAN.md §1.1, SCROLL_ANIMATION_SYSTEM.md).
 * Opening: Hero, Manifesto (with the mission), Who it's for, Member Voices (video).
 * How you'll grow: Pathways teaser after Inside a Meeting.
 * Body: Overcome the Fear, Inside a Meeting, Member Faces. Close: Executive Committee, the guests'
 * questions, then the gold guest invitation in the footer.
 * Where our members work sits right under the hero, as proof before the story begins.
 * Still to come (Phase 6): stacked statement, impact metrics, journey, events.
 */
export default function Home() {
  return (
    <RevealScope as="main" id="main">
      <Hero />
      <Workplaces />
      <About />
      <WhoItsFor />
      <MemberVoices />
      <FearStory />
      <InsideMeeting />
      <PathwaysTeaser />
      <MemberFaces />
      <ExecutiveCommittee />
      <Faq />
    </RevealScope>
  );
}
