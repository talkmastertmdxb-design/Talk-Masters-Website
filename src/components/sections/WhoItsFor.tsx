import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  GraduationCap,
  Rocket,
  Sunrise,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { content } from "@/lib/content";

/** A line icon per audience; anyone new to the list gets a check mark. */
const icons: Record<string, LucideIcon> = {
  students: GraduationCap,
  "working professionals": BriefcaseBusiness,
  entrepreneurs: Rocket,
  managers: Users,
  educators: BookOpen,
  retirees: Sunrise,
};

/**
 * Who it's for: every audience the club serves, each with the moment they would use it,
 * so visitors recognise their own situation rather than a category. Comes right after About.
 */
export function WhoItsFor() {
  const { audiences, paths } = content.pathways;

  return (
    <section id="who-its-for" aria-labelledby="who-title" className="py-section bg-white">
      <div className="container-site grid gap-y-12 md:grid-cols-12 md:gap-x-6">
        <div className="flex flex-col md:col-span-5">
          <p data-reveal="up" className="text-eyebrow text-ink-muted">
            Who it&apos;s for
          </p>
          <h2 id="who-title" data-reveal="lines" className="text-h2 mt-5 max-w-[14ch]">
            Anyone who wants <em className="text-tm-blue">to be heard.</em>
          </h2>
          <p data-reveal="text" className="text-lead text-ink-muted mt-6 max-w-[40ch]">
            One room, every stage of life. Members join to ace an interview, lead a team, pitch an idea or
            simply speak up with confidence.
          </p>
          <div data-reveal="image" className="mt-10 md:mt-auto md:pt-10">
            <ImageSlot id="audience-meeting-room" sizes="(min-width: 900px) 38vw, 100vw" />
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <ul aria-label="Talk-Masters is for" data-reveal="stagger" className="border-hairline border-t">
            {audiences.map(({ label, reason }) => {
              const Icon = icons[label.toLowerCase()] ?? Check;
              return (
                <li
                  key={label}
                  className="border-hairline flex flex-wrap items-center gap-x-5 gap-y-1 border-b py-4 md:py-5"
                >
                  <span
                    aria-hidden="true"
                    className="bg-soft-gray text-tm-blue inline-flex size-11 shrink-0 items-center justify-center rounded-full md:size-12"
                  >
                    <Icon className="size-5" strokeWidth={1.6} />
                  </span>
                  <span className="flex-1 font-serif text-[1.375rem] leading-tight md:text-[1.75rem]">
                    {label}
                  </span>
                  <span className="text-ink-muted w-full pl-16 text-sm md:w-auto md:pl-0 md:text-[0.9375rem]">
                    {reason}
                  </span>
                </li>
              );
            })}
          </ul>
          <Link
            href="/pathways"
            data-reveal="up"
            className="group text-tm-blue mt-8 inline-flex min-h-11 items-center gap-3 font-semibold"
          >
            <span className="nav-link">See how members grow: {paths.length} Pathways to choose from</span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-(--duration-quick) group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
