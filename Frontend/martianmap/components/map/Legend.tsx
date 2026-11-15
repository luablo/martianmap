// Dueño: P3 (Mapa). Leyenda de capas activas. Flota sobre el mapa, esquina inferior derecha.
// Se ubica justo encima de la barra de métricas usando --ui-bottom (medido en vivo por AppShell).
// pointer-events-none: no bloquea el mapa.

import { LAYERS, layerAvailable } from "@/lib/layers";
import type { LayerId, Provenance, ZoneData } from "@/lib/types";

const SWATCH: Record<LayerId, string> = {
  ortho:     "linear-gradient(135deg, #9ca3af, #4b5563)",
  slope:     "linear-gradient(90deg, rgba(251,191,36,0) 0%, #fbbf24 45%, #ef4444 100%)",
  radiation: "linear-gradient(90deg, #2dd4bf, #fbbf24)",
  thermal:   "linear-gradient(90deg, #38bdf8, #fbbf24)",
  mineral:   "linear-gradient(135deg, #a78bfa, #38bdf8)",
};

const PROVENANCE_CLASS: Record<Provenance, string> = {
  MEDIDO:   "text-safe",
  DERIVADO: "text-info",
  ESTIMADO: "text-warn",
};

export default function Legend({
  zone,
  layers,
}: {
  zone: ZoneData;
  layers: Record<LayerId, boolean>;
}) {
  const active = LAYERS.filter((l) => layers[l.id] && layerAvailable(zone, l.id));
  if (active.length === 0) return null;

  return (
    <div
      className="panel pointer-events-none absolute z-20 p-2.5 w-36 sm:w-44"
      style={{
        // Esquina inferior derecha, justo encima de la barra de métricas.
        bottom: "calc(var(--ui-bottom, 5rem) + 0.75rem)",
        right: "calc(0.75rem + env(safe-area-inset-right))",
      }}
    >
      <h3 className="mb-1.5 font-mono text-[10px] font-semibold tracking-widest text-ink-dim">
        LEYENDA
      </h3>
      <ul className="flex flex-col gap-1.5">
        {active.map((l) => (
          <li key={l.id} className="flex items-center gap-2">
            <span
              className="h-3 w-5 shrink-0 rounded-sm border border-line"
              style={{ background: SWATCH[l.id] }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-ink">{l.label}</div>
              <div className="flex items-center gap-1">
                <span className={`font-mono text-[10px] font-semibold ${PROVENANCE_CLASS[l.provenance]}`}>
                  {l.provenance}
                </span>
                <span className="truncate font-mono text-[10px] text-ink-dim">{l.source}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
