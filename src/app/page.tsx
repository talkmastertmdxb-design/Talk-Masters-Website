import { RevealScope } from "@/components/motion/RevealScope";
import { About } from "@/components/sections/About";
import { ExecutiveCommittee } from "@/components/sections/ExecutiveCommittee";
import { Faq } from "@/components/sections/Faq";
import { FearStory } from "@/components/sections/FearStory";
import { Hero } from "@/components/sections/Hero";
import { InsideMeeting } from "@/components/sections/InsideMeeting";
import { MemberSpotlight } from "@/components/sections/MemberSpotlight";
import { MemberVoices } from "@/components/sections/MemberVoices";
import { PathwaysTeaser } from "@/components/sections/PathwaysTeaser";
import { WhoItsFor } from "@/components/sections/WhoItsFor";
import { TableTopicsBooth } from "@/components/sections/TableTopicsBooth";

/**
 * The home page is a speech (docs/IMPLEMENTATION_PLAN.md §1.1, SCROLL_ANIMATION_SYSTEM.md).
 * Opening: Hero, Manifesto (with the mission), Who it's for, Member Voices (video).
 * How you'll grow: Pathways teaser after Inside a Meeting. Body: Overcome the Fear, Inside a Meeting, Table Topics Booth,
 * Member Spotlight. Close: Executive Committee, the guests' questions, then the final CTA in the footer.
 * Still to come (Phase 6): stacked statement, impact metrics, journey, events.
 */
export default function Home() {
  return (
    <RevealScope as="main" id="main">
      <Hero />
      <About />
      <WhoItsFor />
      <MemberVoices />
      <FearStory />
      <InsideMeeting />
      <PathwaysTeaser />
      <TableTopicsBooth />
      <MemberSpotlight />
      <ExecutiveCommittee />
      <Faq />
    </RevealScope>
  );
}
