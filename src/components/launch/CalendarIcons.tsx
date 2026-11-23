import Image from "next/image";

/**
 * The calendar apps' own marks, for the "Save the date" links on the launch countdown
 * (official artwork in public/brand/calendar/). Decorative: each link's text names the app,
 * so the logos have empty alt text. Never recoloured, like the club badge.
 * Served as files, unoptimized: they are vectors already.
 */

interface IconProps {
  className?: string;
}

function Logo({ src, className }: IconProps & { src: string }) {
  return <Image src={src} alt="" width={20} height={20} unoptimized className={className} />;
}

export function GoogleCalendarIcon({ className }: IconProps) {
  return <Logo src="/brand/calendar/google.svg" className={className} />;
}

export function AppleIcon({ className }: IconProps) {
  return <Logo src="/brand/calendar/apple.svg" className={className} />;
}

export function OutlookIcon({ className }: IconProps) {
  return <Logo src="/brand/calendar/outlook.svg" className={className} />;
}
