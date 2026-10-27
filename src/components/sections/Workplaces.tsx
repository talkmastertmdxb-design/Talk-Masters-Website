import Image from "next/image";
import { content } from "@/lib/content";
import { workplaceName, type Workplace } from "@/lib/content/schemas";

/** Each name gets its own type treatment, so the strip reads like a row of marks, not a list. */
const treatments = [
  "font-serif text-[1.75rem] tracking-[-0.02em]",
  "text-[1.05rem] font-semibold uppercase tracking-[0.16em]",
  "font-serif text-[1.75rem] italic tracking-[-0.01em]",
  "text-[1.5rem] font-extrabold tracking-[-0.04em]",
  "text-[1.6rem] font-light tracking-[-0.01em]",
] as const;

/**
 * Logos are sized by area, not height, so a squat badge and a long wordmark carry the same
 * visual weight: a 4:1 logo is 40px tall, and the clamp keeps the extremes in proportion.
 */
const LOGO_AREA = 40 * 160;
const LOGO_HEIGHT = { min: 26, max: 52 } as const;

function logoHeight(width: number, height: number, scale = 1): number {
  const ideal = Math.sqrt(LOGO_AREA / (width / height)) * scale;
  return Math.round(Math.min(LOGO_HEIGHT.max, Math.max(LOGO_HEIGHT.min, ideal)));
}

/** Each logo shows in its own brand colours. */
function Mark({ place, index }: { place: Workplace; index: number }) {
  if (typeof place === "string") {
    return <span className={`text-ink/75 ${treatments[index % treatments.length]}`}>{place}</span>;
  }
  const { logo, name } = place;
  return (
    <Image
      src={logo.src}
      alt={name}
      width={logo.width}
      height={logo.height}
      unoptimized
      draggable={false}
      style={{ height: `calc(${logoHeight(logo.width, logo.height, logo.scale)}px * var(--logo-scale))` }}
      className="w-auto max-w-none select-none"
    />
  );
}

function Names({ places, hidden = false }: { places: readonly Workplace[]; hidden?: boolean }) {
  return (
    <ul className="marquee__half m-0 list-none pl-0" aria-hidden={hidden || undefined}>
      {places.map((place, index) => (
        <li key={workplaceName(place)} className="flex items-center whitespace-nowrap">
          <Mark place={place} index={index} />
        </li>
      ))}
    </ul>
  );
}

/**
 * "Where our members work": employers named in members' own profiles (content/settings.json),
 * shown as each company's own logo (public/images/logos/). Drifts sideways and pauses on hover;
 * under reduced motion it is a still, centred list.
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
          <Names places={workplaces} />
          <Names places={workplaces} hidden />
        </div>
      </div>
    </section>
  );
}
