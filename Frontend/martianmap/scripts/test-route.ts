import { existsSync, readFileSync } from "node:fs";
import { findRoute } from "../lib/routing/astar";
import { MODE_ORDER, MODES } from "../lib/modes";
import type { LonLat, NoGo, ZoneData, ZoneMeta } from "../lib/types";

const dir = "public/data/gale";
const meta: ZoneMeta = JSON.parse(readFileSync(`${dir}/meta.json`, "utf8"));
const slope = new Uint8Array(readFileSync(`${dir}/slope.bin`));
const nogo: NoGo | null = existsSync(`${dir}/nogo.geojson`)
  ? JSON.parse(readFileSync(`${dir}/nogo.geojson`, "utf8"))
  : null;
const zone: ZoneData = { meta, slope, nogo, pois: [], weather: null };

const { west, east, south, north } = meta.bounds;
const from: LonLat = [meta.base.lon, meta.base.lat];

// Destino: el primer POI de tipo "target"; si no hay, un punto al noreste.
let to: LonLat = [west + 0.8 * (east - west), south + 0.8 * (north - south)];
try {
  const pois = JSON.parse(readFileSync(`${dir}/pois.geojson`, "utf8"));
  const t = pois.features?.find((f: any) => f.properties?.type === "target");
  if (t?.geometry?.coordinates) to = t.geometry.coordinates as LonLat;
} catch {}

console.log(`malla ${meta.width}x${meta.height}, ${meta.metersPerPixel} m/px, fake=${meta.fake}`);
console.log(`pendiente: ${slope.length === meta.width * meta.height ? "OK" : "TAMAÑO NO COINCIDE"}`);
console.log(`zonas NO PISAR: ${nogo?.features.length ?? 0}`);
console.log(`destino: ${to[0].toFixed(5)}, ${to[1].toFixed(5)}\n`);

for (const mode of MODE_ORDER) {
  const t0 = performance.now();
  const r = findRoute(zone, from, to, mode);
  const ms = Math.round(performance.now() - t0);
  const ok = !r.straightLine && (r.maxSlopeDeg ?? 0) <= MODES[mode].maxSlopeDeg && ms < 1000;
  console.log(`${ok ? "PASS" : "FAIL"}  ${mode.padEnd(18)}`, {
    ms,
    puntos: r.path.length,
    distanciaM: Math.round(r.distanceM),
    minutos: Math.round(r.timeMin),
    pendienteMax: r.maxSlopeDeg,
    dosisMSv: +r.doseMSv.toFixed(3),
    recursoPct: Math.round(r.resourcePct),
    riesgo: r.risk,
    recta: r.straightLine,
    aviso: r.warning ?? "-",
  });
}

console.log("\nfuera de zona →", findRoute(zone, from, [east + 1, north + 1], "walk").warning ?? "SIN AVISO (mal)");