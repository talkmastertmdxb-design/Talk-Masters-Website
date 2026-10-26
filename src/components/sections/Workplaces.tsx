import { content } from "@/lib/content";

/** Each name gets its own type treatment, so the strip reads like a row of marks, not a list. */
const treatments = [
  "font-serif text-[1.75rem] tracking-[-0.02em]",
  "text-[1.05rem] font-semibold uppercase tracking-[0.16em]",
  "font-serif text-[1.75rem] italic tracking-[-0.01em]",
  "text-[1.5rem] font-extrabold tracking-[-0.04em]",
  "text-[1.6rem] font-light tracking-[-0.01em]",
] as const;

function Names({ names, hidden = false }: { names: readonly string[]; hidden?: boolean }) {
  return (
    <ul className="marquee__half m-0 list-none p-0" aria-hidden={hidden || undefined}>
      {names.map((name, index) => (
        <li key={name} className={`text-ink/75 whitespace-nowrap ${treatments[index % treatments.length]}`}>
          {name}
        </li>
      ))}
    </ul>
  );
}

/**
 * "Where our members work": employers named in members' own profiles (content/settings.json),
 * set as type rather than logo files. Drifts sideways and pauses on hover; under reduced motion
 * it is a still, centred list.
 */
export function Workplaces() {
  const { workplaces } = content.settings;
  if (workplaces.length === 0) return null;

  return (
    <section id="workplaces" aria-labelledby="workplaces-title" className="bg-white py-14 md:py-20">
      <h2 id="workplaces-title" className="text-ink-muted text-center text-sm">
        Where our members work
      </h2>
      <div className="marquee mt-8 md:mt-10">
        <div className="marquee__track">
          <Names names={workplaces} />
          <Names names={workplaces} hidden />
        </div>
      </div>
    </section>
  );
}
