import Image from "next/image";

/** Echo's poses, in public/images/mascot/toon/: all drawn on one 500×450 canvas, feet on one baseline. */
export const ECHO_POSES = ["wave", "think", "point", "cheer"] as const;
export type EchoPose = (typeof ECHO_POSES)[number];

const CANVAS = { width: 500, height: 450 };

interface EchoFigureProps {
  /** The pose on show. Hovering a launcher or mascot switches to "cheer" in CSS. */
  pose: EchoPose;
  /** Responsive sizes hint for next/image. */
  sizes: string;
  /** Names Echo for screen readers; leave out where Echo is decoration inside a labelled control. */
  label?: string;
}

/**
 * Echo, drawn as a stack of poses with one showing at a time (globals.css, `.echo-figure`), so a
 * change of pose is a quick pop rather than a reload. In the "wave" pose the raised arm is its own
 * layer and turns at the shoulder.
 */
export function EchoFigure({ pose, sizes, label }: EchoFigureProps) {
  return (
    <span
      className="echo-figure"
      data-pose={pose}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {ECHO_POSES.map((name) => (
        <span key={name} className="echo-figure__pose" data-pose={name}>
          <Image
            src={`/images/mascot/toon/${name}.png`}
            alt=""
            {...CANVAS}
            sizes={sizes}
            draggable={false}
          />
          {name === "wave" && (
            <Image
              src="/images/mascot/toon/wave-arm.png"
              alt=""
              {...CANVAS}
              sizes={sizes}
              draggable={false}
              className="echo-figure__arm"
            />
          )}
        </span>
      ))}
    </span>
  );
}
