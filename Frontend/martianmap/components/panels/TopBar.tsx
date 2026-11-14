import Chip from "@/components/ui/Chip";

export default function TopBar() {
  return (
    <header className="panel pointer-events-auto flex items-center gap-2 p-2">
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-bg-0/60 px-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-ink-dim" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        {/* Buscador de destinos: se conecta a pois.geojson cuando Datos lo entregue */}
        <input
          type="search"
          placeholder="¿A dónde vamos?"
          className="touch w-full min-w-0 bg-transparent text-base text-ink placeholder:text-ink-dim focus:outline-none"
        />
      </label>
      <div className="flex shrink-0 items-center gap-1.5 pr-1">
        <Chip>SOL 412</Chip>
        <span className="hidden sm:contents">
          <Chip>EVA 07</Chip>
        </span>
        <Chip tone="safe">ENLACE OK</Chip>
      </div>
    </header>
  );
}
