import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "ghost" | "dark";

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  className?: string;
}

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-[0.9375rem] font-semibold " +
  "transition-[background-color,border-color,box-shadow,color] duration-(--duration-quick) ease-(--ease-deliver)";

const variants: Record<Variant, string> = {
  primary:
    "bg-maroon text-white hover:bg-maroon-hover hover:shadow-[0_0_0_6px_rgb(214_176_106/0.18)] magnetic",
  ghost: "border border-white/25 text-white hover:border-gold",
  dark: "bg-ink text-white hover:bg-tm-blue",
};

/** Pill call-to-action. Always a link: every CTA on this site navigates somewhere. */
export function ButtonLink({ variant = "primary", className = "", ...props }: ButtonLinkProps) {
  return <Link {...props} className={`${base} ${variants[variant]} ${className}`} />;
}
