// Dueño: P1 (Datos). Lee lo que hay en public/data/gale/ y lo deja listo en memoria.
import type { NoGo, Poi, Weather, ZoneData, ZoneMeta } from "@/lib/types";

export const ZONE_URL = "/data/gale";

async function json<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url);
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

async function bytes(url: string): Promise<Uint8Array | null> {
  try {
    const r = await fetch(url);
    return r.ok ? new Uint8Array(await r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

/** meta.json es obligatorio; el resto es opcional y vale null/[] si falta. */
export async function loadZone(base = ZONE_URL): Promise<ZoneData> {
  const meta = await json<ZoneMeta>(`${base}/meta.json`);
  if (!meta) throw new Error(`No se pudo leer ${base}/meta.json`);

  const [slope, nogo, pois, weather] = await Promise.all([
    bytes(`${base}/slope.bin`),
    json<NoGo>(`${base}/nogo.geojson`),
    json<{ features: { properties: Omit<Poi, "lon" | "lat">; geometry: { coordinates: [number, number] } }[] }>(
      `${base}/pois.geojson`,
    ),
    json<Weather>(`${base}/weather.json`),
  ]);

  if (slope && slope.length !== meta.width * meta.height) {
    console.warn(
      `slope.bin mide ${slope.length} bytes; meta.json dice ${meta.width}×${meta.height}`,
    );
  }

  return {
    meta,
    slope,
    nogo,
    pois:
      pois?.features.map((f) => ({
        ...f.properties,
        lon: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
      })) ?? [],
    weather,
  };
}
