// Dueño: P4. Lista de notas de campo, la más reciente arriba (panel derecho, ≥ 1024 px).

import Chip from "@/components/ui/Chip";
import { TAG_LABEL } from "@/components/panels/noteTags";
import type { Note } from "@/lib/types";

export default function NotesList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <p className="px-3 pb-3 text-sm text-ink-dim">
        Aún no hay notas. Usa <span className="font-semibold text-science">+ NOTA</span> y toca el
        mapa donde está el hallazgo.
      </p>
    );
  }

  const sorted = [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto px-1.5 pb-1.5">
      {sorted.map((n) => (
        <li key={n.id} className="flex gap-3 rounded-xl px-2 py-2">
          {n.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- la foto viene de Supabase Storage
            <img src={n.photoUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover" />
          ) : (
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-science" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink">{n.title}</div>
            {n.note && <p className="line-clamp-2 text-xs text-ink-dim">{n.note}</p>}
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {n.tags.map((t) => (
                <Chip key={t} tone={t === "PELIGRO" ? "danger" : "science"}>
                  {TAG_LABEL[t]}
                </Chip>
              ))}
              <span className="font-mono text-[10px] text-ink-dim">
                {n.sol !== undefined && `SOL ${n.sol}`}
                {n.localTime && ` · ${n.localTime}`}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
