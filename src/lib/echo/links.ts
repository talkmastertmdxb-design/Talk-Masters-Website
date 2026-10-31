export type ReplySegment = { type: "text"; text: string } | { type: "link"; text: string; href: string };

/** Echo may link only to the club's own pages, WhatsApp and Google Maps. */
const ALLOWED_HREF =
  /^(\/(?!\/)[\w\-/#?=&.%]*|https:\/\/wa\.me\/[\w\-/?=&.%+]*|https:\/\/www\.google\.com\/maps\/[\w\-/?=&.%+]*)$/;

/** [label](url); the url may hold one level of brackets, so "(x(1))" is read whole. */
const LINK = /\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;

const appendText = (segments: ReplySegment[], text: string): ReplySegment[] => {
  if (!text) return segments;
  const last = segments.at(-1);
  return last?.type === "text"
    ? [...segments.slice(0, -1), { type: "text", text: last.text + text }]
    : [...segments, { type: "text", text }];
};

/**
 * Splits Echo's answer into text and safe links. A link to anywhere else keeps only its label,
 * so a confused or manipulated model can never send a guest off the club's own channels.
 */
export function parseReply(reply: string): ReplySegment[] {
  const text = reply.replaceAll("**", "");
  let segments: ReplySegment[] = [];
  let cursor = 0;
  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match as unknown as [string, string, string];
    segments = appendText(segments, text.slice(cursor, match.index));
    segments = ALLOWED_HREF.test(href)
      ? [...segments, { type: "link", text: label, href }]
      : appendText(segments, label);
    cursor = match.index + whole.length;
  }
  return appendText(segments, text.slice(cursor));
}
