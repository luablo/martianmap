"use client";
// Dueño: P1 (Datos).
import { useEffect, useState } from "react";
import type { ZoneData } from "@/lib/types";
import { loadZone } from "./zone";

export function useZone(): { zone: ZoneData | null; error: string | null } {
  const [state, setState] = useState<{ zone: ZoneData | null; error: string | null }>({
    zone: null,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    loadZone()
      .then((zone) => alive && setState({ zone, error: null }))
      .catch((e: Error) => alive && setState({ zone: null, error: e.message }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
