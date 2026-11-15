// Dueño: P4. Graba las capturas de la lista de tomas (guion.md §3) sin tocar el mouse.
// Abre Chrome sin ventana a 1920×1080, repite cada toma desde cero y guarda PNG en
// presentacion/capturas/. Sin dependencias: usa el protocolo de DevTools con el
// WebSocket que ya trae Node ≥ 22.
//
//   node presentacion/capturar.mjs                       → http://localhost:3000
//   node presentacion/capturar.mjs https://<app>.vercel.app
//
// Para la versión final: correrlo contra la URL de Vercel con los datos reales de P1
// (así las capturas salen sin el aviso "TERRENO SINTÉTICO").

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const URL_APP = process.argv[2] ?? "http://localhost:3000";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "capturas");
const PORT = 9333;
const CHROMES = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Chrome + DevTools ────────────────────────────────────────────────────────
const exe = CHROMES.find((p) => existsSync(p));
if (!exe) throw new Error("No encontré Chrome ni Edge. Pon la ruta en la variable CHROME.");
const profile = mkdtempSync(join(tmpdir(), "marswalk-cap-"));
const chrome = spawn(exe, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--window-size=1920,1080",
  "--hide-scrollbars",
  "--enable-unsafe-swiftshader", // WebGL para MapLibre sin tarjeta de video
  "--no-first-run",
  "about:blank",
]);

let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    target = list.find((t) => t.type === "page");
  } catch {}
}
if (!target) throw new Error("Chrome no abrió el puerto de DevTools.");

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let nextId = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  }
});
const cdp = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

/** Ejecuta código en la página y devuelve su valor. */
async function js(expr) {
  const r = await cdp("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? expr);
  return r.result.value;
}

// ── Acciones de la app (por texto y rol, como lo haría una persona) ──────────
const HELPERS = `
  window.__q = (sel, text) => [...document.querySelectorAll(sel)].find(
    (el) => !text || el.textContent.replace(/\\s+/g, " ").includes(text));
  window.__click = (sel, text) => {
    const el = __q(sel, text);
    if (!el) throw new Error("No encontré " + sel + " «" + text + "»");
    el.click();
  };
  window.__type = (sel, value) => {
    const el = document.querySelector(sel);
    const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value").set;
    el.focus();
    set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
`;

async function viewport(width, height, scale = 1, mobile = false) {
  await cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile });
}

async function fresh() {
  await cdp("Page.navigate", { url: URL_APP });
  // Espera a que el mapa y los datos de la zona estén listos.
  for (let i = 0; i < 60; i++) {
    await sleep(250);
    const ok = await js(`!!document.querySelector(".maplibregl-canvas") && !document.body.innerText.includes("CARGANDO")`).catch(() => false);
    if (ok) break;
  }
  await js(HELPERS);
  await sleep(2500); // teselas del mapa base
}

async function shot(name) {
  await sleep(600);
  const { data } = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, "base64"));
  console.log("✓", name);
}

async function mouseClick(x, y) {
  for (const type of ["mousePressed", "mouseReleased"])
    await cdp("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
}

const search = async (text) => {
  await js(`__type('input[role="combobox"]', ${JSON.stringify(text)})`);
  await sleep(400);
};
const pickB4 = async () => {
  await search("boxwork");
  await js(`__click('[role="option"]', "B-4")`);
  await sleep(2500); // ruta + encuadre
};
const mode = (label) => js(`__click('[role="radio"]', ${JSON.stringify(label)})`);

// ── Tomas ────────────────────────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true });
await cdp("Page.enable");
await cdp("Runtime.enable");

try {
  await viewport(1920, 1080);

  // A · Buscar
  await fresh();
  await search("boxwork");
  await shot("A-buscar");

  // B · Ruta (también portada de la slide 1)
  await js(`__click('[role="option"]', "B-4")`);
  await sleep(2500);
  await shot("B-ruta");

  // C · Modos: mismo destino, tres formas de moverse
  for (const [file, label] of [["C1-a-pie", "A pie"], ["C2-rover-abierto", "Rover abierto"], ["C3-presurizado", "Presurizado"]]) {
    await mode(label);
    await sleep(2000);
    await shot(file);
  }

  // D · Capas: radiación encendida (ruta turquesa → ámbar, DOSIS, leyenda ESTIMADO)
  await fresh();
  await pickB4();
  await js(`__click('[role="switch"]', "Radiaci")`);
  await sleep(1500);
  await shot("D-radiacion");

  // E · Nota de campo: tarjeta abierta y nota guardada en la lista
  await fresh();
  await pickB4();
  await js(`__click("button", "+ NOTA")`);
  await sleep(300);
  const dest = await js(`(() => { const r = document.querySelector(".marker-dest")?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.bottom } : null })()`);
  const at = dest ? { x: dest.x - 70, y: dest.y + 40 } : { x: 960, y: 540 };
  await mouseClick(at.x, at.y);
  await sleep(500);
  await js(`__type('input[placeholder^="Ej."]', "Veta clara en la cresta")`);
  await js(`(() => { const t = document.querySelector("textarea");
    const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
    set.call(t, "Veta blanca de ~10 cm en la cara norte de la cresta. Tomar muestra al volver.");
    t.dispatchEvent(new Event("input", { bubbles: true })); })()`);
  await js(`__click('button[aria-pressed]', "GEOLOG")`);
  await js(`__click('button[aria-pressed]', "MUESTRA")`);
  await js(`document.activeElement?.blur()`);
  await shot("E1-nota-tarjeta");
  await js(`__click("button", "Guardar nota")`);
  await sleep(1200);
  await shot("E2-nota-guardada");

  // Supuestos y fuentes (slide 5) y modo HUD (slide 6)
  await fresh();
  await pickB4();
  await js(`__click('button[aria-label="Supuestos y fuentes"]')`);
  await shot("G-supuestos");
  await js(`__click('button[aria-label="Cerrar"]')`);
  await js(`__click('button[aria-label^="Modo HUD"]')`);
  await sleep(1500);
  await shot("H-hud");

  // F · Teléfono (375×812 a 3×) con la ruta y la barra inferior
  await viewport(375, 812, 3, true);
  await fresh();
  await pickB4();
  await shot("F-telefono");

  // Tablet (1024×768 a 2×) para la slide 6
  await viewport(1024, 768, 2, true);
  await fresh();
  await pickB4();
  await shot("I-tablet");
} finally {
  ws.close();
  chrome.kill();
  await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
console.log(`Listo: ${OUT}`);
