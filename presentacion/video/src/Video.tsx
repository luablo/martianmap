// MARSWALK · video demo de 30 s (Space Apps 2026). Guion: ../video-script-en.md
// Imágenes: capturas reales de la app en inglés (capturar-en.mjs) + ortofoto HiRISE de Gale.
// El astronauta está dibujado con SVG en este archivo (no es imagen generada con IA).
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const TOTAL_FRAMES = 885; // 29.5 s

const C = {
  bg: "#0b1016",
  panel: "rgba(14,20,28,0.92)",
  teal: "#2dd4bf",
  amber: "#f5b942",
  red: "#f0505a",
  text: "#f2f5f8",
  dim: "#9aa6b2",
  mars: "#c4562d",
};
const FONT = "'Segoe UI', 'Inter', system-ui, sans-serif";
const MONO = "'Cascadia Mono', 'Consolas', monospace";

// ── Utilidades ──────────────────────────────────────────────────────────────
type Box = { x: number; y: number; w: number };

/** Muestra la región `from`→`to` de una captura de 1920×1080 a pantalla completa (zoom de cámara). */
const Shot: React.FC<{ src: string; from: Box; to?: Box; dur: number; dim?: number }> = ({ src, from, to, dur, dim = 0 }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const b = to ?? from;
  const x = from.x + (b.x - from.x) * t;
  const y = from.y + (b.y - from.y) * t;
  const w = from.w + (b.w - from.w) * t;
  const s = 1920 / w;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.bg }}>
      <Img
        src={staticFile(`shots/${src}.png`)}
        style={{ position: "absolute", width: 1920, height: 1080, transformOrigin: "0 0", transform: `scale(${s}) translate(${-x}px, ${-y}px)` }}
      />
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(5,8,12,${dim})` }} />}
    </AbsoluteFill>
  );
};

/** Recorte ampliado de una captura que entra con un muelle (para resaltar una parte de la interfaz). */
const Callout: React.FC<{
  src: string;
  crop: { x: number; y: number; w: number; h: number };
  at: { x: number; y: number };
  scale: number;
  delay?: number;
  label?: string;
  color?: string;
}> = ({ src, crop, at, scale, delay = 0, label, color = C.teal }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <div
      style={{
        position: "absolute",
        left: at.x,
        top: at.y,
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`,
        transformOrigin: "center",
      }}
    >
      {label && (
        <div style={{ display: "inline-block", font: `700 22px ${MONO}`, color, letterSpacing: 3, marginBottom: 10, padding: "6px 14px", borderRadius: 8, background: "rgba(5,8,12,0.9)" }}>{label}</div>
      )}
      <div
        style={{
          width: crop.w * scale,
          height: crop.h * scale,
          overflow: "hidden",
          borderRadius: 18,
          border: `3px solid ${color}`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 30px ${color}55`,
          position: "relative",
        }}
      >
        <Img
          src={staticFile(`shots/${src}.png`)}
          style={{ position: "absolute", width: 1920, height: 1080, transformOrigin: "0 0", transform: `scale(${scale}) translate(${-crop.x}px, ${-crop.y}px)` }}
        />
      </div>
    </div>
  );
};

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; dur?: number; style?: React.CSSProperties }> = ({
  children,
  delay = 0,
  dur = 12,
  style,
}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ opacity: o, transform: `translateY(${(1 - o) * 16}px)`, ...style }}>{children}</div>;
};

/** Fundido a negro corto al principio y al final de cada escena. */
const Fade: React.FC<{ dur: number; children: React.ReactNode; inF?: number; outF?: number }> = ({ dur, children, inF = 6, outF = 6 }) => {
  const f = useCurrentFrame();
  const o = Math.min(
    inF ? interpolate(f, [0, inF], [0, 1], { extrapolateRight: "clamp" }) : 1,
    outF ? interpolate(f, [dur - outF, dur], [1, 0], { extrapolateLeft: "clamp" }) : 1,
  );
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Chip: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.teal }) => (
  <span
    style={{
      display: "inline-block",
      padding: "10px 20px",
      borderRadius: 12,
      border: `2px solid ${color}`,
      background: "rgba(8,12,18,0.85)",
      color,
      font: `700 26px ${MONO}`,
      letterSpacing: 2,
      marginRight: 14,
    }}
  >
    {children}
  </span>
);

const TalkCtx = React.createContext(false);

// ── Astronauta (SVG propio) ─────────────────────────────────────────────────
const Astronaut: React.FC<{ calm?: boolean }> = ({ calm = false }) => {
  const f = useCurrentFrame();
  const talking = React.useContext(TalkCtx);
  const glow = talking ? 0.25 + 0.35 * Math.abs(Math.sin(f / 2.3)) * (0.6 + 0.4 * Math.sin(f / 5.1)) : 0;
  // Gira la cabeza a un lado y a otro: no sabe hacia dónde ir.
  const look = calm ? Math.sin(f / 30) * 3 : Math.sin(f / 14) * 9;
  const bob = Math.sin(f / 22) * 4;
  return (
    <svg width="600" height="760" viewBox="-20 0 300 380" style={{ transform: `translateY(${bob}px)` }}>
      <defs>
        <linearGradient id="suit" x1="0" x2="1">
          <stop offset="0" stopColor="#e9edf1" />
          <stop offset="1" stopColor="#b9c2cc" />
        </linearGradient>
        <linearGradient id="visor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f5b942" />
          <stop offset="0.5" stopColor="#c4562d" />
          <stop offset="1" stopColor="#3a1a12" />
        </linearGradient>
      </defs>
      {/* sombra */}
      <ellipse cx="130" cy="368" rx="80" ry="10" fill="rgba(0,0,0,0.45)" />
      {/* mochila */}
      <rect x="62" y="118" width="136" height="120" rx="18" fill="#9aa4ae" />
      {/* piernas */}
      <rect x="84" y="250" width="40" height="110" rx="16" fill="url(#suit)" />
      <rect x="136" y="250" width="40" height="110" rx="16" fill="url(#suit)" />
      <rect x="80" y="338" width="48" height="24" rx="10" fill="#6b7580" />
      <rect x="132" y="338" width="48" height="24" rx="10" fill="#6b7580" />
      {/* torso */}
      <rect x="72" y="128" width="116" height="140" rx="30" fill="url(#suit)" />
      <rect x="104" y="170" width="52" height="34" rx="6" fill="#5f6b77" />
      <circle cx="116" cy="187" r="5" fill={C.teal} />
      <circle cx="132" cy="187" r="5" fill={C.amber} />
      <circle cx="146" cy="187" r="5" fill={C.red} />
      {/* brazos: uno con la tablet de antebrazo */}
      <rect x="40" y="140" width="36" height="110" rx="16" fill="url(#suit)" transform="rotate(10 58 140)" />
      <g transform={`rotate(${-35 + Math.sin(f / 18) * 4} 202 140)`}>
        <rect x="184" y="140" width="36" height="104" rx="16" fill="url(#suit)" />
        <rect x="178" y="214" width="48" height="34" rx="6" fill="#1b2430" stroke={C.teal} strokeWidth="3" />
        <text x="202" y="237" textAnchor="middle" fontFamily="Consolas" fontWeight="700" fontSize="18" fill={calm ? C.teal : C.red}>
          {calm ? "✓" : "?"}
        </text>
      </g>
      {/* casco */}
      <g transform={`rotate(${look} 130 92)`}>
        <circle cx="130" cy="80" r="56" fill="url(#suit)" />
        <rect x="88" y="52" width="84" height="56" rx="26" fill="url(#visor)" />
        <path d="M98 64 Q112 56 128 58" stroke="rgba(255,255,255,0.7)" strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="88" y="52" width="84" height="56" rx="26" fill="#7ff5e6" opacity={glow} />
        {talking && (
          <g stroke={C.teal} strokeWidth="5" fill="none" strokeLinecap="round" opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 4))}>
            <path d="M194 62 Q204 80 194 98" />
            <path d="M208 50 Q224 80 208 110" />
          </g>
        )}
      </g>
    </svg>
  );
};

// ── Escenas ─────────────────────────────────────────────────────────────────
const S1Lost: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, 168], [1.15, 1.32]);
  const spin = Math.sin(f / 10) * 120 + f * 2;
  const blink = Math.floor(f / 10) % 2 === 0;
  return (
    <Fade dur={168} inF={10}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={staticFile("ortho.webp")}
          style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%", transform: `scale(${z})`, filter: "sepia(0.85) saturate(2.2) hue-rotate(-12deg) brightness(0.62) contrast(1.15)" }}
        />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 60% 55%, transparent 30%, rgba(0,0,0,0.75) 100%)" }} />
      </AbsoluteFill>
      {/* Equipo y reto (0:00–0:02 de la guía) */}
      <div style={{ position: "absolute", left: 90, top: 80 }}>
        <FadeIn delay={4}>
          <div style={{ font: `800 64px ${FONT}`, color: C.text, letterSpacing: 2, textShadow: "0 4px 18px #000" }}>TEAM BITSTRONAUTS</div>
        </FadeIn>
        <FadeIn delay={12}>
          <div style={{ font: `500 28px ${FONT}`, color: C.dim, marginTop: 8, textShadow: "0 2px 10px #000" }}>
            Julieta · Fernanda · Julio · Luis
          </div>
        </FadeIn>
        <FadeIn delay={22}>
          <div style={{ marginTop: 26 }}>
            <Chip color={C.amber}>CHALLENGE · INTERPLANETARY SURVIVAL GUIDE: MARTIAN MAP</Chip>
          </div>
        </FadeIn>
      </div>
      {/* Astronauta perdido */}
      <div style={{ position: "absolute", left: 1180, top: 250 }}>
        <Astronaut />
      </div>
      {/* Brújula que no sabe hacia dónde apuntar */}
      <FadeIn delay={30} style={{ position: "absolute", left: 110, top: 470 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div style={{ width: 210, height: 210, borderRadius: "50%", border: `4px solid ${C.teal}`, position: "relative", background: "rgba(5,10,14,0.6)" }}>
            {["N", "E", "S", "W"].map((d, i) => (
              <div
                key={d}
                style={{
                  position: "absolute",
                  left: 105 + Math.sin((i * Math.PI) / 2) * 80 - 12,
                  top: 105 - Math.cos((i * Math.PI) / 2) * 80 - 16,
                  font: `700 26px ${MONO}`,
                  color: C.dim,
                }}
              >
                {d}
              </div>
            ))}
            <div style={{ position: "absolute", left: 101, top: 30, width: 8, height: 150, transformOrigin: "4px 75px", transform: `rotate(${spin}deg)` }}>
              <div style={{ height: 75, background: C.red, borderRadius: 4 }} />
              <div style={{ height: 75, background: C.text, borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ font: `700 30px ${MONO}`, color: C.text, lineHeight: 1.7, textShadow: "0 2px 10px #000" }}>
            <div>SOL 412 · EVA 07</div>
            <div>
              TARGET <span style={{ color: C.teal }}>BOXWORK B-4</span> · 2.4 km
            </div>
            <div style={{ color: C.red, opacity: blink ? 1 : 0.35 }}>DIRECTION: ???</div>
          </div>
        </div>
      </FadeIn>
      <div style={{ position: "absolute", left: 90, bottom: 150, font: `400 18px ${FONT}`, color: "rgba(255,255,255,0.6)" }}>
        Real HiRISE image of Gale crater · NASA/JPL-Caltech/Univ. of Arizona
      </div>
    </Fade>
  );
};

const S2Problem: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, 87], [1.6, 0.55], { easing: Easing.inOut(Easing.cubic), extrapolateRight: "clamp" });
  const blur = interpolate(f, [30, 80], [0, 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={87}>
        <Fade dur={87}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <Img
              src={staticFile("ortho.webp")}
              style={{ height: 1080, transform: `scale(${z}) rotate(-8deg)`, filter: `blur(${blur}px) grayscale(0.3) brightness(0.8)` }}
            />
          </AbsoluteFill>
          <div style={{ position: "absolute", left: 90, top: 380 }}>
            <FadeIn delay={6}>
              <div style={{ font: `800 76px ${FONT}`, color: C.text, textShadow: "0 4px 20px #000" }}>Orbital maps</div>
            </FadeIn>
            <FadeIn delay={22}>
              <div style={{ font: `800 76px ${FONT}`, color: C.red, textShadow: "0 4px 20px #000" }}>≠ walking maps</div>
            </FadeIn>
          </div>
        </Fade>
      </Sequence>
      <Sequence from={87} durationInFrames={57}>
        <Fade dur={57} outF={4}>
          <Shot src="B-route" from={{ x: 0, y: 85, w: 1650 }} to={{ x: 60, y: 120, w: 1500 }} dur={57} dim={0.62} />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <FadeIn>
              <div style={{ font: `900 150px ${FONT}`, color: C.text, letterSpacing: 10, textShadow: `0 0 40px ${C.teal}88` }}>MARSWALK</div>
            </FadeIn>
            <FadeIn delay={8}>
              <div style={{ font: `500 44px ${FONT}`, color: C.teal, marginTop: 10 }}>The safe path across Mars, one tap away</div>
            </FadeIn>
          </AbsoluteFill>
        </Fade>
      </Sequence>
    </AbsoluteFill>
  );
};

const MAP: Box = { x: 0, y: 85, w: 1650 };

const S3Route: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={48}>
      <Fade dur={48} outF={0}>
        <Shot src="A-search" from={{ x: 0, y: 0, w: 1100 }} to={{ x: 0, y: 0, w: 960 }} dur={48} />
      </Fade>
    </Sequence>
    <Sequence from={48} durationInFrames={66}>
      <Fade dur={66} inF={0}>
        <Shot src="B-route" from={{ x: 300, y: 60, w: 1300 }} to={MAP} dur={66} />
        <FadeIn delay={6} style={{ position: "absolute", left: 60, top: 60 }}>
          <Chip>NASA HiRISE</Chip>
          <Chip color={C.amber}>MSL RAD</Chip>
          <Chip color="#8fb8ff">MSL REMS</Chip>
        </FadeIn>
      </Fade>
    </Sequence>
  </AbsoluteFill>
);

const METRICS = { x: 12, y: 945, w: 1490, h: 100 };
const MODES = { x: 1655, y: 170, w: 252, h: 220 };

const S4Modes: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={42}>
      <Fade dur={42} outF={0}>
        <Shot src="C1-foot" from={MAP} dur={42} dim={0.55} />
        <Callout src="C1-foot" crop={MODES} at={{ x: 1320, y: 90 }} scale={2} label="MODE" />
        <Callout src="C1-foot" crop={METRICS} at={{ x: 120, y: 560 }} scale={1.12} delay={4} label="ON FOOT · RISK HIGH" color={C.red} />
      </Fade>
    </Sequence>
    <Sequence from={42} durationInFrames={62}>
      <Fade dur={62} inF={0} outF={0}>
        <Shot src="C2-rover" from={MAP} dur={62} dim={0.55} />
        <Callout src="C2-rover" crop={MODES} at={{ x: 1320, y: 90 }} scale={2} label="MODE" />
        <Callout src="C2-rover" crop={METRICS} at={{ x: 120, y: 560 }} scale={1.12} delay={2} label="OPEN ROVER · RISK MEDIUM" color={C.amber} />
      </Fade>
    </Sequence>
    <Sequence from={104} durationInFrames={94}>
      <Fade dur={94} inF={0}>
        <Shot src="D-radiation" from={MAP} to={{ x: 700, y: 85, w: 940 }} dur={94} dim={0.3} />
        <Callout src="D-radiation" crop={{ x: 12, y: 190, w: 240, h: 120 }} at={{ x: 80, y: 90 }} scale={2} label="LAYERS" delay={4} />
        <Callout src="D-radiation" crop={{ x: 860, y: 950, w: 640, h: 90 }} at={{ x: 80, y: 520 }} scale={1.6} label="SLOPE · DOSE · OXYGEN" color={C.amber} delay={20} />
      </Fade>
    </Sequence>
  </AbsoluteFill>
);

const S5Notes: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={48}>
      <Fade dur={48} outF={0}>
        <Shot src="E1-note-card" from={{ x: 700, y: 60, w: 1220 }} to={{ x: 900, y: 70, w: 1020 }} dur={48} />
      </Fade>
    </Sequence>
    <Sequence from={48} durationInFrames={48}>
      <Fade dur={48} inF={0}>
        <Shot src="E2-note-saved" from={{ x: 600, y: 300, w: 1040 }} dur={48} dim={0.55} />
        <Callout src="E2-note-saved" crop={{ x: 1662, y: 440, w: 240, h: 108 }} at={{ x: 520, y: 200 }} scale={3.2} label="FIELD NOTE · SHARED WITH THE CREW" />
      </Fade>
    </Sequence>
  </AbsoluteFill>
);

const S6Future: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shrink = interpolate(f, [0, 40], [1, 0.13], { easing: Easing.inOut(Easing.cubic), extrapolateRight: "clamp" });
  const globe = spring({ frame: f - 18, fps, config: { damping: 18 } });
  const pins = [
    { x: -150, y: -60 },
    { x: 120, y: -150 },
    { x: 170, y: 90 },
    { x: -60, y: 170 },
    { x: -200, y: 110 },
  ];
  return (
    <Fade dur={108} outF={8}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #1a1010 0%, #050608 70%)" }} />
      {/* Marte estilizado */}
      <div
        style={{
          position: "absolute",
          left: 960 - 330,
          top: 500 - 330,
          width: 660,
          height: 660,
          borderRadius: "50%",
          opacity: globe,
          transform: `scale(${0.8 + 0.2 * globe})`,
          background: "radial-gradient(circle at 35% 30%, #e8834f 0%, #c4562d 40%, #7a2c14 75%, #2a0f08 100%)",
          boxShadow: "0 0 80px rgba(196,86,45,0.45)",
        }}
      />
      {/* La captura se encoge hasta ser un punto: Gale */}
      <div
        style={{
          position: "absolute",
          left: 960 - 960 * shrink,
          top: 500 - 540 * shrink,
          width: 1920 * shrink,
          height: 1080 * shrink,
          overflow: "hidden",
          borderRadius: 24 * (1 - shrink) + 8,
          border: `${shrink < 0.9 ? 3 : 0}px solid ${C.teal}`,
          boxShadow: `0 0 30px ${C.teal}88`,
        }}
      >
        <Img src={staticFile("shots/B-route.png")} style={{ position: "absolute", width: `${(1920 / 1650) * 100}%`, left: 0, top: `${(-85 / 928) * 100}%` }} />
      </div>
      <FadeIn delay={30} style={{ position: "absolute", left: 960 + 170, top: 470, font: `700 30px ${MONO}`, color: C.teal }}>
        GALE CRATER · TODAY
      </FadeIn>
      {pins.map((p, i) => {
        const s = spring({ frame: f - 50 - i * 6, fps, config: { damping: 10 } });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 960 + p.x - 14,
              top: 500 + p.y - 14,
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: C.amber,
              border: "4px solid #fff",
              transform: `scale(${s})`,
              boxShadow: `0 0 20px ${C.amber}`,
            }}
          />
        );
      })}
    </Fade>
  );
};

const S7End: React.FC = () => (
  <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
    <FadeIn dur={10}>
      <div style={{ font: `900 140px ${FONT}`, color: C.text, letterSpacing: 10 }}>MARSWALK</div>
      <div style={{ font: `500 40px ${FONT}`, color: C.teal, marginTop: 6 }}>The safe path across Mars, one tap away</div>
      <div style={{ font: `700 38px ${MONO}`, color: C.text, marginTop: 50 }}>martianmap-rosy.vercel.app</div>
      <div style={{ font: `500 28px ${FONT}`, color: C.dim, marginTop: 24 }}>Team Bitstronauts · NASA Space Apps Challenge 2026</div>
    </FadeIn>
  </AbsoluteFill>
);

// ── Subtítulos (obligatorios en inglés) y voz de cada versión ───────────────
type Sub = [number, number, string];
type Version = { vo: [number, string, number][]; subs: Sub[]; narrator: boolean; silent?: boolean; ownVoice?: boolean; talk?: [number, number][] };

// v1: narrador + frase de radio del astronauta.  [inicio, archivo, duración en frames]
const V1: Version = {
  narrator: false,
  vo: [
    [12, "vo/v1.wav", 150],
    [174, "vo/v2.wav", 133],
    [318, "vo/v3.wav", 92],
    [426, "vo/v4.wav", 194],
    [636, "vo/v5.wav", 53],
    [720, "vo/v6.wav", 108],
  ],
  subs: [
    [12, 166, "Sol 412. My target is 2.4 km away… but which way?"],
    [174, 310, "Mars maps show the planet from orbit, not how to walk it. So we built MARSWALK."],
    [318, 420, "Pick a target, and it draws the safest route over real NASA terrain."],
    [426, 500, "Too far on foot? Take the rover."],
    [500, 624, "Slope, radiation, oxygen: see the danger before you step."],
    [636, 712, "Every finding stays on the map for the crew."],
    [720, 828, "Today, Gale crater. Tomorrow, every walk on Mars."],
  ],
};

// v2: el astronauta lo cuenta todo en primera persona (voz de radio del casco).
const V2: Version = {
  narrator: true,
  vo: [
    [6, "vo2/v1.wav", 187],
    [200, "vo2/v2.wav", 98],
    [318, "vo2/v3.wav", 97],
    [426, "vo2/v4.wav", 196],
    [636, "vo2/v5.wav", 57],
    [720, "vo2/v6.wav", 105],
  ],
  subs: [
    [6, 196, "Sol 412. I'm on Mars. My target is 2.4 km away… but which way?"],
    [200, 310, "Orbital maps don't show me how to walk. So I open MARSWALK."],
    [318, 420, "I pick my target, and it draws the safest route over real NASA terrain."],
    [426, 500, "Too far on foot? I take the rover."],
    [500, 624, "Slope, radiation, oxygen: I see the danger before I step."],
    [636, 712, "Everything I find stays on the map for my crew."],
    [720, 828, "Today, Gale crater. Tomorrow, every walk on Mars."],
  ],
};

const Subtitles: React.FC<{ subs: Sub[]; narrow: boolean }> = ({ subs, narrow }) => {
  const f = useCurrentFrame();
  const cur = subs.find(([a, b]) => f >= a && f < b);
  if (!cur) return null;
  return (
    <div style={{ position: "absolute", left: narrow ? 300 : 0, right: narrow ? 300 : 0, bottom: 56, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: 1500,
          padding: "14px 30px",
          borderRadius: 14,
          background: "rgba(0,0,0,0.78)",
          color: "#fff",
          font: `700 42px ${FONT}`,
          textAlign: "center",
          lineHeight: 1.25,
        }}
      >
        {cur[2]}
      </div>
    </div>
  );
};

/** El astronauta en una ventana de radio abajo a la derecha, hablando mientras se ve la app. */
const NarratorPip: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const talking = React.useContext(TalkCtx);
  const p = spring({ frame: f, fps, config: { damping: 15 } });
  return (
    <div style={{ position: "absolute", right: 30, bottom: 30, opacity: p, transform: `translateY(${(1 - p) * 60}px)` }}>
      <div
        style={{
          width: 270,
          height: 330,
          borderRadius: 26,
          overflow: "hidden",
          position: "relative",
          border: `3px solid ${talking ? C.teal : "rgba(45,212,191,0.4)"}`,
          boxShadow: `0 16px 50px rgba(0,0,0,0.7)${talking ? `, 0 0 28px ${C.teal}77` : ""}`,
          background: "radial-gradient(circle at 50% 30%, #5a2a18 0%, #1a0d08 80%)",
        }}
      >
        <div style={{ position: "absolute", left: -32, top: 6, transform: "scale(0.56)", transformOrigin: "0 0" }}>
          <Astronaut calm />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "8px 12px",
            background: "rgba(5,8,12,0.88)",
            font: `700 18px ${MONO}`,
            color: C.text,
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: 6, background: talking ? C.red : C.dim, opacity: talking && Math.floor(f / 8) % 2 ? 0.4 : 1 }} />
          EVA 07 · ASTRONAUT
        </div>
      </div>
    </div>
  );
};

// ── Composición ─────────────────────────────────────────────────────────────
const Movie: React.FC<{ v: Version }> = ({ v }) => {
  const f = useCurrentFrame();
  const talking = v.talk ? v.talk.some(([a, b]) => f >= a && f < b) : v.vo.some(([at, , len]) => f >= at && f < at + len);
  return (
    <TalkCtx.Provider value={talking}>
      <AbsoluteFill style={{ background: C.bg }}>
        <Sequence durationInFrames={168}>
          <S1Lost />
        </Sequence>
        <Sequence from={168} durationInFrames={144}>
          <S2Problem />
        </Sequence>
        <Sequence from={312} durationInFrames={114}>
          <S3Route />
        </Sequence>
        <Sequence from={426} durationInFrames={198}>
          <S4Modes />
        </Sequence>
        <Sequence from={624} durationInFrames={96}>
          <S5Notes />
        </Sequence>
        <Sequence from={720} durationInFrames={108}>
          <S6Future />
        </Sequence>
        <Sequence from={828} durationInFrames={TOTAL_FRAMES - 828}>
          <S7End />
        </Sequence>

        {v.narrator && (
          <Sequence from={172} durationInFrames={828 - 172}>
            <NarratorPip />
          </Sequence>
        )}

        <Subtitles subs={v.subs} narrow={v.narrator && f >= 172 && f < 828} />

        {/* Marca de agua de IA (regla de Space Apps 2026): visible en todo el video. */}
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 20,
            padding: "6px 14px",
            borderRadius: 8,
            background: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.25)",
            font: `600 20px ${FONT}`,
            letterSpacing: 0.5,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          Generated with AI assistance
        </div>

        {!v.silent && !v.ownVoice && (<div
          style={{
            position: "absolute",
            right: 24,
            ...(v.narrator ? { top: 14 } : { bottom: 14 }),
            font: `400 16px ${FONT}`,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          Synthetic voice (text-to-speech)
        </div>)}

        {!v.silent && <Audio src={staticFile("music/drone.wav")} volume={v.ownVoice ? 0.22 : 0.35} />}
        {!v.silent && v.vo.map(([at, src]) => (
          <Sequence key={src} from={at}>
            <Audio src={staticFile(src)} volume={v.ownVoice ? 1 : v.narrator ? 1.2 : 1.6} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </TalkCtx.Provider>
  );
};

export const Marswalk: React.FC = () => <Movie v={V1} />;
export const MarswalkAstronaut: React.FC = () => <Movie v={V2} />;
// Sin audio: el equipo pone su propia voz. El astronauta sigue animándose en los tiempos de los subtítulos.
// v3: la voz grabada por el equipo, cortada por frases y colocada en cada escena.
const V3_SUBS: Sub[] = [
  [9, 183, "Sol 412. I'm on Mars. My target is 2.4 km away… but which way?"],
  [186, 314, "Orbital maps don't show me how to walk. So I open MARSWALK."],
  [322, 455, "I pick my target, and it draws the safest route over real NASA terrain."],
  [457, 513, "Too far on foot? I take the rover."],
  [514, 627, "Slope, radiation, oxygen: I see the danger before I step."],
  [631, 700, "Everything I find stays on the map for my crew."],
  [702, 790, "Today, Gale crater. Tomorrow, every walk on Mars."],
];
const V3: Version = {
  narrator: true,
  ownVoice: true,
  // La grabación completa, tal cual, sin cortes ni filtros (entra en el frame 9).
  vo: [[9, "vo3/grabacion.m4a", 793]],
  subs: V3_SUBS,
  talk: V3_SUBS.map(([a, b]) => [a, b]),
};
export const MarswalkTeamVoice: React.FC = () => <Movie v={V3} />;
export const MarswalkAstronautSilent: React.FC = () => <Movie v={{ ...V2, silent: true }} />;
