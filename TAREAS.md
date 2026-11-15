# MARSWALK — Tareas de código por persona

> Qué hace cada quien, en qué archivos y en qué orden, **sin pisarse**.
> Horario y puntos de control: [PLANEACION.md](PLANEACION.md) · Datos, supuestos y diseño: [CONTEXTO.md](CONTEXTO.md).
> Todo lo de código vive en `Frontend/martianmap/` salvo que se diga otra cosa.

### 📊 Avance del equipo · revisado dom 15 nov, ~10:30, contra `main` (incluye PR #26, #27 y #28)

| Persona | Avance | Tareas | Lo más urgente |
|---|---|---|---|
| P1 · Datos | `████████░░` 80 % | 12 / 15 | Confirmar los valores de REMS del sol 412 y la fecha de descarga del DTM |
| P2 · Ruta | `█████████░` 89 % | 8 / 9 | — (solo queda el ajuste fino de costos, opcional) |
| P3 · Mapa | `██████████` 100 % | 13 / 13 | — |
| P4 · Interfaz | `█████████░` 93 % | 13 / 14 | Grabar el video, llenar los `[corchetes]` y entregar (sin slides: solo video) |
| **Equipo** | `█████████░` **90 %** | **46 / 51** | Sin contar los 3 opcionales (fotos POV, térmico, ajuste de costos): **46 / 48 · 96 %** |

**Ya hecho (dom 15 nov):** ✅ Vercel publica `main` en https://martianmap-rosy.vercel.app · ✅ Supabase creado, con `schema.sql` corrido y llaves en Vercel · ✅ `rama-luis`, `ramajulio` y `Julieta-3.0` fusionadas en `main` (PR #26, #27, #28) · ✅ Notas en tiempo real probadas entre dos dispositivos · ✅ Probado en teléfono real · ✅ README con la URL y `RESOURCES.md` en inglés (fuentes, herramientas y cómo se hizo) · **Decisión:** no habrá slides, la presentación es solo el video.

**Lo que falta para entregar (domingo), en orden:**
1. **P1 · REMS:** confirmar los valores de `weather.json` del sol 412 y la fecha de descarga del DTM (anotarlos en `RESOURCES.md`).
2. **P4 · Video** de 30 s con `presentacion/guion.md` §2 y los subtítulos de `video-subtitulos.srt`, grabado sobre https://martianmap-rosy.vercel.app. Borrar antes las notas de prueba en Supabase (*Table Editor → annotations*) si no se quieren en el video.
3. **Todos:** llenar los `[corchetes]` que quedan en `presentacion/pagina-proyecto.md` (nombres del equipo y enlace del video).
4. **P4 · Entrega** (`presentacion/entrega.md`): video, URL de Vercel, repo público y página del proyecto.

El detalle está al final de la sección de cada persona. **Para actualizarlo:** marca `[x]` en tu casilla y corrige tu fila y tu barra (cada `█` = 10 %).

---

## 1. Cómo está cortado el código

La app ya corre de punta a punta con piezas provisionales. **Cada pieza tiene un solo dueño** y está detrás de un hook o componente con un contrato fijo. Cada quien reemplaza el interior de *su* pieza sin tocar la de nadie.

```
                         AppShell.tsx  (P4: solo compone, no tiene lógica)
       ┌───────────────────┬──────────────┼─────────────────┬──────────────────┐
   useZone()          useRoute()       <MapView/>        paneles          useNotes()
   lib/data/          lib/routing/     components/map/   components/      lib/notes/
   P1                 P2               P3                panels/ ui/  P4  P2 desde el bloque 3
   datos reales       A* en Worker     ortofoto, capas,  completos        Supabase o
   de HiRISE                           ruta, NO PISAR                     localStorage
```

### Quién es dueño de qué

| Archivo o carpeta | Dueño | Notas |
|---|---|---|
| `data-pipeline/**` (Python) | **P1** | |
| `public/data/gale/**` | **P1** | Datos reales de HiRISE (desde el PR #25) |
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
- [x] `python -m venv .venv`, luego `pip install -r data-pipeline/requirements.txt`. Si `rasterio` no instala en Windows en 15 min → usar conda (`conda install -c conda-forge rasterio`).
- [x] Ubicar la zona boxwork sobre el recorrido de Curiosity y fijar un cuadro de ~3 × 3 km. Anotar las 4 esquinas en lon/lat.

### Bloque 1 (14:00–18:00) — datos reales en pantalla
- [x] `data-pipeline/recortar.py`: recortar DEM y ortofoto al cuadro, sin bajar el archivo completo (`/vsicurl/` o `rasterio` con `window`). Plan B a las 15:00: un solo DTM HiRISE.
- [x] `data-pipeline/pendiente.py`:
  - Remuestrear el DEM a **4 m/celda** (promedio de bloques).
  - Pendiente en grados: `np.degrees(np.arctan(np.hypot(*np.gradient(dem, 4))))`.
  - Guardar `slope.bin`: `np.clip(np.round(s), 0, 255).astype(np.uint8).tofile(...)`, fila 0 = norte.
- [x] `data-pipeline/exportar.py`:
  - `ortho.webp` (máximo 4096 px de lado, Pillow).
  - `slope.png` coloreado con transparencia: < 9° transparente, 9–15° ámbar `#FBBF24`, > 15° rojo `#EF4444`, alfa ~60 %.
  - `meta.json` con `width`, `height`, `metersPerPixel: 4`, `bounds` **en grados lon/lat de Marte**, `base`, `sources`, `files: { "ortho": "ortho.webp", "slope": "slope.png" }` y **sin** `fake`.
- [x] Ojo con la proyección: si el DEM viene en metros (equirectangular de Marte), convertir con `grados = metros / (3389500 · π / 180)` y sumar el meridiano central si lo tiene.
- [x] Probar: `npm run dev`, desaparece el aviso "TERRENO SINTÉTICO", la rejilla cuadra con la zona y en Capas se habilitan Imagen y Pendiente.

**Listo cuando:** la app carga `meta.json` y `slope.bin` reales sin cambiar código de nadie.

### Bloque 2 (18:00–22:00) — lo que da sentido a la ruta
- [x] `nogo.geojson`: polígonos NO PISAR. La forma rápida es tomar celdas con pendiente > 30°, dilatarlas y convertirlas con `rasterio.features.shapes`, más 1–2 polígonos dibujados a mano sobre la ortofoto (roca suelta). `properties.reason` con el motivo.
- [x] `pois.geojson`: `Base`, `Boxwork B-4` (objetivo principal, a ~2.4 km) y 1–2 objetivos más. Formato: `Feature<Point>` con `properties: { id, name, type: "base" | "target" | "pov", description }`.
- [ ] `weather.json` de REMS (un sol real) y confirmar la tasa de RAD; si cambia, se la pasas a P2 para `RAD_MSV_PER_DAY`.
- [x] `data-pipeline/FUENTES.md` lleno. (Ahora vive en inglés en `RESOURCES.md`, en la raíz.)
- [x] Revisar con P2 que la ruta "tenga sentido" sobre la imagen.

### Bloque 3 (22:00–01:00) — extras
- [ ] Fotos POV: 8–12 imágenes de Curiosity en `public/data/gale/pov/` (JPG, ≤ 1600 px, < 300 KB cada una) y puntos `type: "pov"` en `pois.geojson` con `photo`, `sol` y `camera`.
- [ ] Si sobra tiempo: `thermal.png` de THEMIS y `files.thermal` en `meta.json`.
- [x] Pasar a P4 la tabla de supuestos y fuentes para la slide 5.

### 📊 Progreso P1 · revisado dom 15 nov, 01:15

`████████████████░░░░` **12 / 15 tareas · 80 %**

| Bloque | Hecho | Falta |
|---|---|---|
| 0 · Hora 0 | 2 / 2 | — |
| 1 · Datos reales | 5 / 5 | — (se usó el plan B: un solo DTM HiRISE, DTEEC_001488_1750) |
| 2 · Sentido de la ruta | 4 / 5 | confirmar que `weather.json` tiene los valores reales de REMS del sol 412 |
| 3 · Extras | 1 / 3 | fotos POV y térmico (opcionales; no hacen falta para entregar) |

- **Ya en `main` (PR #25 de Julieta, con arreglos):** ortofoto, pendiente a 4 m/celda (1703 × 3383), `meta.json` según el contrato, `weather.json`, `pois.geojson`, `nogo.geojson` y `FUENTES.md`. El aviso "TERRENO SINTÉTICO" ya no sale.
- **Arreglos del repaso:** `sources` como texto (tumbaba la hoja "i"), `width`/`height` de la malla de pendiente, base dentro de la zona, `files` con ortofoto y pendiente, clima con el formato del contrato y sin `elevation.bin` (11.5 MB que nadie usaba). `run_exportar.py` ya escribe el `meta.json` correcto.
- **Nuevo en `rama-luis`:** `limpiar_sin_datos.py`. El 25 % del rectángulo no tiene datos de HiRISE (la franja es inclinada); antes salía como terreno plano y la ruta podía cruzarlo. Ahora vale 255 (bloqueado) y es transparente. **Si se vuelve a correr el pipeline, correr este script al final.**
- **Honestidad:** Bradbury Landing queda fuera del recorte, así que la base es "Base EVA", un punto supuesto. Boxwork B-4 se movió 34 m porque estaba en un hueco rodeado de pendientes > 15°. Las fotos POV de Curiosity se quitaron (daban 403 y eran de otra zona). Los motivos de NO PISAR dicen que las zonas las marcó el equipo.

---

## 5. P2 — Ruta (y notas desde el bloque 3)

**Misión:** que la ruta evite lo peligroso y cambie con el modo.
**Contrato:** `useRoute(zone, from, to, mode): RouteState` en `lib/routing/useRoute.ts`. AppShell ya lo llama; tú cambias el interior.
**No tocas:** `components/**`, `app/**`, `public/data/**`.

### Bloque 0
- [x] Leer `scripts/fake-terrain.mjs`: el terreno sintético tiene un **escarpe > 30°** entre la Base y Boxwork B-4 con un paso al noreste, y una **loma de ~20°** junto al paso (a pie se rodea, en rover abierto no). Con eso pruebas que tu A* funciona.

### Bloque 1 (14:00–18:00) — A* que funciona
- [x] `lib/routing/astar.ts` → `findRoute(zone, from, to, mode)`, función pura sin React:
  - Malla `zone.meta.width × height`; celda ↔ lon/lat con `lonLatToCell` / `cellToLonLat` de `lib/geo.ts`.
  - **Máscara de bloqueo** (`Uint8Array`): pendiente > `maxSlopeDeg` del modo **o** dentro de `zone.nogo`. El NO PISAR se rasteriza una vez por zona (punto en polígono por celda) y se guarda en caché.
  - 8 vecinos; paso = 4 m (recto) o 5.66 m (diagonal); `velocidad = speedKmh × (1 − 0.6 × pendiente / maxSlope)`; costo = paso / velocidad.
  - Heurística: distancia octil / velocidad máxima del modo (admisible).
  - Montículo binario propio (unas 40 líneas, sin librerías).
  - Si origen o destino están bloqueados → mover a la celda libre más cercana.
  - Salida `RouteResult`: `path` simplificado (Douglas–Peucker o 1 de cada 5 puntos), `distanceM` con `pathLengthM`, `timeMin` = suma de costos, `maxSlopeDeg` real del camino, y el resto con `computeMetrics`.
  - Sin camino → `null`.
- [x] Meta: **< 1 s** por ruta en la malla de 750 × 750.

**Listo cuando:** sobre el terreno sintético, la ruta a pie rodea el escarpe y la loma; la del rover abierto cruza la loma.

### Bloque 2 (18:00–22:00) — conectado y sin congelar la pantalla
- [x] `lib/routing/worker.ts`: recibe `slope` una sola vez (transferido) y luego mensajes `{ from, to, mode }`; responde `RouteResult | null`.
- [x] `useRoute.ts`: crea el worker con `new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })`, `computing: true` mientras calcula y la última ruta válida mientras tanto.
- [x] `lib/metrics.ts`: riesgo con la pendiente real; `warning` en español cuando no hay camino ("No hay ruta segura a pie: prueba en rover"), está fuera de alcance o el recurso no alcanza para volver con 20 % de reserva.
- [ ] Ajustar con P1 los costos si la ruta zigzaguea.

### Bloque 3 (22:00–01:00) — notas de campo en Supabase
- [x] `lib/notes/useNotes.ts` (ya es tuyo): mismo contrato `{ notes, addNote }`.
  - Leer `annotations` de Supabase al cargar y suscribirse a `postgres_changes` (tiempo real).
  - `addNote`: insertar; si trae foto, subirla antes al bucket `field-photos` y guardar `photoUrl`.
  - Si `supabase` es `null` o falla → guardar en `localStorage` con la misma forma. **La demo nunca depende de la red.**
  - Ojo: mapear `snake_case` de la tabla ↔ `camelCase` de `Note`.
- [x] Probar con dos pestañas: la nota de una aparece en la otra. (Probado en Vercel entre dos dispositivos, dom 15 nov.)

### 📊 Progreso P2 · revisado dom 15 nov, 01:15

`██████████████████░░` **8 / 9 tareas · 89 %**

| Bloque | Hecho | Falta |
|---|---|---|
| 0 · Leer el terreno sintético | 1 / 1 | — |
| 1 · A* | 2 / 2 | — (40–700 ms por ruta en la malla real de 1703 × 3383) |
| 2 · Worker y avisos | 3 / 4 | ajuste fino de costos (la ruta no zigzaguea; opcional) |
| 3 · Notas en Supabase | 2 / 2 | — (tiempo real probado entre dos dispositivos) |

- **A* de Fer en `main`:** 8 vecinos, máscara por modo (pendiente + NO PISAR), Web Worker con respaldo en el hilo principal, avisos "Fuera de alcance" y "No hay ruta segura", y pruebas en `scripts/test-astar.ts` y `scripts/test-route.ts` (`npx tsx scripts/test-route.ts`).
- **Con los datos reales, a Boxwork B-4:** a pie 2.4 km, 1 h 7 min, **ALTO** (fuera de alcance) · rover abierto 1.8 km, 14 min, MEDIO · presurizado 1.9 km, 11 min, MEDIO.
- **`useNotes` en `rama-luis` (lo hizo P4 para avanzar; revísalo, Fer):** Supabase con tiempo real y fotos en `field-photos` si hay llaves; si no, `localStorage` con la misma forma, sincronizado entre pestañas. La foto se reduce a JPEG ≤ 800 px. Probado: la nota con foto sigue ahí al recargar y aparece en otra pestaña.
- **Mejora posible:** si el destino cae en un hueco rodeado de pendientes, hoy sale "No hay ruta segura". `nearestFree` podría buscar la celda alcanzable más cercana en vez de solo la celda libre más cercana.

---

## 6. P3 — Mapa

**Misión:** que el peligro *se vea*: ortofoto, capas, ruta, zonas prohibidas y puntos.
**Contrato:** las props de `MapViewProps` en `components/map/MapView.tsx`. No las cambies sin hablar con P4.
**No tocas:** `lib/**` (salvo agregar funciones a `lib/geo.ts` avisando), `components/panels/**`, `app/**`.
**Regla interna:** cada capa en su archivo `components/map/layers/<capa>.ts`; `MapView.tsx` solo las llama.

### Bloque 1 (14:00–18:00) — capas encendibles
- [x] Efecto sobre la prop `layers`: mostrar u ocultar con `map.setLayoutProperty(id, "visibility", ...)`.
- [x] `layers/ortho.ts`: `image` source con `zone.meta.files.ortho` y las 4 esquinas de `bounds`, debajo de todo.
- [x] `layers/slope.ts`: si existe `files.slope`, se usa esa imagen. **Mientras no exista**, se pinta desde `zone.slope` en un `<canvas>` (mismos colores que P1: ámbar 9–15°, rojo > 15°) y se usa como `image` source con `canvas.toDataURL()`. Así funciona hoy con datos sintéticos.
- [x] `layers/nogo.ts`: rayado diagonal real (`map.addImage` con un patrón de canvas 12 × 12 + `fill-pattern`) y la etiqueta "NO PISAR".
- [x] Leyenda en `components/map/Legend.tsx` (la renderiza `MapView`, esquina inferior derecha sobre el mapa, solo con capas activas).

**Listo cuando:** con datos sintéticos se pueden prender y apagar la pendiente y el NO PISAR, y se ve la leyenda.

### Bloque 2 (18:00–22:00) — legible y tocable con guantes
- [x] Radiación: no es un ráster (la tasa es uniforme). Al activarla, la **ruta se colorea por dosis acumulada** (`lineMetrics: true` en la fuente `route` + `line-gradient` de turquesa a ámbar) y aparece una etiqueta con la dosis total.
- [x] POI con nombre (marcadores HTML como BASE/DESTINO, color ciencia `#A78BFA`).
- [x] Tocar cerca de un POI (≤ 40 px) → `onMapClick` con las coordenadas **exactas del POI** (imán). No requiere props nuevas.
- [x] Al llegar una ruta nueva: `fitBounds` suave a la ruta (respetando `prefers-reduced-motion`).
- [x] Probar en teléfono: arrastrar el mapa no debe abrir ni cerrar paneles. (Probado en teléfono real sobre Vercel, dom 15 nov.)

### Bloque 3 (22:00–01:00) — extras
- [x] Notas en el mapa (prop `notes`): punto morado con icono; al tocarlo, tarjeta con título, foto y etiquetas.
- [x] POV: al tocar un POI `pov`, popup con la foto de Curiosity, sol y cámara.
- [x] Ayudar a P4 con capturas de pantalla limpias para el video. → `presentacion/capturar.mjs` las saca solas.
- [x] *(Extra, no estaba en el plan)* Mapa base de Marte desde NASA Trek (Viking, MOLA, MOLA+HRSC) con selector (`BasemapPicker.tsx`, `layers/basemap.ts`).

### 📊 Progreso P3 · revisado dom 15 nov, 01:15

`████████████████████` **13 / 13 tareas · 100 %** + 1 extra (mapa base de Trek) + botones del panel de mapa (PR #28)

| Bloque | Hecho | Falta |
|---|---|---|
| 1 · Capas encendibles | 5 / 5 | — (la ortofoto real ya se ve) |
| 2 · Legible y tocable | 5 / 5 | — (probado en teléfono real) |
| 3 · Extras | 3 / 3 | — |

**Cambio en `MapView.tsx` (en `rama-luis`, avisar a Julio):** la vista inicial ahora encuadra la base y los objetivos, y `maxBounds` se ajusta a la forma de la zona. Antes, con la franja real (6.8 × 13.5 km), la base quedaba fuera de la pantalla y no se podía alejar lo suficiente para ver la zona entera.

**Arreglado en la revisión del merge (avisar a P3 y hacer `git pull`):**
- 🔴 Radiación tumbaba la app al marcar destino (el marcador de dosis se agregaba sin coordenadas).
- 🔴 Notas de prueba en `useNotes.ts` → error de hydration ("1 Issue").
- 🟡 Mosaicos de Trek pedidos al nivel equivocado (un cuarto del mosaico estirado ×2). Ahora: nivel Mercator `z` → nivel EQ `z − 1`, misma columna.
- 🟡 Radiación y mapa base esperaban `isStyleLoaded()`, que es falso mientras bajan mosaicos de Trek → el cambio nunca se aplicaba.
- 🟡 Leyenda y selector de mapa base: ahora se colocan sobre la barra de métricas con `--ui-bottom` (lo mide AppShell); la leyenda ya no tapa NOTAS DE CAMPO.
- 🟡 `fitBounds` dejaba la ruta debajo de los paneles; DESTINO se encimaba con el nombre del POI.
- Botones del selector de mapa base a 56 px (antes 44).

**Ojo:** el mapa base depende de internet (trek.nasa.gov). A esa escala solo trae unos pocos píxeles para toda la zona: sirve de contexto, no de detalle. Si no hay red, el mapa sigue funcionando con fondo oscuro.

---

## 7. P4 — Interfaz, integración e historia

**Misión:** que todo se entienda de un vistazo y se use con guantes; que la demo y la presentación salgan.
**Archivos:** `components/AppShell.tsx` (eres el único que lo edita), `components/panels/**`, `components/ui/**`, `app/**`, `presentacion/**`.
**No tocas:** `lib/routing/**`, `lib/data/**`, `components/map/**`.

### Bloque 0 (hora 0)
- [x] Crear el proyecto en Supabase. Correr el SQL de CONTEXTO.md §7, crear el bucket público `field-photos`, activar Realtime en `annotations` y políticas abiertas para `anon`.
- [x] `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`; pasar las llaves a P2 **por mensaje privado**, nunca en el repo.
- [x] Conectar el repo a Vercel (raíz: `Frontend/martianmap`), con las mismas variables. Confirmar que `main` se publica.

### Bloque 1 (14:00–18:00) — la pantalla con datos de la zona
- [x] TopBar: el buscador filtra `zone.pois` (pasarlos desde AppShell); al elegir uno, `setDestination`. Lista de resultados con filas ≥ 56 px.
- [x] Chip de clima desde `zone.weather` (temperatura mín/máx), oculto en teléfono.
- [x] `components/ui/Button.tsx` y `components/ui/Panel.tsx` para dejar de repetir clases.
- [x] MetricsBar: estado `computing` ("CALCULANDO…") y `warning`; texto de recurso en ámbar si queda < 50 % y en rojo si queda < 20 %.

### Bloque 2 (18:00–22:00) — notas y presentación
- [x] `components/panels/NoteCard.tsx`: formulario con título, nota, etiquetas (MUESTRA / GEOLOGÍA / REVISAR / PELIGRO), foto (`<input type="file" accept="image/*" capture="environment">`), lat/lon y sol automáticos. Llama a `addNote` de `useNotes` (el interior lo hace P2).
- [x] Modo "nota" en AppShell: botón "+ NOTA"; mientras está activo, el siguiente toque al mapa fija la ubicación de la nota en vez del destino.
- [x] Panel de notas (≥ 1024 px): lista de notas recientes.
- [x] Empezar `presentacion/guion.md` y el esqueleto de 7 slides (ver PLANEACION.md §5).

### Bloque 3 (22:00–01:00) — extras
- [x] Pantalla "Acerca de / supuestos": lee `MODES` y `LAYERS` y muestra fuentes (P1 pasa el texto). → botón "i" en la barra superior (`AboutSheet.tsx`).
- [x] Modo HUD: `data-mode="hud"` en `<html>` cambia los tokens en `globals.css` (fondos transparentes, solo ruta, distancia, recurso y riesgo en las esquinas). Botón para alternarlo. → botón "HUD"; Esc o "SALIR DE HUD" vuelve (`HudOverlay.tsx`).
- [ ] Domingo: video y presentación son tu prioridad número 1 (ver PLANEACION.md). → **Sin slides: la presentación es solo el video.** Ya están las capturas, los subtítulos y la página del proyecto; falta grabar el video y entregar (`presentacion/entrega.md`).

### 📊 Progreso P4 · revisado dom 15 nov, ~10:00 (todo en `main`)

`██████████████████░░` **13 / 14 tareas · 93 %** (falta grabar el video y entregar)

| Bloque | Hecho | Falta |
|---|---|---|
| 0 · Supabase y Vercel | 3 / 3 | — (Vercel: martianmap-rosy.vercel.app publica `main`; Supabase con tablas, bucket `field-photos` y tiempo real) |
| 1 · Pantalla con datos | 4 / 4 | — |
| 2 · Notas y presentación | 4 / 4 | — |
| 3 · Extras | 2 / 3 | domingo: grabar el video, llenar los `[corchetes]` y entregar (las slides se descartaron) |

**Domingo, ya hecho:** `presentacion/capturar.mjs` graba las tomas A–F a 1080p sin tocar el mouse (12 PNG en `presentacion/capturas/`); 7 slides con capturas y notas del orador ([MARSWALK · Pitch](https://claude.ai/artifact/2M422wToS83dVPDy2DFDop)); `video-subtitulos.srt`; `pagina-proyecto.md` con la declaración de uso de IA; `entrega.md` con la lista por hora. Arreglos del último repaso: el aviso "TERRENO SINTÉTICO" ya no queda bajo los botones en teléfono y los círculos de MAPA BASE se ven.

**Además del plan:** `noteTags.ts` y `NotesList.tsx`; arreglo de capas (`@layer`) y del contorno de foco; métricas sin cortes en 375 px; pantalla de error con "Reintentar"; `--ui-bottom` para que los controles del mapa no choquen con la barra; `Backend/requirements.txt`.

**Madrugada del domingo (en `rama-luis`):** la foto de la nota ya se guarda (`addNote(n, photo)`); `supabase/schema.sql` listo para pegar; slides con las capturas y cifras reales y la tabla de fuentes; `pagina-proyecto.md` con fuentes, enlaces y repo; guion, subtítulos y lista de entrega al día.

**Bloque 0, paso a paso (ya hecho; se deja como referencia):**
1. **Vercel:** vercel.com → Add New → Project → importar `luablo/martianmap` → Root Directory `Frontend/martianmap` → Deploy. Confirmar que publica `main`.
2. **Supabase (opcional):** supabase.com → New project → SQL Editor → pegar `supabase/schema.sql` → Run. Luego Project Settings → API: copiar *Project URL* y *anon public key*.
3. Poner las dos llaves en `Frontend/martianmap/.env.local` (no se sube) y en Vercel → Settings → Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) → Redeploy.
4. Probar con dos navegadores: una nota en uno aparece en el otro.

**Pendiente con otros:** confirmar los valores de REMS (P1). El tiempo real (P2) y la prueba en teléfono (P3) ya están.

---

## 8. Dependencias entre personas (para que nadie espere)

| Quién espera | Qué | A quién | Mientras tanto usa |
|---|---|---|---|
| ~~P2, P3~~ | ~~Datos reales~~ | ~~P1~~ | ✅ en `main` |
| ~~P3, P4~~ | ~~Ruta real~~ | ~~P2~~ | ✅ en `main` |
| ~~P4~~ | ~~`pois` y `weather` reales~~ | ~~P1~~ | ✅ en `main` |
| ~~P4 (NoteCard)~~ | ~~`useNotes` con foto~~ | ~~P2~~ | ✅ en `rama-luis` |
| Todos | URL de Vercel para el video y la entrega | P4 | `localhost` |
| P2 | Llaves de Supabase | P4 | `localStorage` (ya funciona) |
| P1 | Valores reales de REMS del sol 412 | P1 | Los de `weather.json` (sin confirmar) |

## 9. Si un contrato tiene que cambiar

1. Lo dices en el chat: qué campo, por qué y a quién afecta.
2. Se decide en el siguiente punto de control (o antes, si bloquea).
3. **Una** persona edita `lib/types.ts`, arregla lo que se rompa en *todos* los archivos afectados (solo los cambios mínimos de tipos), confirma que `npm run build` compila y fusiona a `main` de inmediato.
4. Los demás jalan `main` en ese momento.

Agregar un campo **opcional** casi nunca rompe nada: es la forma preferida de cambiar un contrato.
