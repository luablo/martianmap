"use client";
// Dueño: P4. Este archivo SOLO compone: el estado de la pantalla + los hooks de cada dueño.
//   useZone   → P1 (lib/data)     useRoute → P2 (lib/routing)
//   MapView   → P3 (components/map)   useNotes → P4 (lib/notes)
// Nadie más lo edita. Si tu parte necesita algo nuevo de aquí, pídelo en el chat.

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import LayerToggles from "@/components/panels/LayerToggles";
import MetricsBar from "@/components/panels/MetricsBar";
import ModeSwitch from "@/components/panels/ModeSwitch";
import TopBar from "@/components/panels/TopBar";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
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

  // Memorizado: si fuera un arreglo nuevo en cada render, la ruta se recalcularía siempre.
  const base = useMemo<LonLat | null>(
    () => (zone ? [zone.meta.base.lon, zone.meta.base.lat] : null),
    [zone],
  );
  const { route, computing } = useRoute(zone, base, destination, mode);

  const layerPanel = (
    <Panel title="CAPAS">
      <LayerToggles
        zone={zone}
        active={layers}
        onChange={(id, on) => setLayers((s) => ({ ...s, [id]: on }))}
      />
    </Panel>
  );
  const modePanel = (
    <Panel title="MODO">
      <ModeSwitch mode={mode} onChange={setMode} />
    </Panel>
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
        className="pointer-events-none absolute inset-0 z-20 grid grid-rows-[auto_1fr_auto] gap-3 p-3"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        }}
      >
        <TopBar
          pois={zone?.pois ?? []}
          base={base}
          weather={zone?.weather ?? null}
          onPick={(p) => setDestination([p.lon, p.lat])}
        />

        {/* Tablet y hábitat: paneles fijos a los lados */}
        <div className="hidden min-h-0 items-start justify-between gap-3 sm:flex">
          <div className="max-h-full w-60 overflow-y-auto">{layerPanel}</div>
          <div className="flex max-h-full w-56 flex-col gap-3 overflow-y-auto lg:w-72">
            {modePanel}
            <Panel title="NOTAS DE CAMPO" className="hidden lg:block">
              <p className="px-3 pb-3 text-sm text-ink-dim">
                {notes.length === 0
                  ? "Aún no hay notas. Aquí aparecerán los hallazgos de la EVA."
                  : `${notes.length} notas`}
              </p>
            </Panel>
          </div>
        </div>

        {/* Teléfono: botones flotantes que abren un panel */}
        <div className="flex min-h-0 flex-col items-end gap-2 sm:hidden">
          <div className="flex gap-2">
            {(["layers", "mode"] as const).map((d) => (
              <Button
                key={d}
                variant="panel"
                active={drawer === d}
                aria-expanded={drawer === d}
                onClick={() => setDrawer(drawer === d ? null : d)}
                className="px-4 font-mono text-xs font-semibold tracking-widest"
              >
                {d === "layers" ? "CAPAS" : MODES[mode].label.toUpperCase()}
              </Button>
            ))}
          </div>
          {drawer && (
            <div className="max-h-full w-64 max-w-full overflow-y-auto">
              {drawer === "layers" ? layerPanel : modePanel}
            </div>
          )}
        </div>

        <MetricsBar
          metrics={route}
          mode={MODES[mode]}
          computing={computing}
          hasDestination={destination !== null}
          onClear={() => setDestination(null)}
        />
      </div>
    </main>
  );
}
