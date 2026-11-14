"use client";
// Dueño: P4. Barra inferior con las métricas de la ruta. En teléfono es una hoja
// que, cerrada, muestra lo esencial (distancia, tiempo, riesgo).

import { useState } from "react";
import Button from "@/components/ui/Button";
import { formatDistance, formatMinutes } from "@/lib/metrics";
import { RESERVE_PCT } from "@/lib/modes";
import type { Risk, RouteResult, TransportMode } from "@/lib/types";

const riskTone: Record<Risk, string> = {
  BAJO: "text-safe",
  MEDIO: "text-warn",
  ALTO: "text-danger",
};

/** Recurso que queda al volver: ámbar < 50 %, rojo por debajo de la reserva (20 %). */
function resourceTone(pct: number) {
  if (pct < RESERVE_PCT) return "text-danger";
  if (pct < 50) return "text-warn";
  return "";
}

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

function ClearButton({ onClear }: { onClear: () => void }) {
  return (
    <Button
      variant="outline"
      onClick={onClear}
      aria-label="Quitar destino"
      className="grid shrink-0 place-items-center"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </Button>
  );
}

function Note({ tone, children }: { tone: "warn" | "danger"; children: React.ReactNode }) {
  return (
    <p
      className={`mt-2 flex items-start gap-1.5 font-mono text-[11px] ${
        tone === "danger" ? "text-danger" : "text-warn"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-px shrink-0" aria-hidden>
        <path d="M12 3 2 21h20L12 3zM12 10v5M12 18h.01" />
      </svg>
      <span className="line-clamp-2">{children}</span>
    </p>
  );
}

export default function MetricsBar({
  metrics,
  mode,
  computing = false,
  hasDestination,
  onClear,
}: {
  metrics: RouteResult | null;
  mode: TransportMode;
  /** P2 calcula la ruta en un Worker: mientras tanto se muestran las métricas anteriores */
  computing?: boolean;
  hasDestination: boolean;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!metrics) {
    return (
      <footer
        aria-live="polite"
        className="panel pointer-events-auto flex min-h-14 items-center gap-3 py-1.5 pl-4 pr-1.5"
      >
        <p className={`flex-1 ${hasDestination && !computing ? "text-danger" : "text-ink-dim"}`}>
          {!hasDestination
            ? "Toca el mapa o busca un destino."
            : computing
              ? "Calculando ruta…"
              : `No hay ruta segura hasta ese punto (${mode.label}).`}
        </p>
        {hasDestination && <ClearButton onClear={onClear} />}
      </footer>
    );
  }

  const m = metrics;
  return (
    <footer className="panel pointer-events-auto p-3 sm:px-5">
      <div className="flex items-center gap-3">
        <div
          aria-busy={computing}
          className={`grid min-w-0 flex-1 grid-cols-3 gap-x-4 gap-y-3 transition-opacity duration-150 sm:grid-cols-6 ${
            computing ? "opacity-60" : ""
          }`}
        >
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
              className={resourceTone(m.resourcePct)}
            />
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button
            variant="outline"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Ver menos métricas" : "Ver más métricas"}
            className="grid place-items-center sm:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={open ? "rotate-180" : ""} aria-hidden>
              <path d="m6 15 6-6 6 6" />
            </svg>
          </Button>
          <ClearButton onClear={onClear} />
        </div>
      </div>

      <div aria-live="polite">
        {computing && (
          <p className="mt-2 font-mono text-[11px] tracking-widest text-route motion-safe:animate-pulse">
            CALCULANDO…
          </p>
        )}
        {m.warning && (
          <Note tone={m.risk === "ALTO" ? "danger" : "warn"}>{m.warning}</Note>
        )}
        {m.straightLine && (
          <Note tone="warn">LÍNEA RECTA · sin ruteo todavía: no evita pendientes ni zonas prohibidas</Note>
        )}
      </div>
    </footer>
  );
}
