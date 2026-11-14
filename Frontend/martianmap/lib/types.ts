// Contrato compartido del equipo. Ver CONTEXTO.md §6.

export type LonLat = [lon: number, lat: number];

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

export type LayerId = "ortho" | "slope" | "radiation" | "thermal" | "mineral";

export type Provenance = "MEDIDO" | "DERIVADO" | "ESTIMADO";

export interface LayerDef {
  id: LayerId;
  label: string;
  source: string;
  provenance: Provenance;
  /** false mientras Datos no entregue el archivo */
  available: boolean;
}

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

/** public/data/gale/meta.json */
export interface ZoneMeta {
  width: number;
  height: number;
  metersPerPixel: number;
  bounds: { west: number; south: number; east: number; north: number };
  base: { lat: number; lon: number };
  sources: string[];
}
