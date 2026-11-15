"use client";
// Dueño: P4. AppShell y el mapa solo usan este hook: P4 cambia el interior
// (Supabase + tiempo real, con localStorage de respaldo) sin tocar otros archivos.

import { useCallback, useState } from "react";
import type { NewNote, Note } from "@/lib/types";

// TEMPORAL: 2 notas de prueba para verificar el render en el mapa (P3). QUITAR antes de fusionar.
const SEED_NOTES: Note[] = [
  {
    id: "seed-1",
    author: "AST-1",
    lat: -4.772,
    lon: 137.365,
    title: "Veta mineral expuesta",
    note: "Estrato claro, posible yeso. Tomar muestra.",
    tags: ["MUESTRA", "GEOLOGIA"],
    sampleCode: "M-07",
    sol: 412,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-2",
    author: "AST-2",
    lat: -4.766,
    lon: 137.373,
    title: "Roca suelta al borde",
    note: "Cuidado: zona inestable junto al escarpe.",
    tags: ["PELIGRO"],
    sol: 412,
    createdAt: new Date().toISOString(),
  },
];

export function useNotes(): { notes: Note[]; addNote: (n: NewNote) => Promise<void> } {
  // PROVISIONAL: solo en memoria. Se pierde al recargar.
  const [notes, setNotes] = useState<Note[]>(SEED_NOTES);

  const addNote = useCallback(async (n: NewNote) => {
    setNotes((s) => [
      ...s,
      { ...n, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    ]);
  }, []);

  return { notes, addNote };
}
