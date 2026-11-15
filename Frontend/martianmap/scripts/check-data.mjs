// Revisa que public/data/gale cumpla el contrato de lib/types.ts antes de compilar.
// Corre solo en `npm run build` (prebuild): si alguien sube datos que la app no puede
// leer, el deploy de Vercel falla aquí con un mensaje claro en vez de publicar una
// app que muestra la pantalla de error.
//   npm run check-data
import { readFileSync, statSync, existsSync } from "node:fs";

const DIR = "public/data/gale";
const errors = [];
const fail = (msg) => errors.push(msg);

function json(name) {
  try {
    return JSON.parse(readFileSync(`${DIR}/${name}`, "utf8"));
  } catch (e) {
    fail(`${name}: no se puede leer como JSON (${e.message})`);
    return null;
  }
}

/** Ancho y alto de un PNG, leídos de su encabezado IHDR. */
function pngSize(name) {
  const b = readFileSync(`${DIR}/${name}`);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

const num = (v) => typeof v === "number" && Number.isFinite(v);

// meta.json
const meta = json("meta.json");
if (meta) {
  for (const k of ["width", "height", "metersPerPixel"]) {
    if (!num(meta[k])) fail(`meta.json: falta "${k}" numérico`);
  }
  const b = meta.bounds ?? {};
  for (const k of ["west", "south", "east", "north"]) {
    if (!num(b[k])) fail(`meta.json: falta bounds.${k}`);
  }
  if (!(b.west < b.east && b.south < b.north)) fail("meta.json: bounds al revés");

  const inside = ([lon, lat]) => lon >= b.west && lon <= b.east && lat >= b.south && lat <= b.north;
  if (!meta.base || !inside([meta.base.lon, meta.base.lat])) {
    fail("meta.json: la base queda fuera de bounds");
  }
  if (!Array.isArray(meta.sources) || meta.sources.some((s) => typeof s !== "string")) {
    fail('meta.json: "sources" debe ser una lista de textos (la hoja "i" los muestra tal cual)');
  }

  const slopeBytes = existsSync(`${DIR}/slope.bin`) ? statSync(`${DIR}/slope.bin`).size : 0;
  if (slopeBytes !== meta.width * meta.height) {
    fail(
      `slope.bin mide ${slopeBytes} bytes, pero meta.json dice ${meta.width}×${meta.height} = ${meta.width * meta.height}`,
    );
  }

  for (const [layer, file] of Object.entries(meta.files ?? {})) {
    if (!existsSync(`${DIR}/${file}`)) fail(`meta.json: files.${layer} apunta a ${file}, que no existe`);
  }
  if (meta.files?.slope?.endsWith(".png") && existsSync(`${DIR}/${meta.files.slope}`)) {
    const s = pngSize(meta.files.slope);
    if (s.width !== meta.width || s.height !== meta.height) {
      fail(`${meta.files.slope} mide ${s.width}×${s.height}, pero meta.json dice ${meta.width}×${meta.height}`);
    }
  }

  // Puntos de interés: todos dentro de la zona, si no la ruta no los alcanza.
  const pois = json("pois.geojson");
  for (const f of pois?.features ?? []) {
    if (f.geometry?.type === "Point" && !inside(f.geometry.coordinates)) {
      fail(`pois.geojson: "${f.properties?.name ?? f.properties?.id}" queda fuera de bounds`);
    }
  }
}

json("nogo.geojson");

// weather.json
const weather = json("weather.json");
if (weather) {
  for (const k of ["sol", "tempMinC", "tempMaxC", "pressurePa"]) {
    if (!num(weather[k])) fail(`weather.json: falta "${k}" numérico`);
  }
  for (const k of ["uv", "source"]) {
    if (typeof weather[k] !== "string") fail(`weather.json: falta "${k}" como texto`);
  }
}

if (errors.length) {
  console.error(`\n✗ Datos de ${DIR} no cumplen el contrato (lib/types.ts):`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}
console.log(`✓ Datos de ${DIR} OK (${meta.width}×${meta.height} celdas)`);
