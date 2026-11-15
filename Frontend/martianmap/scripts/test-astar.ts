import { astarGrid } from "../lib/routing/astar-core";

const W = 50, H = 50;
const slope = new Uint8Array(W * H);
// Muro de 40° en la columna 25, con un hueco en la fila 5
for (let y = 0; y < H; y++) if (y !== 5) slope[y * W + 25] = 40;
const blocked = slope.map((s) => (s > 15 ? 1 : 0)); // límite de a pie

const r = astarGrid({
  width: W, height: H, slope, blocked, cellM: 4,
  start: 40 * W + 5, goal: 40 * W + 45,
  speedKmh: 3, maxSlopeDeg: 15,
});

console.log(
  r
    ? {
        celdas: r.cells.length,
        distanciaM: Math.round(r.distanceM),
        minutos: r.timeMin.toFixed(1),
        pasaPorHueco: r.cells.includes(5 * W + 25),
      }
    : "SIN RUTA",
);