"use client";

import Chip from "@/components/ui/Chip";
import Toggle from "@/components/ui/Toggle";
import { LAYERS } from "@/lib/modes";
import type { LayerId, Provenance } from "@/lib/types";

const tone: Record<Provenance, "safe" | "info" | "warn"> = {
  MEDIDO: "safe",
  DERIVADO: "info",
  ESTIMADO: "warn",
};

export default function LayerToggles({
  active,
  onChange,
}: {
  active: Record<LayerId, boolean>;
  onChange: (id: LayerId, on: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {LAYERS.map((l) => (
        <Toggle
          key={l.id}
          checked={l.available && active[l.id]}
          disabled={!l.available}
          onChange={(v) => onChange(l.id, v)}
        >
          <span className="block truncate text-sm font-semibold">{l.label}</span>
          <span className="mt-0.5 flex items-center gap-1.5">
            {l.available ? (
              <Chip tone={tone[l.provenance]}>{l.provenance}</Chip>
            ) : (
              <Chip>SIN DATOS</Chip>
            )}
            <span className="truncate font-mono text-[11px] text-ink-dim">{l.source}</span>
          </span>
        </Toggle>
      ))}
    </div>
  );
}
