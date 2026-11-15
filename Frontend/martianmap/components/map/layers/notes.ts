// Dueño: P3. Notas de campo en el mapa (prop `notes`, de useNotes de P2).
//
// Cada nota es un marcador morado (ciencia) con icono; al tocarlo abre una tarjeta
// con título, texto, foto y etiquetas. syncNoteMarkers añade/actualiza/quita los
// marcadores reactivamente (para el tiempo real cuando P2 cable Supabase).

import { Map as MlMap, Marker, Popup } from "maplibre-gl";
import type { Note } from "@/lib/types";

// SVG estático (seguro para innerHTML): icono de "nota".
const NOTE_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h11l5 5v11H4z"/><path d="M15 4v5h5"/></svg>';

function noteMarkerEl() {
  const el = document.createElement("div");
  el.className = "marker-note";
  el.innerHTML = NOTE_ICON;
  return el;
}

/** Tarjeta de una nota (título, texto, foto, etiquetas, meta). Todo con textContent. */
function noteCardEl(note: Note) {
  const el = document.createElement("div");
  el.className = "note-card";

  const title = document.createElement("div");
  title.className = "note-card-title";
  title.textContent = note.title;
  el.append(title);

  if (note.note) {
    const body = document.createElement("div");
    body.className = "note-card-body";
    body.textContent = note.note;
    el.append(body);
  }

  if (note.photoUrl) {
    const img = document.createElement("img");
    img.className = "note-card-photo";
    img.src = note.photoUrl;
    img.alt = note.title;
    el.append(img);
  }

  if (note.tags.length) {
    const tags = document.createElement("div");
    tags.className = "note-card-tags";
    for (const t of note.tags) {
      const chip = document.createElement("span");
      chip.className = "note-card-tag";
      chip.textContent = t;
      tags.append(chip);
    }
    el.append(tags);
  }

  const meta = document.createElement("div");
  meta.className = "note-card-meta";
  meta.textContent = [note.author, note.sampleCode, note.sol != null ? `Sol ${note.sol}` : null]
    .filter(Boolean)
    .join(" · ");
  el.append(meta);

  return el;
}

/**
 * Sincroniza los marcadores de notas con la lista `notes`: añade nuevos, actualiza
 * los que cambiaron (posición y tarjeta) y quita los que ya no están.
 */
export function syncNoteMarkers(map: MlMap, markers: Map<string, Marker>, notes: Note[]) {
  const seen = new Set<string>();
  for (const note of notes) {
    seen.add(note.id);
    let m = markers.get(note.id);
    if (!m) {
      m = new Marker({ element: noteMarkerEl(), anchor: "center" })
        .setLngLat([note.lon, note.lat])
        .setPopup(
          new Popup({ closeButton: true, maxWidth: "280px" }).setDOMContent(noteCardEl(note)),
        )
        .addTo(map);
      markers.set(note.id, m);
    } else {
      m.setLngLat([note.lon, note.lat]);
      m.getPopup()?.setDOMContent(noteCardEl(note));
    }
  }
  for (const [id, m] of markers) {
    if (!seen.has(id)) {
      m.remove();
      markers.delete(id);
    }
  }
}
