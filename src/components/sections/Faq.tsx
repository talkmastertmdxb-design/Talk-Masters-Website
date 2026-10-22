import { Plus } from "lucide-react";
import Link from "next/link";
import { content } from "@/lib/content";

interface FaqProps {
  /** Light on the home page, dark on /join. */
  tone?: "light" | "dark";
  /** Off on /join, where the WhatsApp buttons are already on the page. */
  showContactLink?: boolean;
}

const tones = {
  light: {
    rule: "border-hairline divide-hairline",
    answer: "text-ink-muted",
    eyebrow: "text-ink-muted",
    icon: "text-maroon",
  },
  dark: {
    rule: "border-hairline-dark divide-hairline-dark",
    answer: "text-white/75",
    eyebrow: "text-white/70",
    icon: "text-gold",
  },
} as const;

/**
 * The questions a nervous first-time guest asks (content/faqs.json). Native <details>
 * sharing one name: one answer open at a time, keyboard and screen-reader support built in.
 */
export function Faq({ tone = "light", showContactLink = true }: FaqProps) {
  const { faqs } = content;
  if (faqs.length === 0) return null;
  const style = tones[tone];

  return (
    <section aria-labelledby="faq-title" className="py-section">
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p data-reveal="up" className={`text-eyebrow ${style.eyebrow}`}>
            Before your first visit
          </p>
          <h2 id="faq-title" data-reveal="lines" className="text-h2 mt-5 max-w-[14ch]">
            Questions guests ask
          </h2>
          {showContactLink && (
            <p data-reveal="up" className={`mt-6 max-w-[34ch] ${style.answer}`}>
              Something else on your mind?{" "}
              <Link href="/join" className="nav-link font-semibold">
                Message us on WhatsApp
              </Link>
              .
            </p>
          )}
        </div>

        <div data-reveal="up" className={`divide-y border-y lg:col-span-8 ${style.rule}`}>
          {faqs.map((faq) => (
            <details key={faq.question} name="faq" className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {faq.question}
                <Plus
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className={`size-5 shrink-0 ${style.icon} transition-transform duration-(--duration-quick) ease-(--ease-deliver) group-open:rotate-45`}
                />
              </summary>
              <p className={`max-w-[62ch] pb-6 ${style.answer}`}>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
