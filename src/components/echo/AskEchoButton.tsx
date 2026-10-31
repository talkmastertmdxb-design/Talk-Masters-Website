"use client";

import { MessageCircle } from "lucide-react";
import { openEcho } from "@/lib/echo/conversation";

/** Opens Echo's chat from the FAQ: "or ask Echo". */
export function AskEchoButton({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <button
      type="button"
      onClick={openEcho}
      className={`nav-link inline-flex min-h-11 items-center gap-2 font-semibold ${tone === "dark" ? "text-gold" : "text-tm-blue"}`}
    >
      <MessageCircle aria-hidden="true" className="size-4.5" />
      Ask Echo a question
    </button>
  );
}
