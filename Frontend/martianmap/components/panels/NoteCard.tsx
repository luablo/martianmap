"use client";
// Dueño: P4. Formulario de nota de campo. Ubicación, sol y hora se llenan solos;
// guardar llama a onSave (AppShell → addNote de useNotes, cuyo interior es de P2).

import { useEffect, useId, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { NOTE_TAGS } from "@/components/panels/noteTags";
import type { LonLat, NewNote, NoteTag } from "@/lib/types";

export default function NoteCard({
  at,
  sol,
  onSave,
  onCancel,
}: {
  at: LonLat;
  sol: number;
  /** La foto va aparte: se sube antes de guardar la nota (P2, bloque 3). */
  onSave: (note: NewNote, photo: File | null) => Promise<void>;
  onCancel: () => void;
}) {
  const ids = useId();
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState<NoteTag[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Miniatura de la foto; se libera al cambiarla o al cerrar la tarjeta.
  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  // Esc cierra la tarjeta (salvo mientras guarda).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, saving]);

  const toggleTag = (t: NoteTag) =>
    setTags((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(
        {
          author: "EVA 07",
          lon: at[0],
          lat: at[1],
          title: title.trim(),
          note: text.trim() || undefined,
          tags,
          sol,
          localTime: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        },
        photo,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("No se pudo guardar la nota."));
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      aria-labelledby={`${ids}-h`}
      className="panel pointer-events-auto flex min-h-0 flex-col overflow-hidden bg-surface"
    >
      <header className="flex items-center gap-2 border-b border-line py-1.5 pl-4 pr-1.5">
        <div className="min-w-0 flex-1">
          <h2 id={`${ids}-h`} className="font-mono text-[11px] font-semibold tracking-widest text-science">
            {t("NUEVA NOTA DE CAMPO")}
          </h2>
          <p className="truncate font-mono text-[11px] tabular-nums text-ink-dim">
            {at[1].toFixed(5)}°, {at[0].toFixed(5)}° · SOL {sol}
          </p>
        </div>
        <Button variant="outline" onClick={onCancel} disabled={saving} aria-label={t("Cancelar nota")} className="grid place-items-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </Button>
      </header>

      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] tracking-wider text-ink-dim">{t("TÍTULO *")}</span>
          <input
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder={t("Ej. Veta clara en la cresta")}
            className="touch rounded-xl border border-line bg-bg-0/60 px-3 text-base text-ink placeholder:text-ink-dim focus:border-route focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] tracking-wider text-ink-dim">{t("NOTA")}</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder={t("Qué viste, dónde exactamente, qué hay que revisar")}
            className="resize-none rounded-xl border border-line bg-bg-0/60 px-3 py-3 text-base text-ink placeholder:text-ink-dim focus:border-route focus:outline-none"
          />
        </label>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 font-mono text-[11px] tracking-wider text-ink-dim">{t("ETIQUETAS")}</legend>
          <div className="grid grid-cols-2 gap-1.5">
            {NOTE_TAGS.map(({ id, label, danger }) => {
              const on = tags.includes(id);
              return (
                <Button
                  key={id}
                  variant="outline"
                  active={on}
                  aria-pressed={on}
                  onClick={() => toggleTag(id)}
                  className={`px-3 font-mono text-xs font-semibold tracking-wider ${
                    on && danger ? "border-danger! text-danger!" : ""
                  }`}
                >
                  {t(label)}
                </Button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] tracking-wider text-ink-dim">{t("FOTO")}</span>
          {preview ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob local, no pasa por next/image */}
              <img src={preview} alt={t("Vista previa de la foto")} className="h-20 w-28 rounded-lg border border-line object-cover" />
              <Button variant="outline" onClick={() => setPhoto(null)} className="px-4 text-sm">
                {t("Quitar")}
              </Button>
            </div>
          ) : (
            <label className="touch flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line text-sm text-ink-dim focus-within:ring-2 focus-within:ring-route active:bg-line/60">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7l1.5-3h5L16 7" />
                <circle cx="12" cy="13.5" r="3.5" />
              </svg>
              {t("Tomar o elegir foto")}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </label>
          )}
        </div>

        {error && (
          <p role="alert" className="font-mono text-xs text-danger">
            {error}
          </p>
        )}
      </div>

      <footer className="flex gap-2 border-t border-line p-3">
        <Button variant="outline" onClick={onCancel} disabled={saving} className="flex-1 px-4">
          {t("Cancelar")}
        </Button>
        <Button type="submit" variant="solid" disabled={!title.trim() || saving} className="flex-[2] px-4">
          {saving ? t("Guardando…") : t("Guardar nota")}
        </Button>
      </footer>
    </form>
  );
}
