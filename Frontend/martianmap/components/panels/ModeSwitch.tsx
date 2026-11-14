"use client";

import Button from "@/components/ui/Button";
import { MODES, MODE_ORDER } from "@/lib/modes";
import type { ModeId } from "@/lib/types";

const icons: Record<ModeId, React.ReactNode> = {
  walk: (
    <>
      <circle cx="13" cy="4.5" r="2" />
      <path d="M13 8.5 10 12l1 4-2 5M13 8.5l3 3 3 1M11 16l4 2 1 3M10 12l-3 1" />
    </>
  ),
  open_rover: (
    <>
      <path d="M3 15h18M5 15l2-5h8l4 5M9 10V7" />
      <circle cx="7" cy="18" r="2.2" />
      <circle cx="17" cy="18" r="2.2" />
    </>
  ),
  pressurized_rover: (
    <>
      <rect x="3" y="6" width="18" height="9" rx="3" />
      <path d="M7 9.5h4M15 9.5h2" />
      <circle cx="7" cy="18" r="2.2" />
      <circle cx="12" cy="18" r="2.2" />
      <circle cx="17" cy="18" r="2.2" />
    </>
  ),
};

export default function ModeSwitch({
  mode,
  onChange,
}: {
  mode: ModeId;
  onChange: (m: ModeId) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Modo de transporte" className="flex flex-col gap-1.5">
      {MODE_ORDER.map((id) => {
        const m = MODES[id];
        const active = id === mode;
        return (
          <Button
            key={id}
            role="radio"
            aria-checked={active}
            active={active}
            onClick={() => onChange(id)}
            className="flex items-center gap-3 px-3 text-left"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
              {icons[id]}
            </svg>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{m.label}</span>
              <span className="block font-mono text-[11px] text-ink-dim">
                {m.speedKmh} km/h · máx {m.maxSlopeDeg}°
              </span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}
