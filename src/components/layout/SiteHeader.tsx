"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { TimingLight } from "@/components/signature/TimingLight";
import { Wordmark } from "./Wordmark";

export interface NavItem {
  href: string;
  label: string;
}

interface SiteHeaderProps {
  items: readonly NavItem[];
}

const FROST_AFTER_PX = 40;

/** Floating glass pill: transparent over the hero, frosted once the page moves. */
export function SiteHeader({ items }: SiteHeaderProps) {
  const [frosted, setFrosted] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setFrosted(window.scrollY > FROST_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMenu = () => menuRef.current?.showModal();
  const closeMenu = () => menuRef.current?.close();

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 px-[max(0.75rem,calc(var(--site-gutter)-1.75rem))] pt-3 md:pt-5">
      <div
        data-frosted={frosted}
        className="theme-dark data-[frosted=true]:bg-ink/85 mx-auto flex h-16 max-w-[calc(var(--site-max)-2*var(--site-gutter)+3.5rem)] items-center justify-between gap-4 rounded-full border border-transparent px-5 text-white transition-[background-color,border-color,backdrop-filter] duration-(--duration-base) ease-(--ease-deliver) data-[frosted=true]:border-white/10 data-[frosted=true]:backdrop-blur-xl md:px-7"
      >
        <Wordmark
          eager
          className="origin-left transition-transform duration-(--duration-base) ease-(--ease-deliver) in-data-[frosted=true]:scale-[0.94]"
        />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-8 text-[0.9375rem]">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <TimingLight />
          <span className="hidden sm:block">
            <ButtonLink href="/join" className="min-h-11 px-5">
              Book a guest visit
            </ButtonLink>
          </span>
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

      <dialog
        ref={menuRef}
        aria-label="Menu"
        className="theme-dark mobile-menu bg-ink backdrop:bg-ink/80 m-0 h-dvh max-h-none w-full max-w-none p-0 text-white"
      >
        <div className="container-site flex h-full flex-col py-6">
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
          <nav aria-label="Mobile" className="mt-16 flex-1">
            <ul className="flex flex-col gap-2">
              {items.map((item, index) => (
                <li key={item.href} className="menu-item" style={{ "--i": index } as React.CSSProperties}>
                  <Link href={item.href} onClick={closeMenu} className="text-h2 block py-2">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ButtonLink href="/join" onClick={closeMenu} className="w-full">
            Book a guest visit
          </ButtonLink>
        </div>
      </dialog>
    </header>
  );
}
