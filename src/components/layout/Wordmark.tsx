import Link from "next/link";

interface WordmarkProps {
  className?: string;
}

/**
 * Typographic placeholder for the club mark until a Toastmasters-compliant
 * logo is approved (docs/IMPLEMENTATION_PLAN.md §0.1). Never redraw the TI emblem.
 */
export function Wordmark({ className = "" }: WordmarkProps) {
  return (
    <Link href="/" className={`group inline-flex flex-col leading-none ${className}`}>
      <span className="font-serif text-[1.375rem] tracking-[-0.01em]">Talk-Masters</span>
      <span className="mt-1 text-[0.6875rem] tracking-[0.04em] opacity-70">
        A Toastmasters International club
      </span>
    </Link>
  );
}
