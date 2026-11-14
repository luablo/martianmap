// Dueño: P2 (Ruta).
import type { ModeId, TransportMode } from "./types";

// SUPUESTOS DEL EQUIPO, no datos de NASA. Declararlos en la app y la presentación.
export const MODES: Record<ModeId, TransportMode> = {
  walk: {
    id: "walk",
    label: "A pie",
    maxSlopeDeg: 15,
    speedKmh: 3,
    rangeKm: 2,
    resourceLabel: "Oxígeno",
    autonomyH: 8,
    shielding: 1,
  },
  open_rover: {
    id: "open_rover",
    label: "Rover abierto",
    maxSlopeDeg: 25,
    speedKmh: 10,
    rangeKm: 20,
    resourceLabel: "Batería",
    autonomyH: 4,
    shielding: 1,
  },
  pressurized_rover: {
    id: "pressurized_rover",
    label: "Presurizado",
    maxSlopeDeg: 18,
    speedKmh: 14,
    rangeKm: 100,
    resourceLabel: "Autonomía",
    autonomyH: 72,
    shielding: 0.5,
  },
};

export const MODE_ORDER: ModeId[] = ["walk", "open_rover", "pressurized_rover"];

/** Tasa promedio en superficie de Gale (MSL RAD). P1 confirma la cifra con la fuente. */
export const RAD_MSV_PER_DAY = 0.67;

/** Reserva mínima del recurso al volver a la base */
export const RESERVE_PCT = 20;
