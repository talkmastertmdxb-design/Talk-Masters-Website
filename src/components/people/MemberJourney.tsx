"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

interface MemberJourneyProps {
  /** Member slug; /members#slug opens this journey directly. */
  id: string;
  label: string;
  title: string;
  children: ReactNode;
}

/** Expanded journey card as a native modal dialog: focus is trapped, Escape closes. */
export function MemberJourney({ id, label, title, children }: MemberJourneyProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  const open = () => {
    dialog.current?.showModal();
    window.history.replaceState(null, "", `#${id}`);
  };
  const close = () => dialog.current?.close();

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (window.location.hash === `#${id}`) node.showModal();
    const clearHash = () => {
      if (window.location.hash === `#${id}`) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    };
    node.addEventListener("close", clearHash);
    return () => node.removeEventListener("close", clearHash);
  }, [id]);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="nav-link text-tm-blue mt-5 inline-block text-left font-semibold"
      >
        {label}
      </button>
      <dialog
        ref={dialog}
        aria-label={title}
        onClick={(event) => event.target === event.currentTarget && close()}
        className="journey-dialog text-ink rounded-panel backdrop:bg-ink/70 m-auto max-h-[90dvh] w-[min(56rem,calc(100vw-2rem))] max-w-none overflow-y-auto bg-white p-0 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-6 md:p-12">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="border-hairline absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-full border"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
          {children}
        </div>
      </dialog>
    </>
  );
}
