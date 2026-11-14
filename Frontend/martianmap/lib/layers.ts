// Dueño: P1 (Datos). Catálogo de capas: qué son, de dónde salen y qué tan confiables.
import type { LayerDef, LayerId, ZoneData } from "./types";

export const LAYERS: LayerDef[] = [
  { id: "ortho", label: "Imagen HiRISE", source: "MRO HiRISE", provenance: "MEDIDO" },
  { id: "slope", label: "Pendiente", source: "DEM 1 m", provenance: "DERIVADO" },
  { id: "radiation", label: "Radiación", source: "MSL RAD", provenance: "ESTIMADO" },
  { id: "thermal", label: "Térmico", source: "THEMIS", provenance: "MEDIDO" },
  { id: "mineral", label: "Mineralogía", source: "CRISM", provenance: "MEDIDO" },
];

/** Una capa está disponible si su archivo existe en meta.json → files (o, para pendiente, si cargó slope.bin). */
export function layerAvailable(zone: ZoneData | null, id: LayerId): boolean {
  if (!zone) return false;
  if (id === "slope") return zone.slope !== null || !!zone.meta.files?.slope;
  if (id === "radiation") return true; // es una tasa, no un ráster: siempre se puede mostrar
  return !!zone.meta.files?.[id];
}
