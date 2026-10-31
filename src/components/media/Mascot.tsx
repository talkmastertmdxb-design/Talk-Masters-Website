import { EchoFigure, type EchoPose } from "./EchoFigure";

const MASCOT_LABEL = "Echo, the Talk-Masters mascot, a cartoon microphone";

interface MascotProps {
  pose?: EchoPose;
  /** "dark" gives Echo a white sticker outline and a gold spotlight, so his dark arms stay visible. */
  tone?: "light" | "dark";
  /** Responsive sizes hint for next/image. */
  sizes?: string;
  className?: string;
}

/**
 * Echo, the club's guide mascot. It floats and breathes on two slow, out-of-step CSS loops
 * (globals.css, `.mascot`), waves every few seconds, and jumps for joy on hover. Transform only,
 * so it stays on the compositor; it holds still under reduced motion. The ground shadow stays put
 * and tightens as Echo rises.
 */
export function Mascot({ pose = "wave", tone = "light", sizes = "136px", className = "" }: MascotProps) {
  return (
    <div className={`mascot ${tone === "dark" ? "mascot--on-dark" : ""} ${className}`}>
      <div className="mascot__float">
        <div className="mascot__breathe">
          <EchoFigure pose={pose} sizes={sizes} label={MASCOT_LABEL} />
        </div>
      </div>
      <span aria-hidden="true" className="mascot__shadow" />
    </div>
  );
}
