import { voicePath } from "@/lib/motion/voice";

interface StageIllustrationProps {
  /** Lights up the reserved chair and writes it on the tag. */
  guestName: string;
  className?: string;
}

/** Drawn once: the voice leaving the microphone (the Voice Line, docs/IMPLEMENTATION_PLAN.md §1.2). */
const VOICE = voicePath({ width: 380, height: 96, amplitude: 0.85, phase: 0.6, samples: 140 });

const FRONT_ROW = [120, 210, 390, 480, 570, 660];
const BACK_ROW = [70, 180, 290, 400, 510, 620, 730];
const RESERVED_X = 300;

/** The back of a chair, centred on `x`, its top at `y`. */
function chairBack(x: number, y: number, width: number, height: number): string {
  const left = x - width / 2;
  const radius = width * 0.28;
  return [
    `M${left},${y + height}`,
    `V${y + radius}`,
    `Q${left},${y} ${left + radius},${y}`,
    `H${left + width - radius}`,
    `Q${left + width},${y} ${left + width},${y + radius}`,
    `V${y + height}`,
    "Z",
  ].join(" ");
}

const BOKEH = [
  { cx: 92, cy: 210, r: 5, delay: "0s" },
  { cx: 168, cy: 120, r: 3, delay: "-3s" },
  { cx: 455, cy: 170, r: 4, delay: "-6s" },
  { cx: 212, cy: 448, r: 7, delay: "-1.5s" },
  { cx: 520, cy: 470, r: 3, delay: "-4.5s" },
  { cx: 640, cy: 260, r: 6, delay: "-2s" },
  { cx: 60, cy: 520, r: 4, delay: "-7s" },
];

/**
 * Abstract stage art, no people (docs/IMPLEMENTATION_PLAN.md §3.5): the meeting room
 * moments before it starts. A spotlit lectern, the voice leaving the microphone, and
 * one front-row chair that lights up with the guest's name as they fill in the form.
 */
export function StageIllustration({ guestName, className = "" }: StageIllustrationProps) {
  const name = guestName.trim().split(/\s+/)[0] ?? "";
  const reserved = name.length > 0;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 800 720"
      preserveAspectRatio="xMidYMax slice"
      data-reserved={reserved}
      className={`stage-art ${className}`}
    >
      <defs>
        <radialGradient id="stage-sky" cx="38%" cy="18%" r="75%">
          <stop offset="0" style={{ stopColor: "var(--color-tm-blue)" }} stopOpacity="0.55" />
          <stop offset="0.55" style={{ stopColor: "var(--color-ink)" }} stopOpacity="0.2" />
          <stop offset="1" style={{ stopColor: "var(--color-ink)" }} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="stage-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-gold)" }} stopOpacity="0.32" />
          <stop offset="1" style={{ stopColor: "var(--color-gold)" }} stopOpacity="0" />
        </linearGradient>
        <radialGradient id="stage-pool" cx="50%" cy="50%" r="50%">
          <stop offset="0" style={{ stopColor: "var(--color-gold)" }} stopOpacity="0.38" />
          <stop offset="1" style={{ stopColor: "var(--color-gold)" }} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="stage-lectern" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-tm-blue-hover)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-ink)" }} />
        </linearGradient>
        <linearGradient id="stage-voice" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "var(--color-gold)" }} stopOpacity="0.95" />
          <stop offset="1" style={{ stopColor: "var(--color-gold)" }} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="stage-seat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-gold)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-gold)" }} stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="stage-seat-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" style={{ stopColor: "var(--color-gold)" }} stopOpacity="0.55" />
          <stop offset="1" style={{ stopColor: "var(--color-gold)" }} stopOpacity="0" />
        </radialGradient>
        <filter id="stage-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <rect width="800" height="720" fill="var(--color-ink)" />
      <rect width="800" height="720" fill="url(#stage-sky)" />

      {/* The room's acoustics: faint rings around the lectern. */}
      <g fill="none" stroke="var(--color-white)" strokeOpacity="0.06">
        <circle cx="300" cy="430" r="190" />
        <circle cx="300" cy="430" r="290" />
        <circle cx="300" cy="430" r="400" />
      </g>

      <polygon points="272,0 328,0 470,530 130,530" fill="url(#stage-beam)" />
      <ellipse cx="300" cy="526" rx="230" ry="40" fill="url(#stage-pool)" />
      <ellipse
        cx="300"
        cy="526"
        rx="230"
        ry="40"
        fill="none"
        stroke="var(--color-gold)"
        strokeOpacity="0.18"
      />

      {/* Lectern and microphone. */}
      <path d="M236,404 H364 L348,522 H252 Z" fill="url(#stage-lectern)" />
      <path d="M226,392 H374 L364,410 H236 Z" fill="var(--color-tm-blue-hover)" />
      <path d="M226,392 H374" stroke="var(--color-gold)" strokeOpacity="0.7" strokeWidth="1.5" />
      <circle
        cx="300"
        cy="455"
        r="15"
        fill="none"
        stroke="var(--color-gold)"
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
      <circle cx="300" cy="455" r="3" fill="var(--color-gold)" fillOpacity="0.7" />
      <path d="M322,392 C322,380 326,372 334,364" fill="none" stroke="var(--color-gold)" strokeWidth="2.5" />
      <ellipse cx="337" cy="360" rx="6" ry="9" transform="rotate(35 337 360)" fill="var(--color-gold)" />

      <path
        d={VOICE}
        transform="translate(346 312)"
        fill="none"
        stroke="url(#stage-voice)"
        strokeWidth="2"
        strokeLinecap="round"
        className="stage-voice"
      />

      <g fill="var(--color-gold)" filter="url(#stage-blur)">
        {BOKEH.map((dot) => (
          <circle
            key={`${dot.cx}-${dot.cy}`}
            {...dot}
            fillOpacity="0.55"
            className="stage-bokeh"
            style={{ animationDelay: dot.delay }}
          />
        ))}
      </g>

      {/* The audience, seen from behind: two rows of empty chairs. */}
      <g fill="var(--color-surface)" stroke="var(--color-white)" strokeOpacity="0.09">
        {FRONT_ROW.map((x) => (
          <path key={x} d={chairBack(x, 592, 64, 60)} />
        ))}
      </g>
      <g fill="var(--color-surface)" stroke="var(--color-white)" strokeOpacity="0.07">
        {BACK_ROW.map((x) => (
          <path key={x} d={chairBack(x, 652, 84, 90)} />
        ))}
      </g>

      {/* The guest's seat. */}
      <ellipse
        cx={RESERVED_X}
        cy="610"
        rx="90"
        ry="60"
        fill="url(#stage-seat-glow)"
        className="stage-seat-glow"
      />
      <path
        d={chairBack(RESERVED_X, 592, 64, 60)}
        className="stage-seat"
        fill="url(#stage-seat)"
        stroke="var(--color-gold)"
        strokeWidth="1.5"
      />
      <path
        d={chairBack(RESERVED_X, 592, 64, 60)}
        className="stage-seat-empty"
        fill="var(--color-surface)"
        stroke="var(--color-gold)"
        strokeOpacity="0.8"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <foreignObject x={RESERVED_X - 130} y="540" width="260" height="40">
        <div className="flex h-full items-center justify-center">
          <span className="stage-tag bg-ink/80 border-gold/60 rounded-full border px-3.5 py-1.5 text-[15px] leading-none whitespace-nowrap text-white">
            {reserved ? `Reserved for ${name}` : "Your seat"}
          </span>
        </div>
      </foreignObject>
    </svg>
  );
}
