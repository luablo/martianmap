// MapLibre 6 busca su worker junto a su propio archivo, y el empaquetador rompe
// esa ruta. Lo copiamos a /public y lo apuntamos con setWorkerUrl (MapView.tsx).
// También se copia su .map: el worker termina con "sourceMappingURL=...mjs.map" y,
// sin él, el navegador lo pide igual y el servidor responde 404 en cada carga.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";

const SRC = "node_modules/maplibre-gl/dist";
const DEST = "public/maplibre";

mkdirSync(DEST, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-worker.mjs.map"]) {
  if (existsSync(`${SRC}/${file}`)) copyFileSync(`${SRC}/${file}`, `${DEST}/${file}`);
}
