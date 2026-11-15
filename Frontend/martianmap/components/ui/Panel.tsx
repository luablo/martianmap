// Dueño: P4. Panel flotante sobre el mapa (vidrio de `.panel`) con título opcional.

import { useId } from "react";

export default function Panel({
  title,
  className = "",
  children,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={`panel pointer-events-auto p-1.5 ${className}`}
    >
      {title && (
        <h2
          id={titleId}
          className="px-3 pb-1 pt-2 font-mono text-[11px] font-semibold tracking-widest text-ink-dim"
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
