import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "ghost" | "dark" | "stone";

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  className?: string;
}

/** Redesign buttons (2026-10-26): one pill shape, 52px tall, three weights plus a ghost for dark grounds. */
const base =
  "inline-flex min-h-13 items-center justify-center gap-2 rounded-full px-7 text-[0.9375rem] font-semibold " +
  "transition-[background-color,border-color,box-shadow,color] duration-(--duration-quick) ease-(--ease-deliver)";

const variants: Record<Variant, string> = {
  /** Gold: the only way to book. */
  primary: "bg-gold text-ink hover:bg-gold-hover hover:shadow-[0_0_0_6px_rgb(214_176_106/0.22)] magnetic",
  /** Outline, for a second action on dark sections. */
  ghost: "border border-white/30 text-white hover:border-gold",
  /** Ink, for a strong second action on light sections. */
  dark: "bg-ink text-white hover:bg-tm-blue",
  /** Stone, for a quiet second action on light sections. */
  stone: "bg-stone text-ink hover:bg-stone-hover",
};

/** Pill call-to-action. Always a link: every CTA on this site navigates somewhere. */
export function ButtonLink({ variant = "primary", className = "", ...props }: ButtonLinkProps) {
  return <Link {...props} className={`${base} ${variants[variant]} ${className}`} />;
}
