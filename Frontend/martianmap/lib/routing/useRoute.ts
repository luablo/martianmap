"use client";
// Dueño: P2 (Ruta). AppShell solo llama a este hook: P2 puede cambiar todo lo de adentro
// (A*, Web Worker, caché) sin tocar ningún otro archivo, mientras devuelva RouteState.

import { useMemo } from "react";
import { pathLengthM } from "@/lib/geo";
import { computeMetrics } from "@/lib/metrics";
import { MODES } from "@/lib/modes";
import type { LonLat, ModeId, RouteState, ZoneData } from "@/lib/types";

export function useRoute(
  zone: ZoneData | null,
  from: LonLat | null,
  to: LonLat | null,
  mode: ModeId,
): RouteState {
  // PROVISIONAL: línea recta. Reemplazar por findRoute() de ./astar en un Web Worker:
  //   const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  const route = useMemo(() => {
    if (!zone || !from || !to) return null;
    const path: LonLat[] = [from, to];
    return {
      ...computeMetrics(pathLengthM(path), MODES[mode]),
      path,
      straightLine: true,
    };
  }, [zone, from, to, mode]);

  return { route, computing: false };
}
