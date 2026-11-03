"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { media } from "@/lib/motion/tokens";
import { profileMotion } from "@/lib/motion/profile";

gsap.registerPlugin(useGSAP, SplitText);

interface MemberProfileProps {
  /** Member slug: /members#slug opens this profile directly. */
  slug: string;
  name: string;
  /** The card's visible content (photo, name, work); the whole of it opens the profile. */
  card: ReactNode;
  /** The profile's portrait, shown large on the left (on top on phones). */
  portrait: ReactNode;
  /** The profile's story. Mark the name [data-profile-name], animated rows [data-profile-item]. */
  children: ReactNode;
  /** Sections of the story, listed under the portrait on wide screens. Ids must be in `children`. */
  chapters?: readonly ProfileChapter[];
  /** "3 of 11", shown with the chapters. */
  position?: string;
}

export interface ProfileChapter {
  id: string;
  label: string;
}

const reduceMotion = (): boolean => window.matchMedia(media.reducedMotion).matches;

/** The card's photo: where the portrait flies from, and back to. */
const cardPhoto = (root: RefObject<HTMLElement | null>): HTMLElement | null =>
  root.current?.querySelector<HTMLElement>("[data-profile-trigger] [data-image-slot]") ?? null;

const within = (dialog: RefObject<HTMLDialogElement | null>, selector: string): HTMLElement[] =>
  Array.from(dialog.current?.querySelectorAll<HTMLElement>(selector) ?? []);

/** True when the card's photo is on screen, so the portrait can fly out of it. */
const isVisible = (rect: DOMRect): boolean =>
  rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;

/**
 * A member card that opens into a full-screen profile. The photo lifts out of the card and
 * grows into the profile's portrait (a shared-element transition, animated by real size so
 * the photo never distorts); the name rises letter by letter and the story follows. Closing
 * plays it back into the card. Reduced motion: a short fade. Native <dialog>: focus is
 * trapped, Escape closes, and focus returns to the card.
 */
export function MemberProfile({
  slug,
  name,
  card,
  portrait,
  children,
  chapters = [],
  position,
}: MemberProfileProps) {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const split = useRef<SplitText | null>(null);
  const closing = useRef(false);
  /**
   * The portrait mounts the first time the profile opens (and loads at high priority), so the
   * page only downloads card photos. A profile opened from a link loads its portrait at once.
   */
  const [portraitMounted, setPortraitMounted] = useState(false);

  /** The latest open/close, for listeners set up once per member. */
  const actions = useRef<{ open: () => void; close: () => void } | null>(null);

  // Animations start in event handlers; adding them to the context still reverts them on unmount.
  const { context } = useGSAP({ scope: root });
  const target = (selector: string): HTMLElement[] => within(dialog, selector);

  const finishClose = useCallback(() => {
    split.current?.revert();
    split.current = null;
    document.documentElement.classList.remove("profile-open");
    if (window.location.hash === `#${slug}`) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    const photo = cardPhoto(root);
    if (photo) gsap.set(photo, { clearProps: "opacity" });
    closing.current = false;
    dialog.current?.close();
    // Faded out for the close; reset only now that the dialog is shut, so nothing flashes back.
    const faded = within(dialog, "[data-profile-item], [data-profile-name], [data-profile-curtain]");
    gsap.set([dialog.current, ...faded], { clearProps: "opacity" });
  }, [slug]);

  const open = (): void => {
    context.add(() => {
      const node = dialog.current;
      if (!node || node.open) return;
      const photo = cardPhoto(root);
      const from = photo?.getBoundingClientRect();

      // Until the full-size portrait arrives, show the card photo the browser already has.
      const cardImage = photo?.querySelector("img");
      const flyerBox = target("[data-profile-portrait]")[0];
      if (flyerBox && cardImage?.currentSrc) {
        flyerBox.style.backgroundImage = `url("${cardImage.currentSrc}")`;
        flyerBox.style.backgroundPosition = cardImage.style.objectPosition || "50% 50%";
      }
      setPortraitMounted(true);
      // "Next member" links: the profile being left closes as this one opens.
      for (const other of document.querySelectorAll<HTMLDialogElement>("dialog.member-profile[open]")) {
        if (other !== node) other.close();
      }
      node.showModal();
      node.scrollTop = 0;
      document.documentElement.classList.add("profile-open");
      window.history.replaceState(null, "", `#${slug}`);

      const curtain = target("[data-profile-curtain]");
      const flyer = target("[data-profile-portrait]")[0];
      const items = target("[data-profile-item]");
      const nameEl = target("[data-profile-name]")[0];

      timeline.current?.kill();
      if (reduceMotion()) {
        timeline.current = gsap.timeline().fromTo(node, { opacity: 0 }, { opacity: 1, duration: 0.2 });
        return;
      }

      split.current?.revert();
      split.current = nameEl ? SplitText.create(nameEl, { type: "words, chars", mask: "chars" }) : null;

      const tl = gsap.timeline({ defaults: { ease: profileMotion.ease } });
      tl.fromTo(
        curtain,
        { opacity: 0 },
        { opacity: 1, duration: profileMotion.curtain, ease: "power2.out" },
        0,
      );

      // Shared element: the portrait starts exactly over the card's photo, then takes its place.
      if (flyer && photo && from && isVisible(from)) {
        const to = flyer.getBoundingClientRect();
        gsap.set(photo, { opacity: 0 });
        tl.fromTo(
          flyer,
          {
            position: "fixed",
            top: from.top,
            left: from.left,
            width: from.width,
            height: from.height,
            borderRadius: 24,
            zIndex: 5,
          },
          {
            top: to.top,
            left: to.left,
            width: to.width,
            height: to.height,
            borderRadius: 0,
            duration: profileMotion.flight,
            clearProps: "position,top,left,width,height,borderRadius,zIndex",
          },
          0,
        );
      } else if (flyer) {
        tl.fromTo(
          flyer,
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: profileMotion.flight },
          0,
        );
      }

      if (split.current) {
        tl.from(
          split.current.chars,
          { yPercent: 110, duration: 0.9, stagger: 0.025, ease: "power4.out" },
          0.45,
        );
      }
      tl.from(items, { opacity: 0, y: 28, duration: 0.8, stagger: 0.07 }, 0.6);
      timeline.current = tl;
    });
  };

  const close = (): void => {
    context.add(() => {
      const node = dialog.current;
      if (!node?.open || closing.current) return;
      closing.current = true;
      timeline.current?.kill();

      if (reduceMotion()) {
        gsap.to(node, { opacity: 0, duration: 0.15, onComplete: finishClose });
        return;
      }

      const photo = cardPhoto(root);
      const flyer = target("[data-profile-portrait]")[0];
      const to = photo?.getBoundingClientRect();
      const tl = gsap.timeline({ defaults: { ease: profileMotion.ease }, onComplete: finishClose });
      tl.to(target("[data-profile-item], [data-profile-name]"), {
        opacity: 0,
        duration: 0.25,
        ease: "power1.out",
      });

      if (flyer && to && isVisible(to)) {
        const from = flyer.getBoundingClientRect();
        tl.fromTo(
          flyer,
          {
            position: "fixed",
            top: from.top,
            left: from.left,
            width: from.width,
            height: from.height,
            zIndex: 5,
          },
          {
            top: to.top,
            left: to.left,
            width: to.width,
            height: to.height,
            borderRadius: 24,
            duration: profileMotion.flight * 0.8,
            clearProps: "position,top,left,width,height,borderRadius,zIndex",
          },
          0.1,
        );
      }
      tl.to(target("[data-profile-curtain]"), { opacity: 0, duration: 0.45 }, ">-0.35");
    });
  };

  useEffect(() => {
    actions.current = { open, close };
  });

  /** Chapter buttons scroll the profile (an id link would change the hash, which names a member). */
  const goTo = (id: string): void => {
    dialog.current
      ?.querySelector(`#${CSS.escape(id)}`)
      ?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
  };

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    // Spotlight cards and shared links land on /members#slug.
    if (window.location.hash === `#${slug}`) actions.current?.open();
    // Escape: play the close instead of snapping shut.
    const onCancel = (event: Event) => {
      event.preventDefault();
      actions.current?.close();
    };
    // Closed by another profile opening: finish this one's animation and give the card its photo back.
    const onClose = () => {
      if (closing.current) return;
      if (timeline.current && timeline.current.progress() < 1) timeline.current.progress(1);
      timeline.current?.kill();
      split.current?.revert();
      split.current = null;
      const photo = cardPhoto(root);
      if (photo) gsap.set(photo, { clearProps: "opacity" });
    };
    // A "next member" link changes the hash to that member.
    const onHashChange = () => {
      if (window.location.hash === `#${slug}`) actions.current?.open();
    };
    node.addEventListener("cancel", onCancel);
    node.addEventListener("close", onClose);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      node.removeEventListener("cancel", onCancel);
      node.removeEventListener("close", onClose);
      window.removeEventListener("hashchange", onHashChange);
      document.documentElement.classList.remove("profile-open");
    };
  }, [slug]);

  return (
    <div ref={root} className="contents">
      <button
        type="button"
        data-profile-trigger
        onClick={open}
        aria-haspopup="dialog"
        aria-label={`Open ${name}'s profile`}
        className="group block w-full cursor-pointer text-left"
      >
        {card}
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={`${slug}-profile-name`}
        data-lenis-prevent
        className="member-profile theme-dark m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto overscroll-contain border-0 bg-transparent p-0 text-white"
      >
        <div data-profile-curtain aria-hidden="true" className="bg-ink grain fixed inset-0" />
        <button
          type="button"
          onClick={close}
          aria-label="Close profile"
          className="hover:border-gold fixed top-4 right-4 z-20 inline-flex size-12 items-center justify-center rounded-full border border-white/30 bg-black/30 backdrop-blur-md transition-colors duration-(--duration-quick) md:top-6 md:right-6"
        >
          <X aria-hidden="true" className="size-5" />
        </button>

        <div className="relative grid min-h-dvh lg:grid-cols-12">
          <div className="relative h-[58svh] lg:sticky lg:top-0 lg:col-span-5 lg:h-dvh">
            <div
              data-profile-portrait
              className="profile-portrait absolute inset-0 isolate overflow-hidden bg-cover"
            >
              {portraitMounted && portrait}
              {/* One grade for every portrait, so the collection reads as a set. */}
              <div aria-hidden="true" className="profile-portrait__grade absolute inset-0" />
            </div>
            {chapters.length > 0 && (
              <nav
                aria-label={`In ${name}'s profile`}
                className="bg-ink/75 absolute bottom-10 left-10 hidden w-72 rounded-2xl px-5 pt-4 pb-2 backdrop-blur-md lg:block xl:bottom-14 xl:left-14"
              >
                {position && <p className="text-sm text-white/70">{position}</p>}
                <ul className="mt-1">
                  {chapters.map((chapter) => (
                    <li key={chapter.id} className="border-b border-white/12 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => goTo(chapter.id)}
                        className="group hover:text-gold flex min-h-12 w-full cursor-pointer items-center gap-3 text-left font-serif text-xl text-white/85 transition-colors duration-(--duration-quick)"
                      >
                        <span
                          aria-hidden="true"
                          className="bg-gold/60 group-hover:bg-gold h-px w-4 transition-[width] duration-(--duration-quick) group-hover:w-8"
                        />
                        {chapter.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
          <div className="relative isolate px-6 pt-10 pb-24 sm:px-10 lg:col-span-7 lg:pt-28 lg:pr-14 lg:pl-16 xl:pr-20 xl:pl-20">
            {/* The story's own ground, fading with the curtain: the text stays on ink however far it scrolls. */}
            <div data-profile-curtain aria-hidden="true" className="bg-ink absolute inset-0 -z-10" />
            <div className="max-w-[46rem]">{children}</div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
