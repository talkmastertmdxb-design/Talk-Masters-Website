import { About } from "@/components/sections/About";
import { Hero } from "@/components/sections/Hero";
import { MemberStories } from "@/components/sections/MemberStories";
import { WhyJoin } from "@/components/sections/WhyJoin";

/**
 * The home page is a speech (docs/IMPLEMENTATION_PLAN.md §1.1).
 * Opening and the start of the Body are built; the remaining bands
 * (agenda, Table Topics booth, impact, journey, stories, events, FAQ) follow.
 */
export default function Home() {
  return (
    <main id="main">
      <Hero />
      <About />
      <WhyJoin />
      <MemberStories />
    </main>
  );
}
