"use client";
// Dueño: P4. Barra superior: buscador de destinos (POI de la zona) + chips de estado.

import { useId, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { distanceM } from "@/lib/geo";
import { formatDistance } from "@/lib/metrics";
import type { LonLat, Poi, PoiType, Weather } from "@/lib/types";

/** Minúsculas y sin acentos: "Geología" encuentra "geologia". */
const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// Orden de la lista: primero los objetivos científicos, luego fotos, al final la base.
const TYPE_ORDER: Record<PoiType, number> = { target: 0, pov: 1, base: 2 };
const TYPE_LABEL: Record<PoiType, string> = { target: "OBJETIVO", pov: "FOTO", base: "BASE" };
const TYPE_COLOR: Record<PoiType, string> = {
  target: "text-science",
  pov: "text-info",
  base: "text-info",
};

function PoiIcon({ type }: { type: PoiType }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${TYPE_COLOR[type]}`} aria-hidden>
      {type === "target" && (
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
      {type === "pov" && (
        <>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7l1.5-3h5L16 7" />
          <circle cx="12" cy="13.5" r="3.5" />
        </>
      )}
      {type === "base" && <path d="M4 20V10l8-6 8 6v10h-5v-6H9v6z" />}
    </svg>
  );
}

export default function TopBar({
  pois,
  base,
  weather,
  onPick,
  onAbout,
  onHud,
}: {
  pois: Poi[];
  /** Para mostrar a qué distancia está cada destino */
  base: LonLat | null;
  weather: Weather | null;
  onPick: (poi: Poi) => void;
  /** Abre "Supuestos y fuentes" */
  onAbout: () => void;
  /** Entra al modo HUD */
  onHud: () => void;
}) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = fold(query.trim());
    return pois
      .filter((p) => !q || fold(`${p.name} ${p.description ?? ""}`).includes(q))
      .map((p) => ({ poi: p, dist: base ? distanceM(base, [p.lon, p.lat]) : null }))
      .sort(
        (a, b) =>
          TYPE_ORDER[a.poi.type] - TYPE_ORDER[b.poi.type] || (a.dist ?? 0) - (b.dist ?? 0),
      );
  }, [pois, base, query]);

  const showList = open && results.length > 0;
  const activeIdx = Math.min(active, results.length - 1);

  const pick = (poi: Poi) => {
    onPick(poi);
    setQuery(poi.name);
    setOpen(false);
    inputRef.current?.blur(); // en teléfono baja el teclado y deja ver la ruta
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((activeIdx + step + results.length) % results.length);
    } else if (e.key === "Enter" && showList) {
      e.preventDefault();
      pick(results[activeIdx].poi);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <header className="panel pointer-events-auto relative flex items-center gap-2 p-2">
      {/* El input quita su contorno; el foco se marca en toda la caja del buscador */}
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-bg-0/60 px-3 focus-within:ring-2 focus-within:ring-route">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-ink-dim" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <span className="sr-only">Buscar destino</span>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList ? `${listId}-${activeIdx}` : undefined}
          placeholder="¿A dónde vamos?"
          autoComplete="off"
          enterKeyHint="go"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="touch w-full min-w-0 bg-transparent text-base text-ink placeholder:text-ink-dim focus:outline-none"
        />
      </label>

      <div className="flex shrink-0 items-center gap-1.5">
        {/* En teléfono los chips ceden su lugar a los botones; el sol también está en "i". */}
        <span className="hidden sm:contents">
          <Chip>SOL {weather?.sol ?? 412}</Chip>
          <Chip>EVA 07</Chip>
        </span>
        {weather && (
          <span className="hidden lg:contents">
            <Chip tone="info">
              {weather.tempMinC} / {weather.tempMaxC} °C
            </Chip>
          </span>
        )}
        <span className="hidden sm:contents">
          <Chip tone="safe">ENLACE OK</Chip>
        </span>
        <Button variant="outline" onClick={onHud} aria-label="Modo HUD (visor del casco)" title="Modo HUD" className="grid place-items-center px-2 font-mono text-[11px] font-semibold tracking-widest">
          HUD
        </Button>
        <Button variant="outline" onClick={onAbout} aria-label="Supuestos y fuentes" title="Supuestos y fuentes" className="grid place-items-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
          </svg>
        </Button>
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Destinos"
          className="panel absolute inset-x-0 top-full z-20 mt-2 max-h-[50dvh] overflow-y-auto bg-surface p-1.5 sm:right-auto sm:w-96"
        >
          {results.map(({ poi, dist }, i) => (
            <li
              key={poi.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIdx}
              // pointerdown + preventDefault: el input no pierde el foco antes del clic
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => pick(poi)}
              onPointerEnter={() => setActive(i)}
              className={`touch flex cursor-pointer items-center gap-3 rounded-xl px-3 ${
                i === activeIdx ? "bg-route/15" : ""
              }`}
            >
              <PoiIcon type={poi.type} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">{poi.name}</span>
                <span className="block truncate font-mono text-[11px] text-ink-dim">
                  {TYPE_LABEL[poi.type]}
                  {poi.description ? ` · ${poi.description}` : ""}
                </span>
              </span>
              {dist !== null && poi.type !== "base" && (
                <span className="shrink-0 font-mono text-xs tabular-nums text-ink-dim">
                  {formatDistance(dist)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
