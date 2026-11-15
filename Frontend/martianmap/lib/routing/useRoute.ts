"use client";
// Dueño: P2 (Ruta). AppShell solo llama a este hook: P2 puede cambiar todo lo de adentro
// (A*, Web Worker, caché) sin tocar ningún otro archivo, mientras devuelva RouteState.

import { useEffect, useRef, useState } from "react";
import type { LonLat, ModeId, RouteResult, RouteState, ZoneData } from "@/lib/types";
import { findRoute } from "./astar";
import type { WorkerOut } from "./worker";

export function useRoute(
  zone: ZoneData | null,
  from: LonLat | null,
  to: LonLat | null,
  mode: ModeId,
): RouteState {
  const workerRef = useRef<Worker | null>(null);
  const reqId = useRef(0);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [computing, setComputing] = useState(false);
  const [failed, setFailed] = useState(false);

  // 1) Crear el worker (solo en el cliente, dentro de un efecto: evita "window is not defined").
  useEffect(() => {
    let w: Worker | null = null;
    try {
      w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
      w.onmessage = (e: MessageEvent<WorkerOut>) => {
        if (e.data.id !== reqId.current) return; // respuesta vieja: se descarta
        setRoute(e.data.route);
        setComputing(false);
      };
      w.onerror = () => setFailed(true); // plan B: calcular en el hilo principal
    } catch {
      w = null;
      setFailed(true);
    }
    workerRef.current = w;
    return () => {
      w?.terminate();
      workerRef.current = null;
    };
  }, []);

  // 2) Mandar la zona al worker una vez por zona.
  useEffect(() => {
    if (zone) workerRef.current?.postMessage({ type: "init", zone });
  }, [zone]);

  // 3) Pedir la ruta. Se conserva la última válida mientras llega la nueva.
  useEffect(() => {
    if (!zone || !from || !to) {
      reqId.current++;
      setRoute(null);
      setComputing(false);
      return;
    }
    const id = ++reqId.current;
    setComputing(true);

    const w = workerRef.current;
    if (w && !failed) {
      w.postMessage({ type: "route", id, from, to, mode });
      return;
    }
    const t = setTimeout(() => {
      if (id !== reqId.current) return;
      setRoute(findRoute(zone, from, to, mode));
      setComputing(false);
    }, 0);
    return () => clearTimeout(t);
  }, [zone, from, to, mode, failed]);

  return { route, computing };
}