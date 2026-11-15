// Dueño: P4. Etiquetas de nota: el id es el del contrato (sin acento), label es lo que se ve.

import type { NoteTag } from "@/lib/types";

export const NOTE_TAGS: { id: NoteTag; label: string; danger?: boolean }[] = [
  { id: "MUESTRA", label: "MUESTRA" },
  { id: "GEOLOGIA", label: "GEOLOGÍA" },
  { id: "REVISAR", label: "REVISAR" },
  { id: "PELIGRO", label: "PELIGRO", danger: true },
];

export const TAG_LABEL = Object.fromEntries(NOTE_TAGS.map((t) => [t.id, t.label])) as Record<
  NoteTag,
  string
>;
