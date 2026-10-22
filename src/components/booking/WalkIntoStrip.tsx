import { ImageSlot } from "@/components/media/ImageSlot";
import { agenda, meridiem } from "@/lib/motion/agenda";

/** The four moments of the morning we show guests, from the meeting agenda. */
const MOMENTS = [
  { slot: "agenda-welcome", caption: "You're greeted at the door and given a seat." },
  { slot: "agenda-prepared-speeches", caption: "Members give the speeches they've prepared." },
  { slot: "agenda-table-topics", caption: "Try one if you like, or just watch." },
  { slot: "agenda-awards", caption: "Awards, then everyone stays to chat." },
] as const;

/**
 * "What you'll walk into": real club photos of a meeting, so the guest page has people on it.
 * A swipeable row on phones, four across on wide screens.
 */
export function WalkIntoStrip() {
  const moments = MOMENTS.flatMap(({ slot, caption }) => {
    const item = agenda.find((entry) => entry.imageSlot === slot);
    return item ? [{ ...item, caption }] : [];
  });

  return (
    <section aria-labelledby="walk-into-title" className="mt-20">
      <p className="text-eyebrow text-gold">What you&apos;ll walk into</p>
      <h2 id="walk-into-title" className="text-h3 mt-3 max-w-[34ch]">
        A friendly room, a full morning, and breakfast included
      </h2>
      {/* Focusable so keyboard users can scroll it on phones, where it swipes sideways. */}
      <ul
        tabIndex={0}
        aria-label="Photos of a Talk-Masters meeting"
        className="mt-8 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto pb-2 max-sm:-mx-(--site-inset) max-sm:px-(--site-inset) md:grid md:grid-cols-4 md:overflow-visible"
      >
        {moments.map((moment) => (
          <li key={moment.imageSlot} className="w-[70vw] shrink-0 snap-start sm:w-[18rem] md:w-auto">
            <ImageSlot id={moment.imageSlot} sizes="(min-width: 900px) 22vw, 70vw" />
            <p className="text-gold mt-4 font-serif text-xl tabular-nums">
              {moment.time} <span className="text-muted font-sans text-sm">{meridiem(moment.time)}</span>
            </p>
            <p className="mt-1 font-semibold text-white">{moment.title}</p>
            <p className="text-muted mt-1 text-sm">{moment.caption}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
