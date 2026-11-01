import { formatDay } from "@/lib/content/dates";

interface LastUpdatedProps {
  /** An ISO day from content/updates.json. */
  date: string;
  className?: string;
}

/** "Last updated 27 October 2026": tells readers, search engines and AI answers how fresh the facts are. */
export function LastUpdated({ date, className = "" }: LastUpdatedProps) {
  return (
    <p className={`text-sm ${className}`}>
      Last updated <time dateTime={date}>{formatDay(date)}</time>
    </p>
  );
}
