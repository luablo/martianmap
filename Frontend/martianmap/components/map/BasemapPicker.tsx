// Dueño: P3 (Mapa). Selector compacto de mapa base.
//
// Responsivo en dos formatos:
//   Teléfono (<sm):  columna de iconos solos (≥56 px táctil), a la DERECHA inferior
//                    para no chocar con la Leyenda.
//   Tablet / hab (≥sm): columna de icono + etiqueta, a la IZQUIERDA inferior.
//   En ambos queda justo encima de la barra de métricas (--ui-bottom, lo mide AppShell).

import React from "react";
import { BASEMAPS, type BasemapId } from "./layers/basemap";

// SVG 18×18 (currentColor). Sin emojis.
const ICON: Record<BasemapId, React.ReactNode> = {
  none: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="4" y1="4" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="4" x2="4" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  viking: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1" y="4" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="9" cy="9.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 4 L7.5 2 H10.5 L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="9" cy="9.5" r="1" fill="currentColor"/>
    </svg>
  ),
  mola: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2 13 Q5 7 9 7 Q13 7 16 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 15 Q6.5 10 9 10 Q11.5 10 14 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6"/>
      <path d="M5.5 11 Q7 7.5 9 6 Q11 4.5 12.5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4"/>
    </svg>
  ),
  mola_hrsc: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2 14 Q5 8 9 8 Q13 8 16 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M3.5 16 Q6 11 9 11 Q12 11 14.5 16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5"/>
      <circle cx="9" cy="4" r="1.5" fill="currentColor" fillOpacity="0.9"/>
      <line x1="6" y1="4" x2="4" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="12" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
};

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
      data-hud="hide" // en modo HUD (P4) se oculta: ver globals.css
      className={[
        // z-10: capa del mapa, debajo de la interfaz de AppShell (z-20).
        "panel pointer-events-auto absolute z-10 overflow-hidden",
        // Justo encima de la barra de métricas: AppShell mide su alto en vivo (--ui-bottom).
        "bottom-[calc(var(--ui-bottom,6.5rem)_+_0.75rem)]",
        // Teléfono: derecha (no choca con la Leyenda, que va a la izquierda)
        "right-[calc(0.75rem_+_env(safe-area-inset-right))]",
        // Tablet: izquierda, debajo de CAPAS
        "sm:right-auto",
        "sm:left-[calc(0.75rem_+_env(safe-area-inset-left))]",
      ].join(" ")}
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
              "relative flex w-full items-center transition-colors",
              "hover:bg-line/60 active:bg-line",
              // Táctil ≥ 56 px (guantes, CONTEXTO §8). Teléfono: solo icono.
              "touch justify-center px-3 sm:justify-start sm:gap-2",
              isActive ? "text-route" : "text-ink-dim",
            ].join(" ")}
          >
            <span className="shrink-0">{ICON[id]}</span>
            {/* Etiqueta: solo visible en tablet+ */}
            <span className={[
              "hidden sm:block font-mono text-[11px] tracking-wide whitespace-nowrap",
              isActive ? "font-semibold" : "",
            ].join(" ")}>
              {def.label}
            </span>
            {/* Punto activo: solo en tablet+ */}
            {isActive && (
              <span className="ml-auto hidden sm:block shrink-0 h-1.5 w-1.5 rounded-full bg-route" aria-hidden />
            )}
            {/* En teléfono, el icono activo lleva punto pequeño superpuesto */}
            {isActive && (
              <span className="sm:hidden absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-route border border-bg-0" aria-hidden />
            )}
          </button>
        );
      })}
    </div>
  );
}
