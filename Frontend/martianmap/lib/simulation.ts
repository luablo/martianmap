"use client";
// Dueño: P4. Simulación de la EVA: el astronauta (o el rover) sale de la base, sigue la
// ruta hasta el destino, se detiene a muestrear y regresa por el mismo camino.
//
// Es una animación acelerada. Los números que se van llenando (tiempo de misión, dosis,
// recurso) se reparten en proporción al avance y terminan exactamente en las métricas
// de la ruta (ida y vuelta), así que la simulación nunca contradice la barra de métricas.

import { useCallback, useEffect, useRef, useState } from "react";
import { distanceM } from "./geo";
import type { LonLat, RouteResult } from "./types";

export type SimPhase = "out" | "at" | "back" | "done";

export interface SimState {
  /** La ruta que se está simulando (si la ruta cambia, la simulación deja de valer). */
  route: RouteResult;
  pos: LonLat;
  phase: SimPhase;
  /** 0 → 1 en todo el recorrido (ida + muestreo + regreso) */
  progress: number;
  /** Minutos de misión transcurridos (0 → ida y vuelta) */
  missionMin: number;
  /** Metros recorridos (0 → 2 × distancia) */
  coveredM: number;
  /** % del recurso que queda (100 → resourcePct de la ruta) */
  resourcePct: number;
  /** Dosis acumulada (0 → doseMSv de la ruta) */
  doseMSv: number;
}

/** Duraciones reales de la animación, en milisegundos. */
const PAUSE_MS = 1500;
const legMs = (distance: number) => Math.min(9000, Math.max(4000, 3000 + distance * 2));

/** Punto a una distancia `d` a lo largo del camino (distancias acumuladas `cum`). */
function pointAt(path: LonLat[], cum: number[], d: number): LonLat {
  if (d <= 0) return path[0];
  const total = cum[cum.length - 1];
  if (d >= total) return path[path.length - 1];
  let i = 1;
  while (cum[i] < d) i++;
  const seg = cum[i] - cum[i - 1];
  const t = seg === 0 ? 0 : (d - cum[i - 1]) / seg;
  return [
    path[i - 1][0] + (path[i][0] - path[i - 1][0]) * t,
    path[i - 1][1] + (path[i][1] - path[i - 1][1]) * t,
  ];
}

export function useSimulation(route: RouteResult | null) {
  const [state, setState] = useState<SimState | null>(null);
  const raf = useRef(0);

  // Si cambia la ruta (otro destino u otro modo) se corta la animación en curso.
  useEffect(() => () => cancelAnimationFrame(raf.current), [route]);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setState(null);
  }, []);

  const start = useCallback(() => {
    if (!route || route.path.length < 2) return;
    cancelAnimationFrame(raf.current);

    const path = route.path;
    const cum = [0];
    for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + distanceM(path[i - 1], path[i]));
    const total = cum[cum.length - 1];
    const leg = legMs(total);
    const totalMs = leg * 2 + PAUSE_MS;
    const roundTripMin = route.timeMin * 2;
    const t0 = performance.now();

    const frame = (now: number) => {
      const ms = Math.min(now - t0, totalMs);
      let phase: SimPhase;
      let travelled: number; // 0 → 1 del trayecto de ida y vuelta (sin la pausa)
      let pos: LonLat;
      if (ms < leg) {
        phase = "out";
        travelled = (ms / leg) / 2;
        pos = pointAt(path, cum, (ms / leg) * total);
      } else if (ms < leg + PAUSE_MS) {
        phase = "at";
        travelled = 0.5;
        pos = path[path.length - 1];
      } else {
        const f = (ms - leg - PAUSE_MS) / leg;
        phase = ms >= totalMs ? "done" : "back";
        travelled = 0.5 + Math.min(1, f) / 2;
        pos = pointAt(path, cum, (1 - Math.min(1, f)) * total);
      }

      setState({
        route,
        pos,
        phase,
        progress: ms / totalMs,
        missionMin: travelled * roundTripMin,
        coveredM: travelled * total * 2,
        resourcePct: 100 - (100 - route.resourcePct) * travelled,
        doseMSv: route.doseMSv * travelled,
      });
      if (ms < totalMs) raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
  }, [route]);

  // Solo vale para la ruta actual: si la ruta cambió, no hay simulación.
  const active = state && state.route === route ? state : null;
  return { sim: active, start, stop };
}
