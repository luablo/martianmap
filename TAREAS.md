# MARSWALK — Tareas de código por persona

> Qué hace cada quien, en qué archivos y en qué orden, **sin pisarse**.
> Horario y puntos de control: [PLANEACION.md](PLANEACION.md) · Datos, supuestos y diseño: [CONTEXTO.md](CONTEXTO.md).
> Todo lo de código vive en `Frontend/martianmap/` salvo que se diga otra cosa.

---

## 1. Cómo está cortado el código

La app ya corre de punta a punta con piezas provisionales. **Cada pieza tiene un solo dueño** y está detrás de un hook o componente con un contrato fijo. Cada quien reemplaza el interior de *su* pieza sin tocar la de nadie.

```
                         AppShell.tsx  (P4: solo compone, no tiene lógica)
       ┌───────────────────┬──────────────┼─────────────────┬──────────────────┐
   useZone()          useRoute()       <MapView/>        paneles          useNotes()
   lib/data/          lib/routing/     components/map/   components/      lib/notes/
   P1                 P2               P3                panels/ ui/  P4  P2 desde el bloque 3
   lee public/data    hoy: línea recta hoy: rejilla,     hoy: completos   hoy: en memoria
   (hoy sintéticos)   → A* en Worker   ruta, NO PISAR    con datos falsos → Supabase
```

### Quién es dueño de qué

| Archivo o carpeta | Dueño | Notas |
|---|---|---|
| `data-pipeline/**` (Python) | **P1** | |
| `public/data/gale/**` | **P1** | Hoy tiene datos sintéticos; P1 los sobrescribe |
| `lib/data/**`, `lib/layers.ts` | **P1** | Cargar la zona; catálogo de capas |
| `lib/routing/**`, `lib/modes.ts`, `lib/metrics.ts` | **P2** | |
| `scripts/fake-terrain.mjs` | **P2** | Nadie lo corre cuando ya haya datos reales |
| `lib/notes/**` | **P2** (desde el bloque 3) | P4 crea el proyecto de Supabase; P2 escribe el código |
| `components/map/**` | **P3** | Incluye `map.css` y `layers/` |
| `components/AppShell.tsx` | **P4** | El único archivo que conecta todo |
| `components/panels/**`, `components/ui/**` | **P4** | |
| `app/**` (incluye `globals.css`) | **P4** | |
| `presentacion/**` | **P4** (P1 ayuda desde el bloque 3) | |

### Archivos compartidos (congelados)

| Archivo | Regla |
|---|---|
| `lib/types.ts` | Es el contrato. Solo se cambia **en un punto de control**, de acuerdo entre los afectados; lo edita una persona y se fusiona de inmediato. |
| `lib/geo.ts` | Lo usan P2 y P3. Agregar funciones sí se puede (avisando); cambiar las existentes, no. |
| `package.json` / `package-lock.json` | **Solo P4 instala dependencias.** Si necesitas una librería, la pides en el chat. Ya están `maplibre-gl` y `@supabase/supabase-js`. |
| `CONTEXTO.md`, `PLANEACION.md`, `TAREAS.md` | Cualquiera puede marcar casillas. Los cambios de fondo, en el punto de control. |

> **¿Necesitas algo de otra persona?** No edites su archivo: pídeselo en el chat con lo que necesitas (por ejemplo: "P4, ¿puedes pasarme `zone.pois` al TopBar?"). Si es urgente y la persona no contesta en 15 min, lo hace su respaldo.

## 2. Git sin choques

1. `main` siempre compila. Vercel publica `main` solo.
2. Cada quien trabaja en su rama: `p1/datos`, `p2/ruta`, `p3/mapa`, `p4/ui`.
3. Cada **1–2 h** (o al terminar una casilla):
   ```bash
   git pull origin main
   ```
   ```bash
   npm --prefix Frontend/martianmap run build
   ```
   Si compila: fusiona a `main` y sube. Como las carpetas no se cruzan, las fusiones salen limpias.
4. Si `git pull` da conflicto en un archivo que **no es tuyo**, acepta la versión de `main` (`git checkout --theirs <archivo>`) y avisa.
5. Nunca subas `.env.local` ni llaves (ya está en `.gitignore`).

## 3. Hora 0 (13:00–14:00) — todos

- [ ] **Una persona** fusiona la rama `base-frontend` a `main` y la sube. Todos clonan o jalan `main`.
- [ ] Todos: `npm install` dentro de `Frontend/martianmap` y `npm run dev` → abrir `http://localhost:3000`. Debe verse la zona sintética; al tocar el mapa sale una línea recta y la barra de métricas.
- [ ] Todos leen `lib/types.ts` (5 min). Es lo único que hay que saberse de memoria.
- [ ] Todos leen `Frontend/martianmap/AGENTS.md`: es Next.js 16 y tiene cambios de API.
- [ ] Cada quien crea su rama.

---

## 4. P1 — Datos

**Misión:** que la zona real de Gale aparezca en la app y que cada número de la app tenga una fuente citable.
**Entregas:** archivos en `public/data/gale/` con el formato de `ZoneMeta`, `Poi`, `Weather` y `NoGo` de `lib/types.ts`.
**No tocas:** nada fuera de `data-pipeline/`, `public/data/`, `lib/data/` y `lib/layers.ts`.

### Bloque 0 (hora 0)
- [ ] `python -m venv .venv`, luego `pip install -r data-pipeline/requirements.txt`. Si `rasterio` no instala en Windows en 15 min → usar conda (`conda install -c conda-forge rasterio`).
- [ ] Ubicar la zona boxwork sobre el recorrido de Curiosity y fijar un cuadro de ~3 × 3 km. Anotar las 4 esquinas en lon/lat.

### Bloque 1 (14:00–18:00) — datos reales en pantalla
- [ ] `data-pipeline/recortar.py`: recortar DEM y ortofoto al cuadro, sin bajar el archivo completo (`/vsicurl/` o `rasterio` con `window`). Plan B a las 15:00: un solo DTM HiRISE.
- [ ] `data-pipeline/pendiente.py`:
  - Remuestrear el DEM a **4 m/celda** (promedio de bloques).
  - Pendiente en grados: `np.degrees(np.arctan(np.hypot(*np.gradient(dem, 4))))`.
  - Guardar `slope.bin`: `np.clip(np.round(s), 0, 255).astype(np.uint8).tofile(...)`, fila 0 = norte.
- [ ] `data-pipeline/exportar.py`:
  - `ortho.webp` (máximo 4096 px de lado, Pillow).
  - `slope.png` coloreado con transparencia: < 9° transparente, 9–15° ámbar `#FBBF24`, > 15° rojo `#EF4444`, alfa ~60 %.
  - `meta.json` con `width`, `height`, `metersPerPixel: 4`, `bounds` **en grados lon/lat de Marte**, `base`, `sources`, `files: { "ortho": "ortho.webp", "slope": "slope.png" }` y **sin** `fake`.
- [ ] Ojo con la proyección: si el DEM viene en metros (equirectangular de Marte), convertir con `grados = metros / (3389500 · π / 180)` y sumar el meridiano central si lo tiene.
- [ ] Probar: `npm run dev`, desaparece el aviso "TERRENO SINTÉTICO", la rejilla cuadra con la zona y en Capas se habilitan Imagen y Pendiente.

**Listo cuando:** la app carga `meta.json` y `slope.bin` reales sin cambiar código de nadie.

### Bloque 2 (18:00–22:00) — lo que da sentido a la ruta
- [ ] `nogo.geojson`: polígonos NO PISAR. La forma rápida es tomar celdas con pendiente > 30°, dilatarlas y convertirlas con `rasterio.features.shapes`, más 1–2 polígonos dibujados a mano sobre la ortofoto (roca suelta). `properties.reason` con el motivo.
- [ ] `pois.geojson`: `Base`, `Boxwork B-4` (objetivo principal, a ~2.4 km) y 1–2 objetivos más. Formato: `Feature<Point>` con `properties: { id, name, type: "base" | "target" | "pov", description }`.
- [ ] `weather.json` de REMS (un sol real) y confirmar la tasa de RAD; si cambia, se la pasas a P2 para `RAD_MSV_PER_DAY`.
- [ ] `data-pipeline/FUENTES.md` lleno.
- [ ] Revisar con P2 que la ruta "tenga sentido" sobre la imagen.

### Bloque 3 (22:00–01:00) — extras
- [ ] Fotos POV: 8–12 imágenes de Curiosity en `public/data/gale/pov/` (JPG, ≤ 1600 px, < 300 KB cada una) y puntos `type: "pov"` en `pois.geojson` con `photo`, `sol` y `camera`.
- [ ] Si sobra tiempo: `thermal.png` de THEMIS y `files.thermal` en `meta.json`.
- [ ] Pasar a P4 la tabla de supuestos y fuentes para la slide 5.

---

## 5. P2 — Ruta (y notas desde el bloque 3)

**Misión:** que la ruta evite lo peligroso y cambie con el modo.
**Contrato:** `useRoute(zone, from, to, mode): RouteState` en `lib/routing/useRoute.ts`. AppShell ya lo llama; tú cambias el interior.
**No tocas:** `components/**`, `app/**`, `public/data/**`.

### Bloque 0
- [ ] Leer `scripts/fake-terrain.mjs`: el terreno sintético tiene un **escarpe > 30°** entre la Base y Boxwork B-4 con un paso al noreste, y una **loma de ~20°** junto al paso (a pie se rodea, en rover abierto no). Con eso pruebas que tu A* funciona.

### Bloque 1 (14:00–18:00) — A* que funciona
- [ ] `lib/routing/astar.ts` → `findRoute(zone, from, to, mode)`, función pura sin React:
  - Malla `zone.meta.width × height`; celda ↔ lon/lat con `lonLatToCell` / `cellToLonLat` de `lib/geo.ts`.
  - **Máscara de bloqueo** (`Uint8Array`): pendiente > `maxSlopeDeg` del modo **o** dentro de `zone.nogo`. El NO PISAR se rasteriza una vez por zona (punto en polígono por celda) y se guarda en caché.
  - 8 vecinos; paso = 4 m (recto) o 5.66 m (diagonal); `velocidad = speedKmh × (1 − 0.6 × pendiente / maxSlope)`; costo = paso / velocidad.
  - Heurística: distancia octil / velocidad máxima del modo (admisible).
  - Montículo binario propio (unas 40 líneas, sin librerías).
  - Si origen o destino están bloqueados → mover a la celda libre más cercana.
  - Salida `RouteResult`: `path` simplificado (Douglas–Peucker o 1 de cada 5 puntos), `distanceM` con `pathLengthM`, `timeMin` = suma de costos, `maxSlopeDeg` real del camino, y el resto con `computeMetrics`.
  - Sin camino → `null`.
- [ ] Meta: **< 1 s** por ruta en la malla de 750 × 750.

**Listo cuando:** sobre el terreno sintético, la ruta a pie rodea el escarpe y la loma; la del rover abierto cruza la loma.

### Bloque 2 (18:00–22:00) — conectado y sin congelar la pantalla
- [ ] `lib/routing/worker.ts`: recibe `slope` una sola vez (transferido) y luego mensajes `{ from, to, mode }`; responde `RouteResult | null`.
- [ ] `useRoute.ts`: crea el worker con `new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })`, `computing: true` mientras calcula y la última ruta válida mientras tanto.
- [ ] `lib/metrics.ts`: riesgo con la pendiente real; `warning` en español cuando no hay camino ("No hay ruta segura a pie: prueba en rover"), está fuera de alcance o el recurso no alcanza para volver con 20 % de reserva.
- [ ] Ajustar con P1 los costos si la ruta zigzaguea.

### Bloque 3 (22:00–01:00) — notas de campo en Supabase
- [ ] `lib/notes/useNotes.ts` (ya es tuyo): mismo contrato `{ notes, addNote }`.
  - Leer `annotations` de Supabase al cargar y suscribirse a `postgres_changes` (tiempo real).
  - `addNote`: insertar; si trae foto, subirla antes al bucket `field-photos` y guardar `photoUrl`.
  - Si `supabase` es `null` o falla → guardar en `localStorage` con la misma forma. **La demo nunca depende de la red.**
  - Ojo: mapear `snake_case` de la tabla ↔ `camelCase` de `Note`.
- [ ] Probar con dos pestañas: la nota de una aparece en la otra.

---

## 6. P3 — Mapa

**Misión:** que el peligro *se vea*: ortofoto, capas, ruta, zonas prohibidas y puntos.
**Contrato:** las props de `MapViewProps` en `components/map/MapView.tsx`. No las cambies sin hablar con P4.
**No tocas:** `lib/**` (salvo agregar funciones a `lib/geo.ts` avisando), `components/panels/**`, `app/**`.
**Regla interna:** cada capa en su archivo `components/map/layers/<capa>.ts`; `MapView.tsx` solo las llama.

### Bloque 1 (14:00–18:00) — capas encendibles
- [ ] Efecto sobre la prop `layers`: mostrar u ocultar con `map.setLayoutProperty(id, "visibility", ...)`.
- [ ] `layers/ortho.ts`: `image` source con `zone.meta.files.ortho` y las 4 esquinas de `bounds`, debajo de todo.
- [ ] `layers/slope.ts`: si existe `files.slope`, se usa esa imagen. **Mientras no exista**, se pinta desde `zone.slope` en un `<canvas>` (mismos colores que P1: ámbar 9–15°, rojo > 15°) y se usa como `image` source con `canvas.toDataURL()`. Así funciona hoy con datos sintéticos.
- [ ] `layers/nogo.ts`: rayado diagonal real (`map.addImage` con un patrón de canvas 12 × 12 + `fill-pattern`) y la etiqueta "NO PISAR".
- [ ] Leyenda en `components/map/Legend.tsx` (la renderiza `MapView`, esquina inferior derecha sobre el mapa, solo con capas activas).

**Listo cuando:** con datos sintéticos se pueden prender y apagar la pendiente y el NO PISAR, y se ve la leyenda.

### Bloque 2 (18:00–22:00) — legible y tocable con guantes
- [ ] Radiación: no es un ráster (la tasa es uniforme). Al activarla, la **ruta se colorea por dosis acumulada** (`lineMetrics: true` en la fuente `route` + `line-gradient` de turquesa a ámbar) y aparece una etiqueta con la dosis total.
- [ ] POI con nombre (marcadores HTML como BASE/DESTINO, color ciencia `#A78BFA`).
- [ ] Tocar cerca de un POI (≤ 40 px) → `onMapClick` con las coordenadas **exactas del POI** (imán). No requiere props nuevas.
- [ ] Al llegar una ruta nueva: `fitBounds` suave a la ruta (respetando `prefers-reduced-motion`).
- [ ] Probar en teléfono: arrastrar el mapa no debe abrir ni cerrar paneles.

### Bloque 3 (22:00–01:00) — extras
- [ ] Notas en el mapa (prop `notes`): punto morado con icono; al tocarlo, tarjeta con título, foto y etiquetas.
- [ ] POV: al tocar un POI `pov`, popup con la foto de Curiosity, sol y cámara.
- [ ] Ayudar a P4 con capturas de pantalla limpias para el video.

---

## 7. P4 — Interfaz, integración e historia

**Misión:** que todo se entienda de un vistazo y se use con guantes; que la demo y la presentación salgan.
**Archivos:** `components/AppShell.tsx` (eres el único que lo edita), `components/panels/**`, `components/ui/**`, `app/**`, `presentacion/**`.
**No tocas:** `lib/routing/**`, `lib/data/**`, `components/map/**`.

### Bloque 0 (hora 0)
- [ ] Crear el proyecto en Supabase. Correr el SQL de CONTEXTO.md §7, crear el bucket público `field-photos`, activar Realtime en `annotations` y políticas abiertas para `anon`.
- [ ] `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`; pasar las llaves a P2 **por mensaje privado**, nunca en el repo.
- [ ] Conectar el repo a Vercel (raíz: `Frontend/martianmap`), con las mismas variables. Confirmar que `main` se publica.

### Bloque 1 (14:00–18:00) — la pantalla con datos de la zona
- [ ] TopBar: el buscador filtra `zone.pois` (pasarlos desde AppShell); al elegir uno, `setDestination`. Lista de resultados con filas ≥ 56 px.
- [ ] Chip de clima desde `zone.weather` (temperatura mín/máx), oculto en teléfono.
- [ ] `components/ui/Button.tsx` y `components/ui/Panel.tsx` para dejar de repetir clases.
- [ ] MetricsBar: estado `computing` ("CALCULANDO…") y `warning`; texto de recurso en ámbar si queda < 50 % y en rojo si queda < 20 %.

### Bloque 2 (18:00–22:00) — notas y presentación
- [ ] `components/panels/NoteCard.tsx`: formulario con título, nota, etiquetas (MUESTRA / GEOLOGÍA / REVISAR / PELIGRO), foto (`<input type="file" accept="image/*" capture="environment">`), lat/lon y sol automáticos. Llama a `addNote` de `useNotes` (el interior lo hace P2).
- [ ] Modo "nota" en AppShell: botón "+ NOTA"; mientras está activo, el siguiente toque al mapa fija la ubicación de la nota en vez del destino.
- [ ] Panel de notas (≥ 1024 px): lista de notas recientes.
- [ ] Empezar `presentacion/guion.md` y el esqueleto de 7 slides (ver PLANEACION.md §5).

### Bloque 3 (22:00–01:00) — extras
- [ ] Pantalla "Acerca de / supuestos": lee `MODES` y `LAYERS` y muestra fuentes (P1 pasa el texto).
- [ ] Modo HUD: `data-mode="hud"` en `<html>` cambia los tokens en `globals.css` (fondos transparentes, solo ruta, distancia, recurso y riesgo en las esquinas). Botón para alternarlo.
- [ ] Domingo: video y presentación son tu prioridad número 1 (ver PLANEACION.md).

---

## 8. Dependencias entre personas (para que nadie espere)

| Quién espera | Qué | A quién | Mientras tanto usa |
|---|---|---|---|
| P2, P3 | Datos reales | P1 (bloque 1) | Terreno sintético (ya está en el repo) |
| P3 | Ruta real para dibujar | P2 (bloque 1–2) | La línea recta de `useRoute` |
| P4 | Ruta real para las métricas | P2 | Las métricas de la línea recta |
| P4 | `pois`, `weather` reales | P1 (bloque 2) | Los sintéticos |
| P4 (NoteCard) | `useNotes` con Supabase | P2 (bloque 3) | La versión en memoria (mismo contrato) |
| P3 (notas en el mapa) | Notas con datos | P2 / P4 | Crear 2 notas falsas en su propio código de prueba |
| P2 | Llaves de Supabase | P4 (hora 0) | `localStorage` |

## 9. Si un contrato tiene que cambiar

1. Lo dices en el chat: qué campo, por qué y a quién afecta.
2. Se decide en el siguiente punto de control (o antes, si bloquea).
3. **Una** persona edita `lib/types.ts`, arregla lo que se rompa en *todos* los archivos afectados (solo los cambios mínimos de tipos), confirma que `npm run build` compila y fusiona a `main` de inmediato.
4. Los demás jalan `main` en ese momento.

Agregar un campo **opcional** casi nunca rompe nada: es la forma preferida de cambiar un contrato.
