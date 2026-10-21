import { Globe } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { ProfileLink, ProfileNetwork } from "@/lib/content/schemas";

interface NetworkStyle {
  label: string;
  /** Brand colour, darkened where needed so the white label passes WCAG AA. */
  background: string;
  icon: ReactNode;
}

const svg = (path: string, viewBox = "0 0 24 24") => (
  <svg aria-hidden="true" focusable="false" viewBox={viewBox} className="social-btn__icon">
    <path fill="currentColor" d={path} />
  </svg>
);

const networks: Record<ProfileNetwork, NetworkStyle> = {
  linkedin: {
    label: "LinkedIn",
    background: "#0A66C2",
    icon: svg(
      "M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z",
      "0 0 16 16",
    ),
  },
  youtube: {
    label: "YouTube",
    background: "#CC0000",
    icon: svg(
      "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    ),
  },
  x: {
    label: "X",
    background: "#000000",
    icon: svg(
      "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
    ),
  },
  instagram: {
    label: "Instagram",
    background: "linear-gradient(45deg, #C13584 0%, #833AB4 60%, #5851DB 100%)",
    icon: (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        className="social-btn__icon"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  website: {
    label: "Website",
    background: "#003A5C",
    icon: <Globe aria-hidden="true" className="social-btn__icon" />,
  },
};

interface SocialLinksProps {
  links: readonly ProfileLink[];
  /** Whose profiles these are, for each link's accessible name. */
  name: string;
  className?: string;
}

/**
 * Outlined circles in the surrounding text colour that widen into a labelled pill, in the
 * network's brand colour, on hover or keyboard focus. Set the colour on the parent or via
 * className (e.g. text-ink/70 on light sections). Touch screens show the outlined icon.
 */
export function SocialLinks({ links, name, className = "" }: SocialLinksProps) {
  if (links.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label={`${name} online`}>
      {links.map((link) => {
        const network = networks[link.network];
        const style = {
          "--social-bg": network.background,
          "--social-open": `calc(${network.label.length}ch + 3.25rem)`,
        } as CSSProperties;
        return (
          <li key={link.network}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={
                link.network === "website"
                  ? `${name}'s website (opens in a new tab)`
                  : `${name} on ${network.label} (opens in a new tab)`
              }
              className="social-btn"
              style={style}
            >
              {network.icon}
              <span aria-hidden="true" className="social-btn__text">
                {network.label}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
