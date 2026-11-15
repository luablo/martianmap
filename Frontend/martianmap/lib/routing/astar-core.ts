// lib/routing/astar-core.ts
// Núcleo puro del A*: sin React, sin tipos del repo. Trabaja con índices de celda.
// Convención: índice = fila * width + col, fila 0 = norte (igual que slope.bin).

export interface GridSearchInput {
  width: number;
  height: number;
  slope: Uint8Array; // grados por celda
  blocked: Uint8Array; // 1 = prohibido (pendiente > máx del modo o NO PISAR)
  cellM: number; // metros por celda
  start: number; // índice de celda
  goal: number; // índice de celda
  speedKmh: number;
  maxSlopeDeg: number;
}

export interface GridSearchResult {
  cells: number[]; // camino completo, de start a goal
  timeMin: number;
  distanceM: number;
  maxSlopeDeg: number;
}

class MinHeap {
  private k: number[] = [];
  private v: number[] = [];
  get size() {
    return this.k.length;
  }
  push(key: number, val: number) {
    const { k, v } = this;
    let i = k.length;
    k.push(key);
    v.push(val);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (k[p] <= key) break;
      k[i] = k[p];
      v[i] = v[p];
      i = p;
    }
    k[i] = key;
    v[i] = val;
  }
  pop(): number {
    const { k, v } = this;
    const top = v[0];
    const lk = k.pop()!;
    const lv = v.pop()!;
    const n = k.length;
    if (n > 0) {
      let i = 0;
      for (;;) {
        let c = 2 * i + 1;
        if (c >= n) break;
        if (c + 1 < n && k[c + 1] < k[c]) c++;
        if (k[c] >= lk) break;
        k[i] = k[c];
        v[i] = v[c];
        i = c;
      }
      k[i] = lk;
      v[i] = lv;
    }
    return top;
  }
}

const SQRT2 = Math.SQRT2;

/** Celda libre más cercana (búsqueda en anillos). -1 si no hay ninguna. */
export function nearestFree(
  blocked: Uint8Array,
  width: number,
  height: number,
  idx: number,
  maxRadius = 60,
): number {
  if (!blocked[idx]) return idx;
  const cx = idx % width;
  const cy = (idx / width) | 0;
  for (let r = 1; r <= maxRadius; r++) {
    let best = -1;
    let bestD = Infinity;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        const j = y * width + x;
        if (blocked[j]) continue;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      }
    }
    if (best >= 0) return best;
  }
  return -1;
}

export function astarGrid(inp: GridSearchInput): GridSearchResult | null {
  const { width, height, slope, blocked, cellM, start, goal, speedKmh, maxSlopeDeg } = inp;
  if (blocked[start] || blocked[goal]) return null;

  const mPerMin = (speedKmh * 1000) / 60; // velocidad máxima en m/min
  const D = cellM;
  const D2 = cellM * SQRT2;
  const gx = goal % width;
  const gy = (goal / width) | 0;

  // Costo (min) de entrar a la celda `to` recorriendo `stepM` metros.
  const stepCost = (to: number, stepM: number) => {
    const s = Math.min(slope[to], maxSlopeDeg);
    const f = 1 - 0.6 * (s / maxSlopeDeg); // 1 en plano, 0.4 en la pendiente máxima
    return stepM / (mPerMin * f);
  };

  // Heurística octil / velocidad máxima: admisible.
  const h = (i: number) => {
    const dx = Math.abs((i % width) - gx);
    const dy = Math.abs(((i / width) | 0) - gy);
    return (D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy)) / mPerMin;
  };

  const g = new Float32Array(width * height).fill(Infinity);
  const from = new Int32Array(width * height).fill(-1);
  const closed = new Uint8Array(width * height);
  const heap = new MinHeap();

  g[start] = 0;
  heap.push(h(start), start);

  while (heap.size > 0) {
    const cur = heap.pop();
    if (closed[cur]) continue; // entrada vieja del montículo
    closed[cur] = 1;
    if (cur === goal) break;

    const cx = cur % width;
    const cy = (cur / width) | 0;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const n = ny * width + nx;
        if (blocked[n] || closed[n]) continue;
        const diag = dx !== 0 && dy !== 0;
        // No cortar esquinas de celdas prohibidas en diagonal.
        if (diag && (blocked[cy * width + nx] || blocked[ny * width + cx])) continue;
        const ng = g[cur] + stepCost(n, diag ? D2 : D);
        if (ng < g[n]) {
          g[n] = ng;
          from[n] = cur;
          heap.push(ng + h(n), n);
        }
      }
    }
  }

  if (!closed[goal]) return null;

  const cells: number[] = [];
  for (let c = goal; c !== -1; c = from[c]) cells.push(c);
  cells.reverse();

  let distanceM = 0;
  let maxS = 0;
  for (let i = 0; i < cells.length; i++) {
    maxS = Math.max(maxS, slope[cells[i]]);
    if (i > 0) {
      const a = cells[i - 1];
      const b = cells[i];
      const diag = a % width !== b % width && ((a / width) | 0) !== ((b / width) | 0);
      distanceM += diag ? D2 : D;
    }
  }

  return { cells, timeMin: g[goal], distanceM, maxSlopeDeg: maxS };
}

/** Douglas–Peucker sobre índices de celda; epsilon en celdas. */
export function simplify(cells: number[], width: number, epsilon = 1.5): number[] {
  if (cells.length < 3) return cells;
  const px = (i: number) => cells[i] % width;
  const py = (i: number) => (cells[i] / width) | 0;
  const keep = new Uint8Array(cells.length);
  keep[0] = keep[cells.length - 1] = 1;
  const stack: [number, number][] = [[0, cells.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    let maxD = 0;
    let idx = -1;
    const ax = px(a), ay = py(a), bx = px(b), by = py(b);
    const len = Math.hypot(bx - ax, by - ay) || 1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((by - ay) * px(i) - (bx - ax) * py(i) + bx * ay - by * ax) / len;
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (idx !== -1 && maxD > epsilon) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return cells.filter((_, i) => keep[i]);
}