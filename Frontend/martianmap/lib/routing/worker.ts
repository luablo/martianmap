// Dueño: P2 (Ruta). Web Worker: corre findRoute fuera del hilo de la interfaz.
import type { LonLat, ModeId, RouteResult, ZoneData } from "@/lib/types";
import { findRoute } from "./astar";

export type WorkerIn =
  | { type: "init"; zone: ZoneData }
  | { type: "route"; id: number; from: LonLat; to: LonLat; mode: ModeId };
export type WorkerOut = { id: number; route: RouteResult };

let zone: ZoneData | null = null;

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<WorkerIn>) => void) | null;
  postMessage: (m: WorkerOut) => void;
};

ctx.onmessage = (e) => {
  const msg = e.data;
  if (msg.type === "init") {
    zone = msg.zone; // se copia (clonado estructurado); el hilo principal conserva el suyo
    return;
  }
  if (!zone) return;
  ctx.postMessage({ id: msg.id, route: findRoute(zone, msg.from, msg.to, msg.mode) });
};