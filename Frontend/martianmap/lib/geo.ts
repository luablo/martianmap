import type { LonLat } from "./types";

/** Radio medio de Marte. Nunca usar las funciones de distancia de MapLibre (asumen la Tierra). */
export const MARS_RADIUS_M = 3_389_500;

const RAD = Math.PI / 180;

/** Distancia sobre la superficie de Marte, en metros (haversine). */
export function distanceM(a: LonLat, b: LonLat): number {
  const dLat = (b[1] - a[1]) * RAD;
  const dLon = (b[0] - a[0]) * RAD;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * MARS_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Metros por grado de latitud en Marte (~59.2 km) */
export const M_PER_DEG = MARS_RADIUS_M * RAD;

/**
 * Zona de trabajo PROVISIONAL (~3 × 3 km en la falda de Mount Sharp).
 * Datos la reemplaza con los límites reales de public/data/gale/meta.json.
 */
export const ZONE = {
  bounds: { west: 137.33, south: -4.785, east: 137.3807, north: -4.7343 },
  base: [137.342, -4.745] as LonLat,
};

/** Líneas de cuadrícula cada `stepM` metros, para dar escala al mapa vacío. */
export function gridLines(stepM: number): LonLat[][] {
  const { west, south, east, north } = ZONE.bounds;
  const dLat = stepM / M_PER_DEG;
  const dLon = stepM / (M_PER_DEG * Math.cos(((south + north) / 2) * RAD));
  const lines: LonLat[][] = [];
  for (let lon = west; lon <= east + 1e-9; lon += dLon)
    lines.push([[lon, south], [lon, north]]);
  for (let lat = south; lat <= north + 1e-9; lat += dLat)
    lines.push([[west, lat], [east, lat]]);
  return lines;
}
