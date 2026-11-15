"use client";
// Dueño: P2 (desde el bloque 3). AppShell y el mapa solo usan este hook: P2 cambia el
// interior (Supabase + tiempo real, con localStorage de respaldo) sin tocar otros archivos.
// Para probar notas en el mapa, créalas en la app con "+ NOTA": no dejes notas fijas aquí
// (una hora creada al cargar el módulo difiere entre servidor y navegador → error de hydration).

import { useCallback, useState } from "react";
import type { NewNote, Note } from "@/lib/types";

export function useNotes(): { notes: Note[]; addNote: (n: NewNote) => Promise<void> } {
  // PROVISIONAL: solo en memoria. Se pierde al recargar.
  const [notes, setNotes] = useState<Note[]>([]);

  const addNote = useCallback(async (n: NewNote) => {
    setNotes((s) => [
      ...s,
      { ...n, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    ]);
  }, []);

  return { notes, addNote };
}
