"use client";

export default function Toggle({
  checked,
  onChange,
  disabled,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="touch flex w-full items-center gap-3 rounded-xl px-3 text-left transition-colors duration-150 active:bg-line/60 disabled:opacity-45"
    >
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-150 ${
          checked ? "border-route bg-route/25" : "border-line bg-bg-0"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5.5 w-5.5 rounded-full transition-all duration-150 ${
            checked ? "left-[22px] bg-route" : "left-0.5 bg-ink-dim"
          }`}
        />
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}
