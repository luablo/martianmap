"use client";
// Dueño: P4. Este archivo SOLO compone: el estado de la pantalla + los hooks de cada dueño.
//   useZone   → P1 (lib/data)     useRoute → P2 (lib/routing)
//   MapView   → P3 (components/map)   useNotes → P4 (lib/notes)
// Nadie más lo edita. Si tu parte necesita algo nuevo de aquí, pídelo en el chat.

import dynamic from "next/dynamic";
import { useState } from "react";
import LayerToggles from "@/components/panels/LayerToggles";
import MetricsBar from "@/components/panels/MetricsBar";
import ModeSwitch from "@/components/panels/ModeSwitch";
import TopBar from "@/components/panels/TopBar";
import { useZone } from "@/lib/data/useZone";
import { MODES } from "@/lib/modes";
import { useNotes } from "@/lib/notes/useNotes";
import { useRoute } from "@/lib/routing/useRoute";
import type { LayerId, LonLat, ModeId } from "@/lib/types";

// MapLibre necesita `window`: se carga solo en el navegador.
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <CenterMsg>CARGANDO MAPA…</CenterMsg>,
});

function CenterMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center px-6 text-center font-mono text-sm text-ink-dim">
      {children}
    </div>
  );
}

type Drawer = "layers" | "mode" | null;

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-3 pb-1 pt-2 font-mono text-[11px] font-semibold tracking-widest text-ink-dim">
      {children}
    </h2>
  );
}

export default function AppShell() {
  const { zone, error } = useZone();
  const { notes } = useNotes();
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

  const base: LonLat | null = zone ? [zone.meta.base.lon, zone.meta.base.lat] : null;
  const { route } = useRoute(zone, base, destination, mode);

  const layerPanel = (
    <section className="panel pointer-events-auto p-1.5">
      <PanelTitle>CAPAS</PanelTitle>
      <LayerToggles
        zone={zone}
        active={layers}
        onChange={(id, on) => setLayers((s) => ({ ...s, [id]: on }))}
      />
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
      {zone ? (
        <MapView
          zone={zone}
          destination={destination}
          route={route}
          layers={layers}
          notes={notes}
          onMapClick={setDestination}
        />
      ) : (
        <CenterMsg>{error ? `SIN DATOS DE ZONA · ${error}` : "CARGANDO ZONA…"}</CenterMsg>
      )}

      {zone?.meta.fake && (
        <div className="pointer-events-none absolute left-1/2 top-[5.25rem] z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-warn/40 bg-bg-0/80 px-2 py-0.5 font-mono text-[11px] text-warn">
          TERRENO SINTÉTICO · no son datos reales
        </div>
      )}

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
                {notes.length === 0
                  ? "Aún no hay notas. Aquí aparecerán los hallazgos de la EVA."
                  : `${notes.length} notas`}
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

        <MetricsBar metrics={route} mode={MODES[mode]} />
      </div>
    </main>
  );
}
