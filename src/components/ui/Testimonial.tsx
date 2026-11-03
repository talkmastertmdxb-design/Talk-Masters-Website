import type { ComponentProps } from "react";

/**
 * A quote card, adapted from a 21st.dev testimonial: a quote that grows to fill the card and the
 * speaker's name beneath it. Colours come from the surrounding section; the original avatar and
 * "verified" badge are left out (photos go through ImageSlot, and nothing here is verified).
 */
export function Testimonial({ className = "", ...props }: ComponentProps<"figure">) {
  return <figure data-slot="testimonial" className={`m-0 flex h-full flex-col ${className}`} {...props} />;
}

export function TestimonialQuote({ className = "", ...props }: ComponentProps<"blockquote">) {
  return (
    <blockquote
      data-slot="testimonial-quote"
      className={`m-0 grow px-4 py-3 text-pretty ${className}`}
      {...props}
    />
  );
}

export function TestimonialAuthor({ className = "", ...props }: ComponentProps<"figcaption">) {
  return <figcaption data-slot="testimonial-author" className={`px-4 pt-1 pb-3 ${className}`} {...props} />;
}

export function TestimonialAuthorName({ className = "", ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="testimonial-author-name"
      className={`text-sm leading-tight font-semibold ${className}`}
      {...props}
    />
  );
}
