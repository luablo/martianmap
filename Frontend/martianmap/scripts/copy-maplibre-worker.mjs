// MapLibre 6 busca su worker junto a su propio archivo, y el empaquetador rompe
// esa ruta. Lo copiamos a /public y lo apuntamos con setWorkerUrl (MapView.tsx).
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public/maplibre", { recursive: true });
copyFileSync(
  "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs",
  "public/maplibre/maplibre-gl-worker.mjs",
);
