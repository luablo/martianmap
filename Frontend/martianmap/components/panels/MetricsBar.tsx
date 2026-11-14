"use client";

import { useState } from "react";
import { formatDistance, formatMinutes } from "@/lib/metrics";
import type { Risk, RouteMetrics, TransportMode } from "@/lib/types";

const riskTone: Record<Risk, string> = {
  BAJO: "text-safe",
  MEDIO: "text-warn",
  ALTO: "text-danger",
};

function Metric({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="truncate font-mono text-[11px] tracking-wider text-ink-dim">{label}</div>
      <div className={`truncate font-mono text-xl font-semibold tabular-nums sm:text-2xl ${className}`}>
        {value}
      </div>
    </div>
  );
}

export default function MetricsBar({
  metrics,
  mode,
}: {
  metrics: RouteMetrics | null;
  mode: TransportMode;
}) {
  // En teléfono es una hoja inferior: cerrada muestra lo esencial.
  const [open, setOpen] = useState(false);

  if (!metrics) {
    return (
      <footer className="panel pointer-events-auto flex min-h-14 items-center px-4 text-ink-dim">
        Toca el mapa para marcar un destino.
      </footer>
    );
  }

  const m = metrics;
  return (
    <footer className="panel pointer-events-auto p-3 sm:px-5">
      <div className="flex items-center gap-4">
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-6">
          <Metric label="DISTANCIA" value={formatDistance(m.distanceM)} className="text-route" />
          <Metric label="IDA" value={formatMinutes(m.timeMin)} />
          <Metric label="RIESGO" value={m.risk} className={riskTone[m.risk]} />
          <div className={`contents ${open ? "" : "max-sm:hidden"}`}>
            <Metric
              label="PENDIENTE MÁX"
              value={m.maxSlopeDeg === null ? "—" : `${m.maxSlopeDeg.toFixed(0)}°`}
            />
            <Metric label="DOSIS EST." value={`${m.doseMSv.toFixed(3)} mSv`} className="text-warn" />
            <Metric
              label={mode.resourceLabel.toUpperCase()}
              value={`${m.resourcePct.toFixed(0)} %`}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Ver menos métricas" : "Ver más métricas"}
          className="touch grid shrink-0 place-items-center rounded-xl border border-line text-ink-dim sm:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={open ? "rotate-180" : ""} aria-hidden>
            <path d="m6 15 6-6 6 6" />
          </svg>
        </button>
      </div>
      <p className="mt-2 font-mono text-[11px] text-warn">
        LÍNEA RECTA · sin ruteo todavía: no evita pendientes ni zonas prohibidas
      </p>
    </footer>
  );
}
