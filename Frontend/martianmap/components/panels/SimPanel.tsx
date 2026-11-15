"use client";
// Dueño: P4. Panel de la simulación de EVA (sustituye a la barra de métricas mientras corre).

import Button from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { formatDistance, formatMinutes } from "@/lib/metrics";
import { RESERVE_PCT } from "@/lib/modes";
import type { SimPhase, SimState } from "@/lib/simulation";
import type { TransportMode } from "@/lib/types";

const PHASE_LABEL: Record<SimPhase, string> = {
  out: "IDA AL DESTINO",
  at: "EN EL DESTINO · MUESTREO",
  back: "REGRESO A LA BASE",
  done: "DE VUELTA EN LA BASE",
};

function Readout({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className="min-w-0">
      <div className="truncate font-mono text-[11px] tracking-wider text-ink-dim">{label}</div>
      <div className={`truncate font-mono text-lg font-semibold tabular-nums sm:text-2xl ${className}`}>{value}</div>
    </div>
  );
}

export default function SimPanel({
  sim,
  mode,
  onStop,
  onReplay,
}: {
  sim: SimState;
  mode: TransportMode;
  onStop: () => void;
  onReplay: () => void;
}) {
  const { t } = useI18n();
  const done = sim.phase === "done";
  const resourceTone =
    sim.resourcePct < RESERVE_PCT ? "text-danger" : sim.resourcePct < 50 ? "text-warn" : "";

  return (
    <footer aria-live="polite" className="panel pointer-events-auto p-3 sm:px-5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-widest">
            <span className="text-ink-dim">{t("SIMULACIÓN DE EVA")}</span>
            <span className={done ? "text-safe" : "text-route motion-safe:animate-pulse"}>
              · {t(PHASE_LABEL[sim.phase])}
            </span>
          </div>
          {/* Barra de avance: la mitad es la ida y la otra mitad el regreso */}
          <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
            <div className="absolute inset-y-0 left-0 bg-route" style={{ width: `${sim.progress * 100}%` }} />
            <div className="absolute inset-y-0 left-1/2 w-px bg-ink-dim/60" />
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {done && (
            <Button variant="outline" onClick={onReplay} className="px-4 font-mono text-xs font-semibold tracking-widest">
              {t("REPETIR")}
            </Button>
          )}
          <Button variant="outline" onClick={onStop} className="px-4 font-mono text-xs font-semibold tracking-widest">
            {done ? t("Cerrar") : t("DETENER")}
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4 sm:gap-x-4">
        <Readout label={t("TIEMPO DE MISIÓN")} value={formatMinutes(sim.missionMin)} />
        <Readout label={t("RECORRIDO")} value={formatDistance(sim.coveredM)} className="text-route" />
        <Readout label={t("DOSIS")} value={`${sim.doseMSv.toFixed(3)} mSv`} className="text-warn" />
        <Readout
          label={t(mode.resourceLabel.toUpperCase())}
          value={`${sim.resourcePct.toFixed(0)} %`}
          className={resourceTone}
        />
      </div>
      <p className="mt-2 font-mono text-[10px] text-ink-dim">
        {t("Simulación acelerada: el tiempo de misión corre mucho más rápido que el real.")}
      </p>
    </footer>
  );
}
