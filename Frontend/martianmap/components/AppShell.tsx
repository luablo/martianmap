"use client";
// Dueño: P4. Este archivo SOLO compone: el estado de la pantalla + los hooks de cada dueño.
//   useZone   → P1 (lib/data)     useRoute → P2 (lib/routing)
//   MapView   → P3 (components/map)   useNotes → P2 (lib/notes, desde el bloque 3)
// Nadie más lo edita. Si tu parte necesita algo nuevo de aquí, pídelo en el chat.

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import AboutSheet from "@/components/panels/AboutSheet";
import HudOverlay from "@/components/panels/HudOverlay";
import LayerToggles from "@/components/panels/LayerToggles";
import MetricsBar from "@/components/panels/MetricsBar";
import ModeSwitch from "@/components/panels/ModeSwitch";
import NoteCard from "@/components/panels/NoteCard";
import NotesList from "@/components/panels/NotesList";
import TopBar from "@/components/panels/TopBar";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import { useZone } from "@/lib/data/useZone";
import { MODES } from "@/lib/modes";
import { useNotes } from "@/lib/notes/useNotes";
import { useRoute } from "@/lib/routing/useRoute";
import type { LayerId, LonLat, ModeId } from "@/lib/types";
import type { BasemapId } from "@/components/map/layers/basemap";

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
/** Qué hace un toque en el mapa: marcar destino o ubicar una nota. */
type Tool = "route" | "note";

// Márgenes que respetan el notch y la barra de gestos del teléfono.
const SAFE_PADDING: React.CSSProperties = {
  paddingTop: "max(0.75rem, env(safe-area-inset-top))",
  paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
  paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
  paddingRight: "max(0.75rem, env(safe-area-inset-right))",
};

export default function AppShell() {
  const { zone, error } = useZone();
  const { notes, addNote } = useNotes();
  const [tool, setTool] = useState<Tool>("route");
  const [draftAt, setDraftAt] = useState<LonLat | null>(null);
  const [mode, setMode] = useState<ModeId>("walk");
  const [destination, setDestination] = useState<LonLat | null>(null);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [basemapId, setBasemapId] = useState<BasemapId>("viking");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [hud, setHud] = useState(false);

  // Modo HUD: <html data-mode="hud"> activa los estilos de globals.css; Esc sale.
  useEffect(() => {
    const html = document.documentElement;
    if (hud) html.dataset.mode = "hud";
    else delete html.dataset.mode;
    if (!hud) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHud(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hud]);

  // --ui-bottom: distancia del borde inferior de la pantalla al tope de la barra de
  // métricas. La barra cambia de alto (avisos, hoja abierta en teléfono), así que se
  // mide en vivo; Legend y BasemapPicker (P3) se colocan justo encima con esta variable.
  const mainRef = useRef<HTMLElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const main = mainRef.current;
    const bar = bottomBarRef.current;
    if (!main || !bar) return;
    const update = () => {
      const px = Math.max(0, window.innerHeight - bar.getBoundingClientRect().top);
      main.style.setProperty("--ui-bottom", `${Math.round(px)}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(bar);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [hud]); // en HUD no hay barra; al salir se monta una nueva y hay que volver a medirla
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

  const closeNote = () => {
    setTool("route");
    setDraftAt(null);
  };
  const handleMapClick = (p: LonLat) => {
    if (tool === "note") setDraftAt(p);
    else setDestination(p);
  };
  const noteButton = (className = "") => (
    <Button
      variant="panel"
      active={tool === "note"}
      aria-pressed={tool === "note"}
      onClick={() => {
        if (tool === "note") return closeNote();
        setTool("note");
        setDrawer(null); // en teléfono, que el cajón no tape el mapa
      }}
      className={`px-4 font-mono text-xs font-semibold tracking-widest ${className}`}
    >
      + NOTA
      {notes.length > 0 && (
        <span className="ml-2 rounded-md bg-science/20 px-1.5 py-0.5 text-science">{notes.length}</span>
      )}
    </Button>
  );

  return (
    <main ref={mainRef} className="relative h-dvh w-full overflow-hidden bg-bg-0">
      {zone ? (
        <MapView
          zone={zone}
          destination={destination}
          route={route}
          layers={layers}
          notes={notes}
          basemapId={basemapId}
          onMapClick={handleMapClick}
          onBasemapChange={setBasemapId}
        />
      ) : (
        <CenterMsg>
          {error ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-danger">NO SE PUDO CARGAR LA ZONA</p>
              <p className="max-w-sm font-sans text-ink-dim">
                Revisa la conexión o que existan los archivos de <code>public/data/gale/</code>.
                <span className="mt-1 block font-mono text-[11px]">{error}</span>
              </p>
              <Button variant="outline" onClick={() => window.location.reload()} className="px-5 text-ink">
                Reintentar
              </Button>
            </div>
          ) : (
            "CARGANDO ZONA…"
          )}
        </CenterMsg>
      )}

      {zone?.meta.fake && (
        <div className="pointer-events-none absolute left-1/2 top-[5.25rem] z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-warn/40 bg-bg-0/80 px-2 py-0.5 font-mono text-[11px] text-warn">
          TERRENO SINTÉTICO · no son datos reales
        </div>
      )}

      {hud ? (
        <HudOverlay route={route} mode={MODES[mode]} style={SAFE_PADDING} onExit={() => setHud(false)} />
      ) : (
      <>
      {/* Orden de capas (z): mapa y sus controles (Leyenda, BasemapPicker, aviso de terreno) = 10
          < interfaz = 20 (buscador, cajones, barra) < tarjeta de nota = 30.
          La interfaz es pointer-events-none: los controles del mapa siguen tocables donde no hay panel. */}
      <div
        className="pointer-events-none absolute inset-0 z-20 grid grid-rows-[auto_1fr_auto] gap-3"
        style={SAFE_PADDING}
      >
        <TopBar
          pois={zone?.pois ?? []}
          base={base}
          weather={zone?.weather ?? null}
          onPick={(p) => setDestination([p.lon, p.lat])}
          onAbout={() => setAboutOpen(true)}
          onHud={() => {
            setHud(true);
            setDrawer(null);
            closeNote(); // en HUD un toque al mapa siempre marca destino
          }}
        />

        {/* Tablet y hábitat: paneles fijos a los lados */}
        <div className="hidden min-h-0 items-start justify-between gap-3 sm:flex">
          <div className="max-h-full w-52 shrink-0 overflow-y-auto lg:w-60">{layerPanel}</div>
          <div className="flex max-h-full w-48 shrink-0 flex-col gap-3 overflow-y-auto lg:w-64">
            {noteButton("w-full")}
            {modePanel}
            <Panel title="NOTAS DE CAMPO" className="hidden lg:block">
              <NotesList notes={notes} />
            </Panel>
          </div>
        </div>

        {/* Teléfono: botones flotantes que abren un panel */}
        <div className="flex min-h-0 flex-col items-end gap-2 sm:hidden">
          <div className="flex flex-wrap justify-end gap-2">
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
            {noteButton()}
          </div>
          {drawer && (
            <div className="max-h-[60dvh] w-64 max-w-full overflow-y-auto">
              {drawer === "layers" ? layerPanel : modePanel}
            </div>
          )}
        </div>

        <div ref={bottomBarRef}>
        {tool === "note" && !draftAt ? (
          <footer
            role="status"
            className="panel pointer-events-auto flex min-h-14 items-center gap-3 border-science/60 py-1.5 pl-4 pr-1.5"
          >
            <p className="flex-1 text-science">Toca el mapa donde está el hallazgo.</p>
            <Button variant="outline" onClick={closeNote} className="px-4 text-sm">
              Cancelar
            </Button>
          </footer>
        ) : (
          <MetricsBar
            metrics={route}
            mode={MODES[mode]}
            computing={computing}
            hasDestination={destination !== null}
            onClear={() => setDestination(null)}
          />
        )}
        </div>
      </div>
      </>
      )}

      {aboutOpen && <AboutSheet zone={zone} onClose={() => setAboutOpen(false)} />}

      {/* Tarjeta de nota: hoja inferior en teléfono, panel a la derecha en tablet */}
      {draftAt && (
        <div
          className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-end sm:items-end sm:justify-start sm:pt-[5.5rem]!"
          style={SAFE_PADDING}
        >
          <div className="flex max-h-[85dvh] min-h-0 w-full flex-col sm:max-h-full sm:w-96">
            <NoteCard
              key={`${draftAt[0]},${draftAt[1]}`}
              at={draftAt}
              sol={zone?.weather?.sol ?? 412}
              onCancel={closeNote}
              onSave={async (n) => {
                // La foto todavía no se guarda: falta que addNote la reciba (acordar con P2).
                await addNote(n);
                closeNote();
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
