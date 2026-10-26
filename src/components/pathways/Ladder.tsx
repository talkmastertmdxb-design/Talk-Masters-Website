import { content } from "@/lib/content";

type Tone = "light" | "dark";

interface LadderProps {
  tone: Tone;
  /** Show each level's one-line description inside its bar (wide screens only). */
  detailed?: boolean;
  /** Height of the tallest bar on wide screens. */
  heightClass?: string;
  className?: string;
}

/** Five steps, each a little darker than the last; the top step is the one to reach for. */
const bars: Record<Tone, readonly string[]> = {
  light: [
    "bg-tm-blue/10 text-tm-blue",
    "bg-tm-blue/20 text-tm-blue",
    "bg-tm-blue/40 text-ink",
    "bg-tm-blue/75 text-white",
    "bg-tm-blue text-white",
  ],
  dark: [
    "bg-white/8 text-white",
    "bg-white/14 text-white",
    "bg-tm-blue/70 text-white",
    "bg-tm-blue text-white",
    "bg-gold text-ink shadow-[0_0_48px_rgb(214_176_106/0.35)]",
  ],
};
const heights = ["h-[37%]", "h-[53%]", "h-[68%]", "h-[84%]", "h-full"] as const;

/**
 * The five Pathways levels as a staircase (content/pathways.json). Inside a RevealScope the bars
 * rise from their baseline one after another (data-reveal="rise"); still under reduced motion.
 * Phones show the numbers on the bars and the names in a list beneath.
 */
export function Ladder({
  tone,
  detailed = false,
  heightClass = "md:h-[24rem]",
  className = "",
}: LadderProps) {
  const { levels } = content.pathways;
  const muted = tone === "dark" ? "text-white/72" : "text-ink-muted";

  return (
    <div className={className}>
      <ol
        aria-label="The five Pathways levels"
        data-reveal="rise"
        className={`grid h-48 grid-cols-5 items-end gap-1.5 sm:h-60 md:gap-2.5 ${heightClass}`}
      >
        {levels.map((level, index) => (
          <li
            key={level.name}
            className={`flex flex-col justify-between rounded-t-lg p-2.5 md:p-4 ${heights[index]} ${bars[tone][index]}`}
          >
            <span className="font-serif text-[1.5rem] leading-none md:text-[2.25rem]">
              <span className="sr-only">Level </span>
              {index + 1}
            </span>
            <span className="max-md:sr-only">
              <span className="block text-sm leading-snug font-semibold">{level.name}</span>
              {detailed && (
                <span className="mt-1 line-clamp-3 text-[0.8125rem] leading-snug max-lg:hidden">
                  {level.text}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
      <ol aria-hidden="true" className={`mt-4 grid gap-1.5 text-sm md:hidden ${muted}`}>
        {levels.map((level, index) => (
          <li key={level.name}>
            <span className="font-semibold tabular-nums">{index + 1}</span> {level.name}
          </li>
        ))}
      </ol>
    </div>
  );
}
