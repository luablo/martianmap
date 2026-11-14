"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import LayerToggles from "@/components/panels/LayerToggles";
import MetricsBar from "@/components/panels/MetricsBar";
import ModeSwitch from "@/components/panels/ModeSwitch";
import TopBar from "@/components/panels/TopBar";
import { ZONE, distanceM } from "@/lib/geo";
import { computeMetrics } from "@/lib/metrics";
import { MODES } from "@/lib/modes";
import type { LayerId, LonLat, ModeId } from "@/lib/types";

// MapLibre necesita `window`: se carga solo en el navegador.
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center font-mono text-sm text-ink-dim">
      CARGANDO MAPA…
    </div>
  ),
});

type Drawer = "layers" | "mode" | null;

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-3 pb-1 pt-2 font-mono text-[11px] font-semibold tracking-widest text-ink-dim">
      {children}
    </h2>
  );
}

export default function AppShell() {
  const [mode, setMode] = useState<ModeId>("walk");
  const [destination, setDestination] = useState<LonLat | null>(null);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [layers, setLayers] = useState<Record<LayerId, boolean>>({
    ortho: true,
    slope: true,
    radiation: false,
    thermal: false,
    mineral: false,
  });

  // PROVISIONAL: línea recta base → destino. Aquí entra el A* (lib/routing).
  const path = useMemo<LonLat[] | null>(
    () => (destination ? [ZONE.base, destination] : null),
    [destination],
  );
  const metrics = useMemo(
    () => (destination ? computeMetrics(distanceM(ZONE.base, destination), MODES[mode]) : null),
    [destination, mode],
  );

  const layerPanel = (
    <section className="panel pointer-events-auto p-1.5">
      <PanelTitle>CAPAS</PanelTitle>
      <LayerToggles active={layers} onChange={(id, on) => setLayers((s) => ({ ...s, [id]: on }))} />
    </section>
  );
  const modePanel = (
    <section className="panel pointer-events-auto p-1.5">
      <PanelTitle>MODO</PanelTitle>
      <ModeSwitch mode={mode} onChange={setMode} />
    </section>
  );

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg-0">
      <MapView destination={destination} path={path} onPickDestination={setDestination} />

      {/* Capa de interfaz: no bloquea el mapa salvo donde hay paneles */}
      <div
        className="pointer-events-none absolute inset-0 grid grid-rows-[auto_1fr_auto] gap-3 p-3"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        }}
      >
        <TopBar />

        {/* Tablet y hábitat: paneles fijos a los lados */}
        <div className="hidden min-h-0 items-start justify-between gap-3 sm:flex">
          <div className="max-h-full w-60 overflow-y-auto">{layerPanel}</div>
          <div className="flex max-h-full w-56 flex-col gap-3 overflow-y-auto lg:w-72">
            {modePanel}
            <section className="panel pointer-events-auto hidden p-1.5 lg:block">
              <PanelTitle>NOTAS DE CAMPO</PanelTitle>
              <p className="px-3 pb-3 text-sm text-ink-dim">
                Aún no hay notas. Aquí aparecerán los hallazgos de la EVA.
              </p>
            </section>
          </div>
        </div>

        {/* Teléfono: botones flotantes que abren un panel */}
        <div className="flex min-h-0 flex-col items-end gap-2 sm:hidden">
          <div className="flex gap-2">
            {(["layers", "mode"] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-expanded={drawer === d}
                onClick={() => setDrawer(drawer === d ? null : d)}
                className={`panel touch pointer-events-auto px-4 font-mono text-xs font-semibold tracking-widest ${
                  drawer === d ? "text-route" : "text-ink"
                }`}
              >
                {d === "layers" ? "CAPAS" : MODES[mode].label.toUpperCase()}
              </button>
            ))}
          </div>
          {drawer && (
            <div className="max-h-full w-64 max-w-full overflow-y-auto">
              {drawer === "layers" ? layerPanel : modePanel}
            </div>
          )}
        </div>

        <MetricsBar metrics={metrics} mode={MODES[mode]} />
      </div>
    </main>
  );
}
