// Archivo compartido (P2 y P3). Congelado: avisar en el chat antes de cambiarlo.
import type { LonLat, ZoneMeta } from "./types";

/** Radio medio de Marte. Nunca usar las funciones de distancia de MapLibre (asumen la Tierra). */
export const MARS_RADIUS_M = 3_389_500;

const RAD = Math.PI / 180;

/** Metros por grado de latitud en Marte (~59.2 km) */
export const M_PER_DEG = MARS_RADIUS_M * RAD;

/** Distancia sobre la superficie de Marte, en metros (haversine). */
export function distanceM(a: LonLat, b: LonLat): number {
  const dLat = (b[1] - a[1]) * RAD;
  const dLon = (b[0] - a[0]) * RAD;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * MARS_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Longitud total de un camino, en metros. */
export function pathLengthM(path: LonLat[]): number {
  let d = 0;
  for (let i = 1; i < path.length; i++) d += distanceM(path[i - 1], path[i]);
  return d;
}

/** Celda [col, row] de la malla de slope.bin que contiene el punto. Fila 0 = norte. */
export function lonLatToCell(meta: ZoneMeta, p: LonLat): [col: number, row: number] {
  const { west, east, north, south } = meta.bounds;
  const col = Math.floor(((p[0] - west) / (east - west)) * meta.width);
  const row = Math.floor(((north - p[1]) / (north - south)) * meta.height);
  return [
    Math.min(meta.width - 1, Math.max(0, col)),
    Math.min(meta.height - 1, Math.max(0, row)),
  ];
}

/** Centro de la celda [col, row] en lon/lat. */
export function cellToLonLat(meta: ZoneMeta, col: number, row: number): LonLat {
  const { west, east, north, south } = meta.bounds;
  return [
    west + ((col + 0.5) / meta.width) * (east - west),
    north - ((row + 0.5) / meta.height) * (north - south),
  ];
}

export function insideBounds(meta: ZoneMeta, p: LonLat): boolean {
  const { west, east, north, south } = meta.bounds;
  return p[0] >= west && p[0] <= east && p[1] >= south && p[1] <= north;
}

/** Líneas de cuadrícula cada `stepM` metros, para dar escala al mapa. */
export function gridLines(meta: ZoneMeta, stepM: number): LonLat[][] {
  const { west, south, east, north } = meta.bounds;
  const dLat = stepM / M_PER_DEG;
  const dLon = stepM / (M_PER_DEG * Math.cos(((south + north) / 2) * RAD));
  const lines: LonLat[][] = [];
  for (let lon = west; lon <= east + 1e-9; lon += dLon)
    lines.push([[lon, south], [lon, north]]);
  for (let lat = north; lat >= south - 1e-9; lat -= dLat)
    lines.push([[west, lat], [east, lat]]);
  return lines;
}
