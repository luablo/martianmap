"use client";
// Dueño: P4. Modo HUD (visor del casco): sin paneles, solo el mapa con la ruta y
// tres datos grandes en las esquinas — distancia, recurso y riesgo — más el botón de salir.
// Los estilos que cambian con el modo viven en globals.css bajo [data-mode="hud"].

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

function Readout({
  label,
  value,
  sub,
  className = "",
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className="hud-readout">
      <div className="font-mono text-xs tracking-widest text-ink-dim">{label}</div>
      <div className={`font-mono text-4xl font-bold tabular-nums sm:text-5xl ${className}`}>{value}</div>
      {sub && <div className="font-mono text-sm tabular-nums text-ink-dim">{sub}</div>}
    </div>
  );
}

export default function HudOverlay({
  route,
  mode,
  style,
  onExit,
}: {
  route: RouteResult | null;
  mode: TransportMode;
  style: React.CSSProperties;
  onExit: () => void;
}) {
  const { t } = useI18n();
  const resourceTone =
    route && route.resourcePct < RESERVE_PCT ? "text-danger" : route && route.resourcePct < 50 ? "text-warn" : "text-ink";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 grid grid-cols-2 grid-rows-[auto_1fr_auto]"
      style={style}
    >
      {/* Arriba izquierda: distancia */}
      <div className="justify-self-start">
        {route ? (
          <Readout
            label={t("DISTANCIA")}
            value={formatDistance(route.distanceM)}
            sub={`${t("IDA")} ${formatMinutes(route.timeMin)}`}
            className="text-route"
          />
        ) : (
          <div className="hud-readout font-mono text-sm text-ink-dim">{t("TOCA EL MAPA PARA MARCAR DESTINO")}</div>
        )}
      </div>

      {/* Arriba derecha: riesgo */}
      <div className="justify-self-end text-right">
        {route && <Readout label={t("RIESGO")} value={t(route.risk)} className={riskTone[route.risk]} />}
      </div>

      <div className="col-span-2" />

      {/* Abajo izquierda: recurso del modo */}
      <div className="self-end justify-self-start">
        {route && (
          <Readout
            label={t(mode.resourceLabel.toUpperCase())}
            value={`${route.resourcePct.toFixed(0)} %`}
            sub={t(mode.label).toUpperCase()}
            className={resourceTone}
          />
        )}
      </div>

      {/* Abajo derecha: salir */}
      <div className="self-end justify-self-end">
        <Button
          variant="panel"
          onClick={onExit}
          className="px-5 font-mono text-xs font-semibold tracking-widest"
        >
          {t("SALIR DE HUD")}
        </Button>
      </div>
    </div>
  );
}
