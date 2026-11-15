"use client";
// Dueño: P4. Panel de capas de misión + selector de mapa base.
// Las dos secciones van juntas: "qué se ve" en un solo lugar.

import Chip from "@/components/ui/Chip";
import Toggle from "@/components/ui/Toggle";
import { LAYERS, layerAvailable } from "@/lib/layers";
import type { LayerId, Provenance, ZoneData } from "@/lib/types";
import { BASEMAPS, type BasemapId } from "@/components/map/layers/basemap";

const tone: Record<Provenance, "safe" | "info" | "warn"> = {
  MEDIDO: "safe",
  DERIVADO: "info",
  ESTIMADO: "warn",
};

// Icono SVG 16×16 para cada mapa base (currentColor).
function BasemapIcon({ id }: { id: BasemapId }) {
  if (id === "none")
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="12.5" y1="3.5" x2="3.5" y2="12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    );
  if (id === "viking")
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="3.5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="8" cy="8" r="0.9" fill="currentColor"/>
        <path d="M5.5 3.5L6.5 2H9.5L10.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    );
  if (id === "mola")
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M1.5 11.5 Q4.5 6.5 8 6.5 Q11.5 6.5 14.5 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M3 13.5 Q5.5 9 8 9 Q10.5 9 13 13.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.55"/>
        <path d="M4.5 10 Q6 7 8 5.5 Q10 4 11.5 6.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.35"/>
      </svg>
    );
  // mola_hrsc
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M1.5 12 Q4.5 7 8 7 Q11.5 7 14.5 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M3 14 Q5.5 9.5 8 9.5 Q10.5 9.5 13 14" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeOpacity="0.5"/>
      <circle cx="8" cy="3.5" r="1.4" fill="currentColor" fillOpacity="0.85"/>
      <line x1="8" y1="2" x2="8" y2="2.1" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
      <line x1="5.5" y1="3.5" x2="3.5" y2="3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="10.5" y1="3.5" x2="12.5" y2="3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  );
}

export default function LayerToggles({
  zone,
  active,
  onChange,
  basemapId,
  onBasemapChange,
}: {
  zone: ZoneData | null;
  active: Record<LayerId, boolean>;
  onChange: (id: LayerId, on: boolean) => void;
  basemapId?: BasemapId;
  onBasemapChange?: (id: BasemapId) => void;
}) {
  const basemapIds = Object.keys(BASEMAPS) as BasemapId[];

  return (
    <div className="flex flex-col">
      {/* ── Capas de misión ─────────────────────────── */}
      <div className="flex flex-col gap-0.5 pb-1">
        {LAYERS.map((l) => {
          const available = layerAvailable(zone, l.id);
          return (
            <Toggle
              key={l.id}
              checked={available && active[l.id]}
              disabled={!available}
              onChange={(v) => onChange(l.id, v)}
            >
              <span className="block truncate text-sm font-semibold">{l.label}</span>
              <span className="mt-0.5 flex items-center gap-1.5">
                {available ? (
                  <Chip tone={tone[l.provenance]}>{l.provenance}</Chip>
                ) : (
                  <Chip>SIN DATOS</Chip>
                )}
                <span className="truncate font-mono text-[11px] text-ink-dim">{l.source}</span>
              </span>
            </Toggle>
          );
        })}
      </div>

      {/* ── Mapa base ──────────────────────────────── */}
      {basemapId !== undefined && onBasemapChange && (
        <>
          <div className="mx-3 my-1 border-t border-line" />
          <p className="px-3 pb-1 pt-1.5 font-mono text-[10px] font-semibold tracking-widest text-ink-dim">
            MAPA BASE
          </p>
          <div className="flex flex-col gap-0.5 pb-1.5">
            {basemapIds.map((id) => {
              const def = BASEMAPS[id];
              const isActive = basemapId === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={isActive}
                  title={def.description}
                  onClick={() => onBasemapChange(id)}
                  className={[
                    "touch flex w-full items-center gap-3 rounded-xl px-3 text-left",
                    "transition-colors duration-150 active:bg-line/60",
                    isActive ? "text-route" : "text-ink-dim",
                  ].join(" ")}
                >
                  {/* Radio indicator */}
                  <span
                    className={[
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      "transition-colors duration-150",
                      // Inactivo con ink-dim: con border-line el círculo no se distinguía del panel
                    isActive ? "border-route bg-route/15" : "border-ink-dim/60",
                    ].join(" ")}
                    aria-hidden
                  >
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-route" />
                    )}
                  </span>
                  {/* Icono */}
                  <span className="shrink-0"><BasemapIcon id={id} /></span>
                  {/* Texto */}
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm ${isActive ? "font-semibold" : ""}`}>
                      {def.label}
                    </span>
                    <span className="block truncate font-mono text-[10px] text-ink-dim">
                      {def.description.split("—")[0].trim()}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
