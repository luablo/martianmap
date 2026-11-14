import { RAD_MSV_PER_DAY, RESERVE_PCT } from "./modes";
import type { Risk, RouteMetrics, TransportMode } from "./types";

/**
 * Métricas a partir de distancia y modo. `maxSlopeDeg` llega del ruteo real;
 * mientras no exista (línea recta) se pasa null y la velocidad es la de plano.
 */
export function computeMetrics(
  distanceM: number,
  mode: TransportMode,
  maxSlopeDeg: number | null = null,
): RouteMetrics {
  const timeH = distanceM / 1000 / mode.speedKmh;
  const roundTripH = timeH * 2;
  const doseMSv = (RAD_MSV_PER_DAY / 24) * roundTripH * mode.shielding;
  const resourcePct = Math.max(0, 100 - (roundTripH / mode.autonomyH) * 100);

  let risk: Risk = "BAJO";
  const outOfRange = distanceM / 1000 > mode.rangeKm;
  const slopeRatio = maxSlopeDeg === null ? 0 : maxSlopeDeg / mode.maxSlopeDeg;
  if (outOfRange || resourcePct < RESERVE_PCT || slopeRatio > 1) risk = "ALTO";
  else if (resourcePct < 50 || slopeRatio > 0.6) risk = "MEDIO";

  return {
    distanceM,
    timeMin: timeH * 60,
    maxSlopeDeg,
    doseMSv,
    resourcePct,
    risk,
  };
}

export function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  return `${h} h ${Math.round(min - h * 60)} min`;
}
