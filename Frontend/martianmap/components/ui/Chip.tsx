type Tone = "neutral" | "route" | "info" | "safe" | "warn" | "danger" | "science";

const tones: Record<Tone, string> = {
  neutral: "border-line text-ink-dim",
  route: "border-route/40 text-route",
  info: "border-info/40 text-info",
  safe: "border-safe/40 text-safe",
  warn: "border-warn/40 text-warn",
  danger: "border-danger/50 text-danger",
  science: "border-science/40 text-science",
};

export default function Chip({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
