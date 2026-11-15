"use client";
// Dueño: P4. Barra inferior con las métricas de la ruta. En teléfono es una hoja
// que, cerrada, muestra lo esencial (distancia, tiempo, riesgo).

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
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
      <div className={`truncate font-mono text-lg font-semibold tabular-nums sm:text-2xl ${className}`}>
        {value}
      </div>
    </div>
  );
}

function ClearButton({ onClear, className = "" }: { onClear: () => void; className?: string }) {
  const { t } = useI18n();
  return (
    <Button
      variant="outline"
      onClick={onClear}
      aria-label={t("Quitar destino")}
      className={`grid shrink-0 place-items-center ${className}`}
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
  onSimulate,
}: {
  metrics: RouteResult | null;
  mode: TransportMode;
  /** P2 calcula la ruta en un Worker: mientras tanto se muestran las métricas anteriores */
  computing?: boolean;
  hasDestination: boolean;
  onClear: () => void;
  /** Arranca la simulación de la EVA (ida, muestreo y regreso). */
  onSimulate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  if (!metrics) {
    return (
      <footer
        aria-live="polite"
        className="panel pointer-events-auto flex min-h-14 items-center gap-3 py-1.5 pl-4 pr-1.5"
      >
        <p className={`flex-1 ${hasDestination && !computing ? "text-danger" : "text-ink-dim"}`}>
          {!hasDestination
            ? t("Toca el mapa o busca un destino.")
            : computing
              ? t("Calculando ruta…")
              : t(`No hay ruta segura hasta ese punto (${mode.label}).`)}
        </p>
        {hasDestination && <ClearButton onClear={onClear} />}
      </footer>
    );
  }

  const m = metrics;
  return (
    <footer className="panel pointer-events-auto p-3 sm:px-5">
      {/* Abierta en teléfono: las métricas usan todo el ancho y los botones bajan a su fila */}
      <div className={`flex items-center gap-3 ${open ? "max-sm:flex-col max-sm:items-stretch" : ""}`}>
        <div
          aria-busy={computing}
          className={`grid min-w-0 flex-1 grid-cols-3 gap-x-3 gap-y-3 transition-opacity duration-150 sm:grid-cols-6 sm:gap-x-4 ${
            computing ? "opacity-60" : ""
          }`}
        >
          <Metric label={t("DISTANCIA")} value={formatDistance(m.distanceM)} className="text-route" />
          <Metric label={t("IDA")} value={formatMinutes(m.timeMin)} />
          <Metric label={t("RIESGO")} value={t(m.risk)} className={riskTone[m.risk]} />
          <div className={`contents ${open ? "" : "max-sm:hidden"}`}>
            <Metric
              label={t("PENDIENTE MÁX")}
              value={m.maxSlopeDeg === null ? "—" : `${m.maxSlopeDeg.toFixed(0)}°`}
            />
            <Metric label={t("DOSIS EST.")} value={`${m.doseMSv.toFixed(3)} mSv`} className="text-warn" />
            <Metric
              label={t(mode.resourceLabel.toUpperCase())}
              value={`${m.resourcePct.toFixed(0)} %`}
              className={resourceTone(m.resourcePct)}
            />
          </div>
        </div>
        <div className={`flex shrink-0 gap-1.5 ${open ? "max-sm:justify-end" : ""}`}>
          {onSimulate && !computing && !m.straightLine && m.path.length > 1 && (
            <Button
              variant="solid"
              onClick={onSimulate}
              title={t("Simular el recorrido de ida y vuelta")}
              aria-label={t("INICIAR RECORRIDO")}
              className="flex items-center gap-2 px-3 font-mono text-xs font-semibold tracking-widest sm:px-4"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M7 4.5v15l13-7.5z" />
              </svg>
              <span className="max-sm:hidden">{t("INICIAR RECORRIDO")}</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? t("Ver menos métricas") : t("Ver más métricas")}
            className="grid place-items-center sm:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={open ? "rotate-180" : ""} aria-hidden>
              <path d="m6 15 6-6 6 6" />
            </svg>
          </Button>
          {/* En teléfono, dos botones dejan sin espacio a las métricas: la × solo con la hoja abierta */}
          <ClearButton onClear={onClear} className={open ? "" : "max-sm:hidden"} />
        </div>
      </div>

      <div aria-live="polite">
        {computing && (
          <p className="mt-2 font-mono text-[11px] tracking-widest text-route motion-safe:animate-pulse">
            {t("CALCULANDO…")}
          </p>
        )}
        {m.warning && (
          <Note tone={m.risk === "ALTO" ? "danger" : "warn"}>{t(m.warning)}</Note>
        )}
        {m.straightLine && (
          <Note tone="warn">{t("LÍNEA RECTA · sin ruteo todavía: no evita pendientes ni zonas prohibidas")}</Note>
        )}
      </div>
    </footer>
  );
}
