"use client";
// Dueño: P4. "Acerca de / supuestos": de dónde sale cada número de la app.
// Lee MODES (P2) y LAYERS (P1) para que la tabla nunca se desfase del código.

import { useEffect, useId, useRef } from "react";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { useI18n } from "@/lib/i18n";
import { LAYERS, layerAvailable } from "@/lib/layers";
import { MODES, MODE_ORDER, RAD_MSV_PER_DAY, RESERVE_PCT } from "@/lib/modes";
import type { Provenance, ZoneData } from "@/lib/types";

const PROVENANCE_TONE: Record<Provenance, "safe" | "info" | "warn"> = {
  MEDIDO: "safe",
  DERIVADO: "info",
  ESTIMADO: "warn",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-mono text-[11px] font-semibold tracking-widest text-ink-dim">{title}</h3>
      {children}
    </section>
  );
}

export default function AboutSheet({ zone, onClose }: { zone: ZoneData | null; onClose: () => void }) {
  const titleId = useId();
  const { lang, t } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Foco al botón de cerrar al abrir; Esc cierra.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sources = zone?.meta.sources ?? [];

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-30 flex items-end justify-center bg-bg-0/60 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="panel flex max-h-[90dvh] w-full flex-col overflow-hidden bg-surface sm:max-w-2xl"
      >
        <header className="flex items-center gap-3 border-b border-line py-1.5 pl-5 pr-1.5">
          <h2 id={titleId} className="flex-1 font-mono text-xs font-semibold tracking-widest text-ink">
            {t("SUPUESTOS Y FUENTES")}
          </h2>
          <Button ref={closeRef} variant="outline" onClick={onClose} aria-label={t("Cerrar")} className="grid place-items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </Button>
        </header>

        <div className="flex flex-col gap-6 overflow-y-auto p-5 text-sm">
          {lang === "en" ? (
            <p className="text-ink-dim">
              MARSWALK combines <strong className="text-ink">data measured by NASA</strong> with{" "}
              <strong className="text-ink">team assumptions</strong>. Each layer says which is which, and the
              dose and resource figures are model estimates, not measurements.
            </p>
          ) : (
            <p className="text-ink-dim">
              MARSWALK combina <strong className="text-ink">datos medidos por NASA</strong> con{" "}
              <strong className="text-ink">supuestos del equipo</strong>. Cada capa dice cuál es cuál, y las
              cifras de dosis y recurso son estimaciones del modelo, no mediciones.
            </p>
          )}

          {zone?.meta.fake && (
            <p className="rounded-xl border border-warn/40 px-3 py-2 font-mono text-xs text-warn">
              {t("Esta zona usa TERRENO SINTÉTICO para pruebas: todavía no son datos reales.")}
            </p>
          )}

          <Section title={t("MODOS DE TRANSPORTE · SUPUESTOS DEL EQUIPO")}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[30rem] text-left font-mono text-xs">
                <thead className="text-ink-dim">
                  <tr className="border-b border-line">
                    <th className="py-2 pr-3 font-normal">{t("Modo")}</th>
                    <th className="py-2 pr-3 font-normal">{t("Pend. máx")}</th>
                    <th className="py-2 pr-3 font-normal">{t("Velocidad")}</th>
                    <th className="py-2 pr-3 font-normal">{t("Alcance")}</th>
                    <th className="py-2 pr-3 font-normal">{t("Recurso")}</th>
                    <th className="py-2 font-normal">{t("Blindaje")}</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums text-ink">
                  {MODE_ORDER.map((id) => {
                    const m = MODES[id];
                    return (
                      <tr key={id} className="border-b border-line/60">
                        <td className="py-2 pr-3 font-sans font-semibold">{t(m.label)}</td>
                        <td className="py-2 pr-3">{m.maxSlopeDeg}°</td>
                        <td className="py-2 pr-3">{m.speedKmh} km/h</td>
                        <td className="py-2 pr-3">{m.rangeKm} km</td>
                        <td className="py-2 pr-3">
                          {t(m.resourceLabel)} · {m.autonomyH} h
                        </td>
                        <td className="py-2">{m.shielding === 1 ? t("ninguno") : `×${m.shielding}`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title={t("CÓMO SE CALCULA")}>
            {lang === "en" ? (
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-ink-dim">
              <li>
                <span className="text-ink">Dose</span> = {RAD_MSV_PER_DAY} mSv/day (MSL RAD surface rate)
                × round-trip time × mode shielding. <Chip tone="warn">ESTIMATED</Chip>
              </li>
              <li>
                <span className="text-ink">Resource</span>: what is left on return; at least a{" "}
                {RESERVE_PCT} % reserve must remain.
              </li>
              <li>
                <span className="text-ink">HIGH risk</span> if the destination is out of range, the reserve is not
                enough or the slope exceeds the mode&apos;s maximum.
              </li>
              <li>
                <span className="text-ink">Route</span>: avoids slopes steeper than the mode allows and the NO-GO zones.
              </li>
            </ul>
            ) : (
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-ink-dim">
              <li>
                <span className="text-ink">Dosis</span> = {RAD_MSV_PER_DAY} mSv/día (tasa de superficie de MSL RAD)
                × tiempo de ida y vuelta × blindaje del modo. <Chip tone="warn">ESTIMADO</Chip>
              </li>
              <li>
                <span className="text-ink">Recurso</span>: lo que queda al volver; debe quedar al menos un{" "}
                {RESERVE_PCT} % de reserva.
              </li>
              <li>
                <span className="text-ink">Riesgo ALTO</span> si el destino está fuera de alcance, la reserva no
                alcanza o la pendiente supera la del modo.
              </li>
              <li>
                <span className="text-ink">Ruta</span>: evita pendientes mayores a la del modo y las zonas NO PISAR.
              </li>
            </ul>
            )}
          </Section>

          <Section title={t("CAPAS DE DATOS")}>
            <ul className="flex flex-col gap-2">
              {LAYERS.map((l) => {
                const available = layerAvailable(zone, l.id);
                return (
                  <li key={l.id} className="flex flex-wrap items-center gap-2">
                    <span className={`min-w-28 font-semibold ${available ? "text-ink" : "text-ink-dim"}`}>
                      {t(l.label)}
                    </span>
                    <Chip tone={PROVENANCE_TONE[l.provenance]}>{t(l.provenance)}</Chip>
                    <span className="font-mono text-xs text-ink-dim">{l.source}</span>
                    {!available && <span className="font-mono text-[11px] text-ink-dim">{t("· sin datos en esta zona")}</span>}
                  </li>
                );
              })}
            </ul>
          </Section>

          {sources.length > 0 && (
            <Section title={t("FUENTES DE ESTA ZONA")}>
              <ul className="flex list-disc flex-col gap-1 pl-5 font-mono text-xs text-ink-dim">
                {sources.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </Section>
          )}

          <p className="font-mono text-[11px] text-ink-dim">
            NASA Space Apps 2026 · Interplanetary Survival Guide: Martian Map.{" "}
            {lang === "en"
              ? "AI assistants were used for code and documentation."
              : "Se usaron asistentes de IA para código y documentación."}
          </p>
        </div>
      </div>
    </div>
  );
}
