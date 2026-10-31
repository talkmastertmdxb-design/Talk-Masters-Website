import Link from "next/link";
import { parseReply } from "@/lib/echo/links";

/** Echo's answer as text, with links only to the club's own pages, WhatsApp and the map. */
export function EchoReply({ text }: { text: string }) {
  return (
    <>
      {parseReply(text).map((segment, index) => {
        if (segment.type === "text") return <span key={index}>{segment.text}</span>;
        return segment.href.startsWith("/") ? (
          <Link key={index} href={segment.href} className="echo-link">
            {segment.text}
          </Link>
        ) : (
          <a key={index} href={segment.href} target="_blank" rel="noopener noreferrer" className="echo-link">
            {segment.text}
          </a>
        );
      })}
    </>
  );
}
