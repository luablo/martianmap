// CONTRATO COMPARTIDO DEL EQUIPO. Ver CONTEXTO.md §6 y TAREAS.md.
// Archivo congelado: solo se cambia en un punto de control, avisando en el chat.

import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";

export type LonLat = [lon: number, lat: number];

// ─── Modos de transporte (P2) ───────────────────────────────────────────────

export type ModeId = "walk" | "open_rover" | "pressurized_rover";

export interface TransportMode {
  id: ModeId;
  label: string;
  maxSlopeDeg: number;
  speedKmh: number;
  rangeKm: number;
  /** Qué se agota primero en este modo */
  resourceLabel: string;
  /** Horas de autonomía del recurso límite */
  autonomyH: number;
  /** 1 = sin blindaje, 0.5 = la mitad de la dosis */
  shielding: number;
}

// ─── Capas (P1 entrega datos, P3 las pinta, P4 los interruptores) ──────────

export type LayerId = "ortho" | "slope" | "radiation" | "thermal" | "mineral";

export type Provenance = "MEDIDO" | "DERIVADO" | "ESTIMADO";

export interface LayerDef {
  id: LayerId;
  label: string;
  source: string;
  provenance: Provenance;
}

// ─── Datos de la zona (P1) — public/data/gale/ ──────────────────────────────

/** public/data/gale/meta.json. width/height/metersPerPixel describen la malla de slope.bin. */
export interface ZoneMeta {
  width: number;
  height: number;
  metersPerPixel: number;
  bounds: { west: number; south: number; east: number; north: number };
  base: { lat: number; lon: number };
  sources: string[];
  /** true mientras sean datos sintéticos de scripts/fake-terrain.mjs */
  fake?: boolean;
  /** Qué archivos opcionales existen (ortho.webp, slope.png, thermal.png…) */
  files?: Partial<Record<LayerId, string>>;
}

export type PoiType = "base" | "target" | "pov";

export interface Poi {
  id: string;
  name: string;
  type: PoiType;
  lon: number;
  lat: number;
  /** Ruta dentro de /public, p. ej. "/data/gale/pov/0412-mastcam.jpg" */
  photo?: string;
  sol?: number;
  camera?: string;
  description?: string;
}

/** public/data/gale/weather.json (un sol de referencia de MSL REMS) */
export interface Weather {
  sol: number;
  tempMinC: number;
  tempMaxC: number;
  pressurePa: number;
  uv: string;
  source: string;
}

export type NoGo = FeatureCollection<Polygon | MultiPolygon, { reason?: string }>;

/** Todo lo que P1 entrega, ya cargado en memoria (lib/data/useZone.ts). */
export interface ZoneData {
  meta: ZoneMeta;
  /** Pendiente en grados, Uint8, fila por fila desde el norte. null si falta. */
  slope: Uint8Array | null;
  nogo: NoGo | null;
  pois: Poi[];
  weather: Weather | null;
}

// ─── Ruta (P2) ──────────────────────────────────────────────────────────────

export type Risk = "BAJO" | "MEDIO" | "ALTO";

export interface RouteMetrics {
  distanceM: number;
  /** Solo ida */
  timeMin: number;
  /** null mientras no haya ruteo real sobre la malla de pendiente */
  maxSlopeDeg: number | null;
  /** Ida y vuelta */
  doseMSv: number;
  /** % del recurso límite que queda al volver a la base */
  resourcePct: number;
  risk: Risk;
}

export interface RouteResult extends RouteMetrics {
  path: LonLat[];
  /** true = línea recta provisional, no evita nada */
  straightLine: boolean;
  /** Mensaje si no hay ruta posible o está fuera de alcance */
  warning?: string;
}

export interface RouteState {
  route: RouteResult | null;
  computing: boolean;
}

// ─── Notas de campo (P4) — tabla `annotations` en Supabase ─────────────────

export type NoteTag = "MUESTRA" | "GEOLOGIA" | "REVISAR" | "PELIGRO";

export interface Note {
  id: string;
  author: string;
  lat: number;
  lon: number;
  title: string;
  note?: string;
  tags: NoteTag[];
  photoUrl?: string;
  sampleCode?: string;
  sol?: number;
  localTime?: string;
  createdAt: string;
}

export type NewNote = Omit<Note, "id" | "createdAt">;
