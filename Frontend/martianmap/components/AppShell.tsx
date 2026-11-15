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
import SimPanel from "@/components/panels/SimPanel";
import TopBar from "@/components/panels/TopBar";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import { useZone } from "@/lib/data/useZone";
import { useI18n } from "@/lib/i18n";
import { MODES } from "@/lib/modes";
import { useNotes } from "@/lib/notes/useNotes";
import { useRoute } from "@/lib/routing/useRoute";
import { useSimulation } from "@/lib/simulation";
import type { LayerId, LonLat, ModeId } from "@/lib/types";
import type { BasemapId } from "@/components/map/layers/basemap";

// MapLibre necesita `window`: se carga solo en el navegador.
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <LoadingMap />,
});

function LoadingMap() {
  const { t } = useI18n();
  return <CenterMsg>{t("CARGANDO MAPA…")}</CenterMsg>;
}

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

// ── Botón de colapso de panel ─────────────────────────────────────────────────
// Pestaña pegada al borde del panel con una flecha SVG, centrada en el eje del panel.
// direction: hacia qué lado está el PANEL (izquierda = panel a la izquierda del botón,
// derecha = panel a la derecha, abajo = panel encima del botón).
function CollapseBtn({
  open,
  direction,
  onClick,
  label,
}: {
  open: boolean;
  direction: "left" | "right" | "down";
  onClick: () => void;
  label: string;
}) {
  // Cuando está abierto la flecha apunta HACIA el panel (para "cerrarlo").
  // Cuando está cerrado la flecha apunta ALEJÁNDOSE del panel (para "abrirlo").
  //
  //   left  (panel a la izq): abierto → apunta izq (‹), cerrado → apunta der (›)
  //   right (panel a la der): abierto → apunta der (›), cerrado → apunta izq (‹)
  //   down  (panel encima):   abierto → apunta abajo (∨), cerrado → apunta arriba (∧)
  const chevronRotate: Record<string, string> = {
    left:  open ? "rotate-0"   : "rotate-180",   // ‹ → ›
    right: open ? "rotate-0" : "rotate-180",     // › → ‹  (invertido respecto a left)
    down:  open ? "rotate-0"   : "rotate-180",   // ∨ → ∧
  };

  const isVertical = direction === "down";

  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={open}
      onClick={onClick}
      className={[
        "pointer-events-auto flex shrink-0 items-center justify-center self-center",
        "bg-surface/80 border border-line backdrop-blur-sm",
        "text-ink-dim hover:text-ink hover:bg-line/60 transition-colors duration-150",
        isVertical
          ? "h-5 w-10 rounded-b-xl border-t-0"
          : direction === "right"
            ? "h-10 w-5 rounded-l-xl border-r-0"
            : "h-10 w-5 rounded-r-xl border-l-0",
      ].join(" ")}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform duration-200 ${chevronRotate[direction]}`}
        aria-hidden
      >
        {isVertical
          ? <path d="M1 3 L5 7 L9 3" />    /* chevron ∨ */
          : <path d="M7 1 L3 5 L7 9" />    /* chevron ‹ */
        }
      </svg>
    </button>
  );
}

// Márgenes que respetan el notch y la barra de gestos del teléfono.
const SAFE_PADDING: React.CSSProperties = {
  paddingTop: "max(0.75rem, env(safe-area-inset-top))",
  paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
  paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
  paddingRight: "max(0.75rem, env(safe-area-inset-right))",
};

export default function AppShell() {
  const { zone, error } = useZone();
  const { t } = useI18n();
  const { notes, addNote } = useNotes();
  const [tool, setTool] = useState<Tool>("route");
  const [draftAt, setDraftAt] = useState<LonLat | null>(null);
  const [mode, setMode] = useState<ModeId>("walk");
  const [destination, setDestination] = useState<LonLat | null>(null);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [basemapId, setBasemapId] = useState<BasemapId>("ctx");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [hud, setHud] = useState(false);
  // Colapso de paneles en tablet/hábitat.
  const [leftOpen,   setLeftOpen]   = useState(true);
  const [rightOpen,  setRightOpen]  = useState(true);
  const [bottomOpen, setBottomOpen] = useState(true);

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
  // mide en vivo; la Leyenda (P3) se coloca justo encima con esta variable.
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
  const { sim, start: startSim, stop: stopSim } = useSimulation(route);

  const layerPanel = (
    <Panel title={t("CAPAS")}>
      <LayerToggles
        zone={zone}
        active={layers}
        onChange={(id, on) => setLayers((s) => ({ ...s, [id]: on }))}
        basemapId={basemapId}
        onBasemapChange={setBasemapId}
      />
    </Panel>
  );
  const modePanel = (
    <Panel title={t("MODO")}>
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
      {t("+ NOTA")}
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
          simPos={sim?.pos ?? null}
        />
      ) : (
        <CenterMsg>
          {error ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-danger">{t("NO SE PUDO CARGAR LA ZONA")}</p>
              <p className="max-w-sm font-sans text-ink-dim">
                {t("Revisa la conexión o que existan los archivos de")} <code>public/data/gale/</code>.
                <span className="mt-1 block font-mono text-[11px]">{error}</span>
              </p>
              <Button variant="outline" onClick={() => window.location.reload()} className="px-5 text-ink">
                {t("Reintentar")}
              </Button>
            </div>
          ) : (
            t("CARGANDO ZONA…")
          )}
        </CenterMsg>
      )}

      {/* Honestidad: se queda mientras meta.fake exista; desaparece solo con los datos reales de P1. */}
      {zone?.meta.fake && (
        // Teléfono: debajo de los botones CAPAS / MODO / + NOTA, que si no lo tapan.
        <div className="pointer-events-none absolute left-1/2 top-[10.25rem] sm:top-[5.25rem] z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-warn/40 bg-bg-0/80 px-2 py-0.5 font-mono text-[11px] text-warn">
          {t("TERRENO SINTÉTICO · no son datos reales")}
        </div>
      )}

      {hud ? (
        <HudOverlay route={route} mode={MODES[mode]} style={SAFE_PADDING} onExit={() => setHud(false)} />
      ) : (
      <>
      {/* Orden de capas (z): mapa y sus controles (Leyenda, aviso de terreno) = 10
          < interfaz = 20 (buscador, cajones, barra) < tarjeta de nota y "i" = 30.
          El selector de mapa base vive en el panel CAPAS (LayerToggles). */}
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

        {/* Tablet y hábitat: paneles colapsables a los lados */}
        <div className="hidden min-h-0 items-stretch justify-between gap-0 sm:flex">

          {/* Panel izquierdo — CAPAS */}
          <div className="flex min-h-0 items-stretch">
            <div
              className={[
                "max-h-full overflow-y-auto transition-all duration-200",
                leftOpen ? "w-52 lg:w-60 opacity-100" : "w-0 opacity-0 overflow-hidden",
              ].join(" ")}
            >
              {layerPanel}
            </div>
            {/* Pestaña pegada al borde derecho del panel izquierdo, centrada verticalmente */}
            <CollapseBtn
              open={leftOpen}
              direction="left"
              onClick={() => setLeftOpen((v) => !v)}
              label={leftOpen ? t("Ocultar panel de capas") : t("Mostrar panel de capas")}
            />
          </div>

          {/* Panel derecho — MODO + NOTAS */}
          <div className="flex min-h-0 items-stretch">
            {/* Pestaña pegada al borde izquierdo del panel derecho, centrada verticalmente */}
            <CollapseBtn
              open={rightOpen}
              direction="right"
              onClick={() => setRightOpen((v) => !v)}
              label={rightOpen ? t("Ocultar panel de modo") : t("Mostrar panel de modo")}
            />
            <div
              className={[
                "max-h-full overflow-y-auto transition-all duration-200",
                rightOpen ? "w-48 lg:w-64 opacity-100" : "w-0 opacity-0 overflow-hidden",
              ].join(" ")}
            >
              <div className="flex flex-col gap-3">
                {noteButton("w-full")}
                {modePanel}
                <Panel title={t("NOTAS DE CAMPO")} className="hidden lg:block">
                  <NotesList notes={notes} />
                </Panel>
              </div>
            </div>
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
                {d === "layers" ? t("CAPAS") : t(MODES[mode].label).toUpperCase()}
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

        <div ref={bottomBarRef} className="flex flex-col items-center gap-0">
          {/* Contenido de la barra: se colapsa hacia abajo */}
          <div
            className={[
              "w-full transition-all duration-200 overflow-hidden",
              bottomOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0",
            ].join(" ")}
          >
          {tool === "note" && !draftAt ? (
            <footer
              role="status"
              className="panel pointer-events-auto flex min-h-14 items-center gap-3 border-science/60 py-1.5 pl-4 pr-1.5"
            >
              <p className="flex-1 text-science">{t("Toca el mapa donde está el hallazgo.")}</p>
              <Button variant="outline" onClick={closeNote} className="px-4 text-sm">
                {t("Cancelar")}
              </Button>
            </footer>
          ) : sim ? (
            <SimPanel sim={sim} mode={MODES[mode]} onStop={stopSim} onReplay={startSim} />
          ) : (
            <MetricsBar
              metrics={route}
              mode={MODES[mode]}
              computing={computing}
              hasDestination={destination !== null}
              onClear={() => setDestination(null)}
              onSimulate={startSim}
            />
          )}
          </div>
          {/* Pestaña centrada horizontalmente, cuelga debajo del panel */}
          <CollapseBtn
            open={bottomOpen}
            direction="down"
            onClick={() => setBottomOpen((v) => !v)}
            label={bottomOpen ? t("Ocultar barra de métricas") : t("Mostrar barra de métricas")}
          />
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
              onSave={async (n, photo) => {
                await addNote(n, photo);
                closeNote();
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
