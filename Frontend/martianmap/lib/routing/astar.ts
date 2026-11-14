// Dueño: P2 (Ruta). Función pura: sin React, sin DOM. Se puede probar con node.
import type { LonLat, ModeId, RouteResult, ZoneData } from "@/lib/types";

/**
 * A* sobre la malla de slope.bin, 8 vecinos.
 * costo(celda) = distancia / velocidad_real(pendiente, modo); celdas sobre la
 * pendiente máxima del modo o dentro de nogo = infranqueables.
 * Ver CONTEXTO.md §5 y §6.
 */
export function findRoute(
  zone: ZoneData,
  from: LonLat,
  to: LonLat,
  mode: ModeId,
): RouteResult | null {
  void zone;
  void from;
  void to;
  void mode;
  throw new Error("findRoute: pendiente de implementar (P2)");
}
