"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NextMeetingDate } from "@/components/meeting/NextMeetingDate";
import { StageLight } from "@/components/motion/StageLight";
import { ButtonLink } from "@/components/ui/Button";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { meetingTimeRange, type MeetingRule } from "@/lib/content/meeting";
import type { ProfileLink } from "@/lib/content/schemas";
import { Wordmark } from "./Wordmark";

export interface NavItem {
  href: string;
  label: string;
}

interface SiteHeaderProps {
  items: readonly NavItem[];
  /** For the "Next meeting" chip on wide screens and the card in the phone menu. */
  meeting: MeetingRule & { venue: string };
  /** The club's own profiles, shown at the foot of the phone menu. */
  socials: readonly ProfileLink[];
}

const FROST_AFTER_PX = 40;
/** Below this the bar always shows; past it, scrolling down hides it on phones and tablets. */
const HIDE_AFTER_PX = 120;
/** Ignore tiny scroll jitters (and iOS rubber-banding) so the bar never flickers. */
const SCROLL_TOLERANCE_PX = 6;

const number = (index: number): string => String(index + 1).padStart(2, "0");

/** "/members" is current on /members and its #profiles; "/" only on the home page itself. */
const isCurrent = (pathname: string, href: string): boolean =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/**
 * Full-width translucent bar: see-through glass over the hero, a little denser once the page
 * moves, with a gold line along its foot for reading progress. On phones and tablets it slides
 * away while you scroll down and returns the moment you scroll up (CSS limits the hiding to
 * those widths). Links are numbered like a meeting agenda; the current page is gold.
 */
export function SiteHeader({ items, meeting, socials }: SiteHeaderProps) {
  const [frosted, setFrosted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setFrosted(y > FROST_AFTER_PX);
      if (y < HIDE_AFTER_PX) setHidden(false);
      else if (y > lastY + SCROLL_TOLERANCE_PX) setHidden(true);
      else if (y < lastY - SCROLL_TOLERANCE_PX) setHidden(false);
      if (Math.abs(y - lastY) > SCROLL_TOLERANCE_PX || y < HIDE_AFTER_PX) lastY = y;

      const room = document.documentElement.scrollHeight - window.innerHeight;
      const progress = room > 0 ? Math.min(1, y / room) : 0;
      barRef.current?.style.setProperty("--nav-progress", progress.toFixed(3));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const openMenu = () => menuRef.current?.showModal();
  const closeMenu = () => menuRef.current?.close();

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      data-hidden={hidden}
      // Keyboard users tabbing into the bar always see it.
      onFocus={() => setHidden(false)}
      className="site-header fixed inset-x-0 top-0 z-50"
    >
      <div
        ref={barRef}
        data-frosted={frosted}
        className="site-bar theme-dark relative border-b border-white/10 text-white"
      >
        <div className="container-site flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
          <Wordmark
            eager
            compact
            className="origin-left transition-transform duration-(--duration-base) ease-(--ease-deliver) in-data-[frosted=true]:scale-[0.94]"
          />

          <nav aria-label="Main" className="site-nav hidden md:block">
            <ul className="flex items-center gap-7 text-[0.9375rem] lg:gap-8">
              {items.map((item, index) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                    className="nav-link site-nav__link"
                  >
                    <span aria-hidden="true" className="site-nav__num">
                      {number(index)}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/join"
              className="hover:border-gold bg-ink/45 hidden items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-sm text-white/85 backdrop-blur-md transition-colors duration-(--duration-quick) xl:inline-flex"
            >
              <span className="text-white/85">Next meeting</span>
              <span aria-hidden="true" className="bg-gold size-1 rounded-full" />
              <span className="font-semibold text-white">
                <NextMeetingDate rule={meeting} style="short" />
              </span>
            </Link>
            {/* Always visible: on phones it is the one action beside the menu. */}
            <ButtonLink href="/join" className="min-h-11 px-5 whitespace-nowrap">
              <span>
                Book a <span className="hidden sm:inline">guest </span>visit
              </span>
            </ButtonLink>
            <button
              type="button"
              onClick={openMenu}
              aria-label="Open menu"
              aria-haspopup="dialog"
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 md:hidden"
            >
              <Menu aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
        <span aria-hidden="true" data-nav-progress className="site-bar__progress" />
      </div>

      <dialog
        ref={menuRef}
        aria-label="Menu"
        className="theme-dark mobile-menu bg-ink backdrop:bg-ink/80 isolate m-0 h-dvh max-h-none w-full max-w-none overflow-hidden p-0 text-white"
      >
        <StageLight preset="menu" />
        <div className="container-site relative flex h-full flex-col py-6">
          <div className="flex items-center justify-between">
            <Wordmark />
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/20"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-12 flex-1">
            <ul className="flex flex-col">
              {items.map((item, index) => (
                <li
                  key={item.href}
                  className="menu-item border-b border-white/8"
                  style={{ "--i": index } as React.CSSProperties}
                >
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                    className="menu-link flex min-h-16 items-baseline gap-4 py-3"
                  >
                    <span aria-hidden="true" className="text-gold text-xs font-semibold tabular-nums">
                      {number(index)}
                    </span>
                    <span className="font-serif text-[2.5rem] leading-none tracking-[-0.02em]">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-3">
            {socials.length > 0 && (
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm text-white/70">Follow the club</span>
                <SocialLinks links={socials} name="Talk-Masters Club" className="text-white/85" />
              </div>
            )}
            <Link
              href="/join"
              onClick={closeMenu}
              className="flex min-h-16 flex-col justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3"
            >
              <span className="font-semibold">
                Next meeting <span aria-hidden="true">·</span>{" "}
                <NextMeetingDate rule={meeting} style="short" />
              </span>
              <span className="text-sm text-white/70">
                {meetingTimeRange(meeting)} · {meeting.venue}
              </span>
            </Link>
            <ButtonLink href="/join" onClick={closeMenu} className="min-h-14 w-full text-base">
              Book a guest visit
            </ButtonLink>
          </div>
        </div>
      </dialog>
    </header>
  );
}
