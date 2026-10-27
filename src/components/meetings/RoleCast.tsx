import {
  Award,
  BookOpenText,
  Camera,
  CircleHelp,
  Clapperboard,
  ClipboardCheck,
  DoorOpen,
  Gavel,
  MessageSquareQuote,
  Mic,
  Presentation,
  Rocket,
  SpellCheck,
  Sparkles,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { createElement } from "react";
import { ImageSlot } from "@/components/media/ImageSlot";
import { StageLight } from "@/components/motion/StageLight";
import { content } from "@/lib/content";
import type { MeetingRole } from "@/lib/content/schemas";

const ICONS: Record<string, LucideIcon> = {
  toastmaster: Mic,
  speaker: Presentation,
  evaluator: MessageSquareQuote,
  "table-topics-master": Sparkles,
  "general-evaluator": ClipboardCheck,
  timer: Timer,
  grammarian: SpellCheck,
  wordmaster: BookOpenText,
  "trivia-master": CircleHelp,
  "elevator-pitch": Rocket,
  "sergeant-at-arms": Gavel,
  president: Award,
  "greet-master": DoorOpen,
  "shoot-master": Camera,
  "reel-master": Clapperboard,
};

function RoleIcon({ slug, className }: { slug: string; className: string }) {
  return createElement(ICONS[slug] ?? Sparkles, { "aria-hidden": true, className, strokeWidth: 1.6 });
}

function FirstRoleBadge() {
  return (
    <span className="border-gold/50 text-gold inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
      Good first role
    </span>
  );
}

/** A lead role with a photo: the name and job sit on a dark fade, like the member cards. */
function PhotoRole({ role, feature }: { role: MeetingRole; feature: boolean }) {
  return (
    <article
      id={`role-${role.slug}`}
      data-first-role={role.firstRole}
      className={`cast-card rounded-card bg-surface relative isolate flex min-h-[26rem] scroll-mt-28 flex-col justify-end overflow-hidden p-6 [--slot-ratio:auto] md:p-7 ${
        feature ? "md:col-span-2 md:row-span-2 md:min-h-[44rem] md:p-9" : "md:min-h-[26rem]"
      }`}
    >
      {role.imageSlot && (
        <ImageSlot
          id={role.imageSlot}
          sizes={feature ? "(min-width: 900px) 50vw, 100vw" : "(min-width: 900px) 25vw, 100vw"}
          className="absolute! inset-0 -z-10 h-full rounded-none!"
        />
      )}
      <span aria-hidden="true" className="cast-card__scrim absolute inset-0 -z-10" />
      <p className="text-gold text-xs font-bold tracking-[0.14em] uppercase">
        {role.short ?? role.onStage}
        {role.short && role.onStage && <span className="text-white/70"> · {role.onStage}</span>}
      </p>
      <h3
        className={`mt-2 font-serif leading-[1.08] ${feature ? "text-[clamp(2rem,1.4rem+2vw,3.25rem)]" : "text-[1.75rem]"}`}
      >
        {role.name}
      </h3>
      <p className={`mt-3 text-white/80 ${feature ? "max-w-[44ch] text-lg" : "text-[0.9375rem]"}`}>
        {role.text}
      </p>
    </article>
  );
}

/** A role without a photo: icon, name, time in front of the room. */
function TextRole({ role }: { role: MeetingRole }) {
  return (
    <article
      id={`role-${role.slug}`}
      data-first-role={role.firstRole}
      className="cast-card rounded-card border-hairline-dark flex scroll-mt-28 flex-col gap-4 border bg-white/[0.04] p-6 backdrop-blur-sm md:p-7"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="bg-gold/15 text-gold flex size-12 items-center justify-center rounded-full">
          <RoleIcon slug={role.slug} className="size-5" />
        </span>
        {role.firstRole && <FirstRoleBadge />}
      </div>
      <h3 className="font-serif text-[1.5rem] leading-tight">
        {role.name}
        {role.short && <span className="text-muted font-sans text-sm"> ({role.short})</span>}
      </h3>
      <p className="text-white/75">{role.text}</p>
      {role.onStage && <p className="text-muted mt-auto pt-2 text-sm">On stage: {role.onStage}</p>}
    </article>
  );
}

/** Meet the cast: every role in a meeting, the leads with photos, the rest as cards. */
export function RoleCast() {
  const { roles } = content.meetingGuide;
  const leads = roles.filter((role) => role.group === "lead");
  const photoLeads = leads.filter((role) => role.imageSlot);
  const textLeads = leads.filter((role) => !role.imageSlot);
  const functionaries = roles.filter((role) => role.group === "functionary");
  const behindTheScenes = roles.filter((role) => role.group === "officer" || role.group === "support");

  return (
    <section
      id="roles"
      aria-labelledby="roles-title"
      className="cast theme-dark bg-ink py-section relative isolate overflow-hidden text-white"
    >
      <StageLight preset="teaser" />
      <div className="container-site">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p data-reveal="up" className="text-eyebrow text-gold">
              Meet the cast
            </p>
            <h2 id="roles-title" data-reveal="lines" className="text-h2 mt-5 max-w-[15ch]">
              {roles.length} roles. One morning.
            </h2>
            <p data-reveal="text" className="text-lead mt-6 max-w-[48ch] text-white/75">
              Members take turns, so everyone gets to practise everything. A first-timer might time the
              speeches; a few months later, they&apos;re hosting.
            </p>
          </div>
          <div data-reveal="up" className="md:col-span-5 md:justify-self-end">
            <label className="cast-toggle">
              <input type="checkbox" className="cast-toggle__input" />
              <span aria-hidden="true" className="cast-toggle__switch" />
              <span>Highlight good first roles</span>
            </label>
          </div>
        </div>

        {/* Phones swipe each row (focusable, so it scrolls from the keyboard too); wider screens get the grid. */}
        <div
          data-reveal="stagger"
          role="region"
          aria-label="The lead roles"
          tabIndex={0}
          className="cast-row mt-14 grid gap-4 max-md:-mx-(--site-gutter) max-md:flex max-md:snap-x max-md:snap-mandatory max-md:scroll-px-(--site-gutter) max-md:overflow-x-auto max-md:px-(--site-gutter) max-md:pb-3 md:mt-20 md:grid-cols-4 md:gap-5 max-md:[&>*]:w-[82%] max-md:[&>*]:shrink-0 max-md:[&>*]:snap-start"
        >
          {photoLeads.map((role, i) => (
            <PhotoRole key={role.slug} role={role} feature={i === 0} />
          ))}
          {textLeads.map((role) => (
            <TextRole key={role.slug} role={role} />
          ))}
        </div>

        <h3 data-reveal="up" className="text-eyebrow text-muted mt-20 md:mt-28">
          Keeping the meeting sharp
        </h3>
        <div
          data-reveal="stagger"
          role="region"
          aria-label="Roles that keep the meeting sharp"
          tabIndex={0}
          className="cast-row mt-6 grid gap-4 max-md:-mx-(--site-gutter) max-md:flex max-md:snap-x max-md:snap-mandatory max-md:scroll-px-(--site-gutter) max-md:overflow-x-auto max-md:px-(--site-gutter) max-md:pb-3 md:grid-cols-2 md:gap-5 lg:grid-cols-6 max-md:[&>*]:w-[82%] max-md:[&>*]:shrink-0 max-md:[&>*]:snap-start lg:[&>*]:col-span-2 lg:[&>*:nth-child(n+4)]:col-span-3"
        >
          {functionaries.map((role) => (
            <TextRole key={role.slug} role={role} />
          ))}
        </div>

        <h3 data-reveal="up" className="text-eyebrow text-muted mt-20 md:mt-28">
          Behind the scenes
        </h3>
        <ul data-reveal="stagger" className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {behindTheScenes.map((role) => {
            return (
              <li
                key={role.slug}
                id={`role-${role.slug}`}
                data-first-role={role.firstRole}
                className="cast-card border-hairline-dark flex scroll-mt-28 flex-col gap-3 rounded-2xl border p-5"
              >
                <span className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <RoleIcon slug={role.slug} className="text-gold size-5 shrink-0" />
                  <span className="font-semibold">{role.name}</span>
                </span>
                <span className="text-sm text-white/70">{role.text}</span>
                {role.firstRole && (
                  <span className="mt-auto">
                    <FirstRoleBadge />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
