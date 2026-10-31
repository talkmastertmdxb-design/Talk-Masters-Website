import Image from "next/image";

/** Echo's poses (public/images/mascot/), with each file's size. */
const POSES = {
  wave: { src: "/images/mascot/echo-wave.png", width: 509, height: 640, alt: "waving hello" },
  cheer: { src: "/images/mascot/echo-cheer.png", width: 560, height: 640, alt: "cheering" },
  think: { src: "/images/mascot/echo-think.png", width: 417, height: 640, alt: "thinking" },
} as const;

export type MascotPose = keyof typeof POSES;

interface MascotProps {
  pose?: MascotPose;
  /** "dark" stands Echo in a soft gold spotlight, so the navy body never sinks into a dark section. */
  tone?: "light" | "dark";
  /** Responsive sizes hint for next/image. */
  sizes?: string;
  className?: string;
}

/**
 * Echo, the club's guide mascot. It floats and breathes on two slow, out-of-step CSS loops
 * (globals.css, `.mascot`), transform only so it stays on the compositor, and holds still
 * under reduced motion. The ground shadow stays put and tightens as Echo rises.
 */
export function Mascot({ pose = "wave", tone = "light", sizes = "136px", className = "" }: MascotProps) {
  const art = POSES[pose];
  return (
    <div className={`mascot ${tone === "dark" ? "mascot--on-dark" : ""} ${className}`}>
      <div className="mascot__float">
        <div className="mascot__breathe">
          <Image
            src={art.src}
            alt={`Echo, the Talk-Masters mascot, ${art.alt}`}
            width={art.width}
            height={art.height}
            sizes={sizes}
            draggable={false}
            className="mascot__img"
          />
        </div>
      </div>
      <span aria-hidden="true" className="mascot__shadow" />
    </div>
  );
}
