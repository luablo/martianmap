// Dueño: P2 (Ruta). Función pura: sin React, sin DOM. Se puede probar con node.
import type { Position } from "geojson";
import { cellToLonLat, insideBounds, lonLatToCell, pathLengthM } from "@/lib/geo";
import { computeMetrics } from "@/lib/metrics";
import { MODES, RESERVE_PCT } from "@/lib/modes";
import type { LonLat, ModeId, RouteResult, ZoneData } from "@/lib/types";
import { astarGrid, nearestFree, simplify } from "./astar-core";

type Poly = Position[][];

// ── Punto en polígono (par-impar, respeta huecos) ──
function inRing(x: number, y: number, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function inPolygon(x: number, y: number, poly: Poly): boolean {
  if (!inRing(x, y, poly[0])) return false;
  for (let k = 1; k < poly.length; k++) if (inRing(x, y, poly[k])) return false;
  return true;
}

// ── Cachés: lo caro se calcula una sola vez por zona ──
const nogoCache = new WeakMap<ZoneData, Uint8Array>();
const blockedCache = new WeakMap<ZoneData, Map<ModeId, Uint8Array>>();

/** Rasteriza NO PISAR a la malla (1 = prohibido). Solo recorre el bbox de cada polígono. */
function nogoMask(zone: ZoneData): Uint8Array {
  const hit = nogoCache.get(zone);
  if (hit) return hit;

  const { width, height } = zone.meta;
  const mask = new Uint8Array(width * height);

  const polys: Poly[] = [];
  for (const f of zone.nogo?.features ?? []) {
    const g = f.geometry;
    if (g.type === "Polygon") polys.push(g.coordinates);
    else if (g.type === "MultiPolygon") polys.push(...g.coordinates);
  }

  for (const poly of polys) {
    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
    for (const [lo, la] of poly[0]) {
      minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo);
      minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
    }
    const [ca, ra] = lonLatToCell(zone.meta, [minLon, maxLat]); // esquina NO
    const [cb, rb] = lonLatToCell(zone.meta, [maxLon, minLat]); // esquina SE
    const x0 = Math.max(0, Math.min(ca, cb) - 1);
    const x1 = Math.min(width - 1, Math.max(ca, cb) + 1);
    const y0 = Math.max(0, Math.min(ra, rb) - 1);
    const y1 = Math.min(height - 1, Math.max(ra, rb) + 1);

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const [lo, la] = cellToLonLat(zone.meta, x, y);
        if (inPolygon(lo, la, poly)) mask[y * width + x] = 1;
      }
    }
  }
  nogoCache.set(zone, mask);
  return mask;
}

/** Máscara final por modo: NO PISAR o pendiente > máximo del modo. */
function blockedMask(zone: ZoneData, slope: Uint8Array, mode: ModeId): Uint8Array {
  let perMode = blockedCache.get(zone);
  if (!perMode) blockedCache.set(zone, (perMode = new Map()));
  const hit = perMode.get(mode);
  if (hit) return hit;

  const nogo = nogoMask(zone);
  const max = MODES[mode].maxSlopeDeg;
  const out = new Uint8Array(slope.length);
  for (let i = 0; i < slope.length; i++) out[i] = nogo[i] || slope[i] > max ? 1 : 0;
  perMode.set(mode, out);
  return out;
}

/** Línea recta con métricas: respaldo cuando no hay datos o no hay ruta. */
function straight(
  from: LonLat,
  to: LonLat,
  mode: ModeId,
  warning?: string,
): RouteResult {
  const path: LonLat[] = [from, to];
  const metrics = computeMetrics(pathLengthM(path), MODES[mode]);
  return {
    ...metrics,
    risk: warning ? "ALTO" : metrics.risk,
    path,
    straightLine: true,
    ...(warning ? { warning } : {}),
  };
}

/**
 * A* sobre la malla de slope.bin, 8 vecinos.
 * costo(celda) = distancia / velocidad_real(pendiente, modo); celdas sobre la
 * pendiente máxima del modo o dentro de nogo = infranqueables.
 * Ver CONTEXTO.md §5 y §6.
 *
 * Nunca lanza ni devuelve null: si no hay ruta, regresa una línea recta con `warning`.
 */
export function findRoute(
  zone: ZoneData,
  from: LonLat,
  to: LonLat,
  mode: ModeId,
): RouteResult {
  const m = MODES[mode];
  const { slope } = zone;
  const { width, height, metersPerPixel } = zone.meta;

  // Sin malla de pendiente todavía: comportamiento provisional.
  if (!slope || slope.length !== width * height) return straight(from, to, mode);

  if (!insideBounds(zone.meta, from) || !insideBounds(zone.meta, to))
    return straight(from, to, mode, "Fuera de la zona cartografiada: elige un punto dentro del mapa.");

  const blocked = blockedMask(zone, slope, mode);
  const [fc, fr] = lonLatToCell(zone.meta, from);
  const [tc, tr] = lonLatToCell(zone.meta, to);
  const start = nearestFree(blocked, width, height, fr * width + fc);
  const goal = nearestFree(blocked, width, height, tr * width + tc);

  const noRoute = `No hay ruta segura ${m.label.toLowerCase()}: prueba otro modo o elige otro destino.`;
  if (start < 0 || goal < 0) return straight(from, to, mode, noRoute);

  const r = astarGrid({
    width,
    height,
    slope,
    blocked,
    cellM: metersPerPixel,
    start,
    goal,
    speedKmh: m.speedKmh,
    maxSlopeDeg: m.maxSlopeDeg,
  });
  if (!r) return straight(from, to, mode, noRoute);

  const cells = simplify(r.cells, width);
  const path: LonLat[] = cells.map((i) => cellToLonLat(zone.meta, i % width, (i / width) | 0));
  // Los extremos son los puntos reales que eligió la persona, no el centro de celda.
  path[0] = from;
  if (path.length === 1) path.push(to);
  else path[path.length - 1] = to;

  const metrics = computeMetrics(r.distanceM, m, r.maxSlopeDeg, r.timeMin);

  let warning: string | undefined;
  if (r.distanceM / 1000 > m.rangeKm) {
    warning = `Fuera de alcance: ${(r.distanceM / 1000).toFixed(1)} km supera los ${m.rangeKm} km de ${m.label.toLowerCase()}.`;
  } else if (metrics.resourcePct < RESERVE_PCT) {
    warning = `Recurso insuficiente: al volver quedaría ${Math.round(metrics.resourcePct)} % de ${m.resourceLabel.toLowerCase()} (mínimo ${RESERVE_PCT} %).`;
  }

  return { ...metrics, path, straightLine: false, ...(warning ? { warning } : {}) };
}