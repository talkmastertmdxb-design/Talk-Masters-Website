import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  lead: string;
  /** Optional content under the lead, e.g. a back link or facts row. */
  children?: ReactNode;
}

/** Dark opening band for inner pages, so the floating nav always sits on dark. */
export function PageHeader({ title, lead, children }: PageHeaderProps) {
  return (
    <header className="theme-dark grain hero-stage bg-ink relative isolate overflow-hidden text-white">
      <div className="container-site pt-40 pb-20 md:pt-48 md:pb-28">
        <h1 className="text-h1 max-w-[16ch]">{title}</h1>
        <p className="text-lead mt-8 max-w-[52ch] text-white/80">{lead}</p>
        {children}
      </div>
    </header>
  );
}
