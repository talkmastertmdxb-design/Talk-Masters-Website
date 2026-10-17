import Image from "next/image";
import Link from "next/link";
import badge from "../../../public/brand/talk-masters-badge.png";

interface WordmarkProps {
  /** Badge size in px. The club name is set in type beside it, so it stays legible at any size. */
  size?: number;
  /** Load immediately: the header badge is above the fold on every page. */
  eager?: boolean;
  className?: string;
}

/**
 * The club badge plus the name in type. The badge includes the Toastmasters
 * International emblem: confirm this lockup with the Toastmasters brand portal
 * before launch (docs/IMPLEMENTATION_PLAN.md §0.1, decision D2).
 */
export function Wordmark({ size = 44, eager = false, className = "" }: WordmarkProps) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-3 leading-none ${className}`}>
      <Image
        src={badge}
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className="shrink-0 drop-shadow-[0_2px_8px_rgb(0_0_0/0.35)]"
      />
      <span className="flex flex-col">
        <span className="font-serif text-[1.375rem] tracking-[-0.01em]">Talk-Masters</span>
        <span className="mt-1 text-[0.6875rem] tracking-[0.04em] opacity-70">
          A Toastmasters International club
        </span>
      </span>
      <span className="sr-only">, home</span>
    </Link>
  );
}
