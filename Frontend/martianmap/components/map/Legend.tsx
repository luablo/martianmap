// Dueño: P3 (Mapa). Leyenda de las capas activas, esquina inferior derecha sobre el mapa.
//
// Solo muestra las capas encendidas (prop `layers`) Y con datos disponibles
// (layerAvailable). Cada fila: muestra de color + etiqueta + fuente + proveniencia
// (MEDIDO/DERIVADO/ESTIMADO). Nunca solo color: el color va con texto (CONTEXTO §8,
// para daltonismo y visor empañado). pointer-events-none para no bloquear el mapa.

import { LAYERS, layerAvailable } from "@/lib/layers";
import type { LayerId, Provenance, ZoneData } from "@/lib/types";

// Muestra representativa de cada capa (cómo se ve en el mapa).
const SWATCH: Record<LayerId, string> = {
  ortho: "linear-gradient(135deg, #9ca3af, #4b5563)", // foto en gris de HiRISE
  slope: "linear-gradient(90deg, rgba(251,191,36,0) 0%, #fbbf24 45%, #ef4444 100%)", // semáforo
  radiation: "linear-gradient(90deg, #2dd4bf, #fbbf24)", // ruta turquesa→ámbar por dosis
  thermal: "linear-gradient(90deg, #38bdf8, #fbbf24)", // frío→cálido (inercia térmica)
  mineral: "linear-gradient(135deg, #a78bfa, #38bdf8)", // ciencia
};

// Color de la etiqueta de proveniencia: verde=medido, azul=derivado, ámbar=estimado.
const PROVENANCE_CLASS: Record<Provenance, string> = {
  MEDIDO: "text-safe",
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
      className={[
        "panel pointer-events-none absolute z-20 p-2.5",
        // Teléfono: izquierda inferior, estrecha
        "left-[calc(0.75rem_+_env(safe-area-inset-left))]",
        "bottom-[calc(5rem_+_env(safe-area-inset-bottom))]",
        "w-36",
        // Tablet: derecha inferior, más ancha, más margen (MetricsBar expandido ~9rem)
        "sm:left-auto",
        "sm:right-[calc(0.75rem_+_env(safe-area-inset-right))]",
        "sm:bottom-[calc(9rem_+_env(safe-area-inset-bottom))]",
        "sm:w-44",
      ].join(" ")}
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
                <span
                  className={`font-mono text-[10px] font-semibold ${PROVENANCE_CLASS[l.provenance]}`}
                >
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
