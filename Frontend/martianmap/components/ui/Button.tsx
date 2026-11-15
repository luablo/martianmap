// Dueño: P4. Botón base: todo lo tocable mide ≥ 56 px (clase `touch`).

type Variant = "solid" | "ghost" | "outline" | "panel" | "danger";

const variants: Record<Variant, { idle: string; active: string }> = {
  // Acción principal: turquesa lleno
  solid: {
    idle: "bg-route font-semibold text-bg-0 active:bg-route/80",
    active: "bg-route font-semibold text-bg-0",
  },
  // Fila de una lista (modos, opciones): sin borde hasta que está activa
  ghost: {
    idle: "border border-transparent text-ink active:bg-line/60",
    active: "border border-route bg-route/15 text-route",
  },
  // Botón secundario con borde (iconos, expandir)
  outline: {
    idle: "border border-line text-ink-dim active:bg-line/60",
    active: "border border-route text-route",
  },
  // Botón flotante sobre el mapa, con el vidrio de `.panel`
  panel: {
    idle: "panel pointer-events-auto text-ink",
    active: "panel pointer-events-auto text-route",
  },
  // Acción destructiva o de peligro
  danger: {
    idle: "bg-danger font-semibold text-white active:bg-danger/80",
    active: "bg-danger font-semibold text-white",
  },
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  /** Estado seleccionado/encendido: cambia el color, no el tamaño. */
  active?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

export default function Button({
  variant = "ghost",
  active = false,
  type = "button",
  className = "",
  ...rest
}: ButtonProps) {
  const tone = active ? variants[variant].active : variants[variant].idle;
  return (
    <button
      type={type}
      className={`touch rounded-xl transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45 ${tone} ${className}`}
      {...rest}
    />
  );
}
