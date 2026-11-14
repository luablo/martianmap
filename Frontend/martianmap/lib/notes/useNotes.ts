"use client";
// Dueño: P4. AppShell y el mapa solo usan este hook: P4 cambia el interior
// (Supabase + tiempo real, con localStorage de respaldo) sin tocar otros archivos.

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
