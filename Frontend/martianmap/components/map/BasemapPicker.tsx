// Dueño: P3 (Mapa). Selector compacto de mapa base (esquina inferior izquierda).
// SVG inline propios — sin emojis (renderizado inconsistente entre SO y navegadores).

import { BASEMAPS, type BasemapId } from "./layers/basemap";

// SVG 18×18 representativo de cada capa. Todos tienen currentColor como stroke/fill.
const ICON: Record<BasemapId, React.ReactNode> = {
  none: (
    // Cuadrado vacío con X: "sin mapa base"
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="4" y1="4" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="4" x2="4" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  viking: (
    // Cámara/foto: imagen fotográfica real
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1" y="4" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="9" cy="9.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 4 L7.5 2 H10.5 L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="9" cy="9.5" r="1" fill="currentColor"/>
    </svg>
  ),
  mola: (
    // Curvas de nivel / topografía: relieve
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2 13 Q5 7 9 7 Q13 7 16 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M4 15 Q6.5 10 9 10 Q11.5 10 14 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6" fill="none"/>
      <path d="M5.5 11 Q7 7.5 9 6 Q11 4.5 12.5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4" fill="none"/>
    </svg>
  ),
  mola_hrsc: (
    // Curvas de nivel más densa + satélite encima: MOLA + datos orbitales
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2 14 Q5 8 9 8 Q13 8 16 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M3.5 16 Q6 11 9 11 Q12 11 14.5 16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" fill="none"/>
      {/* satélite */}
      <circle cx="9" cy="4" r="1.5" fill="currentColor" fillOpacity="0.9"/>
      <line x1="6" y1="4" x2="4" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="12" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="9" y1="1.5" x2="9" y2="2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
};

import React from "react";

export default function BasemapPicker({
  active,
  onChange,
}: {
  active: BasemapId;
  onChange: (id: BasemapId) => void;
}) {
  const ids = Object.keys(BASEMAPS) as BasemapId[];

  return (
    <div
      className="panel pointer-events-auto absolute z-10 overflow-hidden"
      style={{
        bottom: "calc(6.5rem + env(safe-area-inset-bottom))",
        left: "calc(0.75rem + env(safe-area-inset-left))",
      }}
    >
      {ids.map((id) => {
        const def = BASEMAPS[id];
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            title={def.description}
            aria-pressed={isActive}
            onClick={() => onChange(id)}
            className={[
              "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
              "hover:bg-line/60 active:bg-line",
              isActive ? "text-route" : "text-ink-dim",
            ].join(" ")}
          >
            <span className="shrink-0">{ICON[id]}</span>
            <span className={`font-mono text-[11px] tracking-wide whitespace-nowrap ${isActive ? "font-semibold" : ""}`}>
              {def.label}
            </span>
            {isActive && (
              <span className="ml-auto shrink-0 h-1.5 w-1.5 rounded-full bg-route" aria-hidden />
            )}
          </button>
        );
      })}
    </div>
  );
}
