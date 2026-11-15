"use client";
// Dueño: P2 (desde el bloque 3). AppShell y el mapa solo usan este hook: P2 puede cambiar
// el interior sin tocar otros archivos, mientras devuelva { notes, addNote }.
//
// Cómo guarda:
//   1. Con llaves de Supabase (.env.local / Vercel): tabla `annotations` + fotos en el
//      bucket `field-photos` + tiempo real (postgres_changes). SQL en supabase/schema.sql.
//   2. Sin llaves o si Supabase falla: localStorage, con la misma forma. Entre pestañas del
//      mismo navegador también se sincroniza (evento `storage`). La demo nunca depende de la red.
//
// No dejes notas fijas aquí: una hora creada al cargar el módulo difiere entre servidor y
// navegador → error de hydration. Por eso todo se lee dentro de useEffect.

import { useCallback, useEffect, useState } from "react";
import type { NewNote, Note, NoteTag } from "@/lib/types";
import { supabase } from "./supabase";

const LS_KEY = "marswalk.notes.v1";
const BUCKET = "field-photos";

// ─── Fila de Supabase (snake_case) ↔ Note (camelCase) ───

interface Row {
  id: string;
  author: string;
  lat: number;
  lon: number;
  title: string;
  note: string | null;
  tags: string[] | null;
  photo_url: string | null;
  sample_code: string | null;
  sol: number | null;
  local_time: string | null;
  created_at: string;
}

function fromRow(r: Row): Note {
  return {
    id: r.id,
    author: r.author,
    lat: r.lat,
    lon: r.lon,
    title: r.title,
    note: r.note ?? undefined,
    tags: (r.tags ?? []) as NoteTag[],
    photoUrl: r.photo_url ?? undefined,
    sampleCode: r.sample_code ?? undefined,
    sol: r.sol ?? undefined,
    localTime: r.local_time ?? undefined,
    createdAt: r.created_at,
  };
}

function toRow(n: Note): Row {
  return {
    id: n.id,
    author: n.author,
    lat: n.lat,
    lon: n.lon,
    title: n.title,
    note: n.note ?? null,
    tags: n.tags,
    photo_url: n.photoUrl ?? null,
    sample_code: n.sampleCode ?? null,
    sol: n.sol ?? null,
    local_time: n.localTime ?? null,
    created_at: n.createdAt,
  };
}

// ─── localStorage (todo envuelto: en modo privado puede lanzar) ───

function readLocal(): Note[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as Note[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(notes: Note[]): boolean {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(notes));
    return true;
  } catch {
    return false; // lleno (fotos grandes) o bloqueado
  }
}

/** Une listas sin repetir id, de la más vieja a la más nueva. */
function merge(a: Note[], b: Note[]): Note[] {
  const byId = new Map<string, Note>();
  for (const n of [...a, ...b]) byId.set(n.id, n);
  return [...byId.values()].sort((x, y) => x.createdAt.localeCompare(y.createdAt));
}

/** Foto reducida a JPEG (≤ 800 px) como data URL: cabe en localStorage. */
async function shrinkPhoto(file: File, maxPx = 800, quality = 0.7): Promise<string | undefined> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxPx / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return undefined;
  }
}

/** Sube la foto al bucket y devuelve su URL pública; undefined si falla. */
async function uploadPhoto(id: string, file: File): Promise<string | undefined> {
  if (!supabase) return undefined;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${id}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  if (error) return undefined;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export function useNotes(): {
  notes: Note[];
  addNote: (n: NewNote, photo?: File | null) => Promise<void>;
} {
  const [notes, setNotes] = useState<Note[]>([]);

  // 1) Al montar: lo local primero (instantáneo) y luego Supabase + tiempo real.
  useEffect(() => {
    setNotes(readLocal());

    // Otra pestaña guardó una nota local → aparece aquí también.
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY) setNotes((s) => merge(s, readLocal()));
    };
    window.addEventListener("storage", onStorage);

    if (!supabase) return () => window.removeEventListener("storage", onStorage);
    const sb = supabase;
    let alive = true;

    sb.from("annotations")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (alive && !error && data) setNotes((s) => merge(s, (data as Row[]).map(fromRow)));
      });

    const channel = sb
      .channel("annotations-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "annotations" }, (payload) => {
        setNotes((s) => merge(s, [fromRow(payload.new as Row)]));
      })
      .subscribe();

    return () => {
      alive = false;
      window.removeEventListener("storage", onStorage);
      sb.removeChannel(channel);
    };
  }, []);

  // 2) Guardar: Supabase si se puede; si no, localStorage. La nota aparece al momento.
  const addNote = useCallback(async (n: NewNote, photo?: File | null) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    if (supabase) {
      const photoUrl = photo ? await uploadPhoto(id, photo) : undefined;
      const note: Note = { ...n, id, createdAt, ...(photoUrl ? { photoUrl } : {}) };
      const { error } = await supabase.from("annotations").insert(toRow(note));
      if (!error && (photoUrl || !photo)) {
        setNotes((s) => merge(s, [note])); // el eco del tiempo real trae el mismo id: no se duplica
        return;
      }
      if (!error) {
        // La nota se guardó pero la foto no subió: se muestra con la foto local.
        const local = await shrinkPhoto(photo!);
        setNotes((s) => merge(s, [{ ...note, ...(local ? { photoUrl: local } : {}) }]));
        return;
      }
      // Supabase falló: sigue abajo con el respaldo local.
    }

    const photoUrl = photo ? await shrinkPhoto(photo) : undefined;
    const note: Note = { ...n, id, createdAt, ...(photoUrl ? { photoUrl } : {}) };
    const all = merge(readLocal(), [note]);
    // Si no cabe con foto (localStorage ~5 MB), se guarda sin foto.
    if (!writeLocal(all) && photoUrl) writeLocal(merge(readLocal(), [{ ...note, photoUrl: undefined }]));
    setNotes((s) => merge(s, [note]));
  }, []);

  return { notes, addNote };
}
