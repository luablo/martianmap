# MARSWALK — Contexto del proyecto
14/11/2026
> Documento de referencia para el equipo (y para cualquier asistente de IA que trabaje en el repo).
> Reto: **Interplanetary Survival Guide: Martian Map** — NASA Space Apps Challenge 2026.
> Entrega: **domingo 15 nov, mediodía**. El plan de trabajo está en [PLANEACION.md](PLANEACION.md).

---

## 1. Qué construimos, en una frase

**Un "Google Maps" para caminar en Marte:** el astronauta marca un destino, elige cómo se mueve (a pie, rover abierto, rover presurizado) y la app le da la ruta más segura sobre datos reales de NASA, mostrando el peligro con colores y los recursos que le va a costar (tiempo, oxígeno, dosis de radiación).

**El hueco que cubrimos:** Mars Trek y los mapas USGS son vistas regionales/globales. Nadie puede planear con ellos una caminata concreta de 2–3 km. Eso es exactamente lo que pide el reto: una vista *hiperlocal*, por capas, para una EVA.

## 2. Decisiones ya tomadas

| Tema | Decisión | Por qué |
|---|---|---|
| Zona | **Cráter Gale / Mount Sharp** (zona de Curiosity) | Hay radiación **medida** en superficie (instrumento RAD), clima (REMS), DEM de 1 m y fotos a nivel de suelo. |
| Objetivo científico | **Estudiar las formaciones boxwork** de Mount Sharp y tomar muestras | Es el ejemplo que da el propio reto; evidencia de agua subterránea antigua. Sin objetivo, la ruta no tiene sentido. |
| Formato | **Tablet de antebrazo** (principal) + **modo HUD** (extra, solo si da tiempo) | El HUD es el mismo front con otro tema CSS. |
| Stack | **Next.js + MapLibre GL + Supabase**, desplegado en **Vercel** | Sin servidor propio que se caiga en la demo. |
| Preproceso | **Python (rasterio/GDAL)**, corre una vez en una laptop | Los resultados se guardan como archivos estáticos en el front. |
| Django (`Backend/`) | **No se usa.** Se queda en el repo sin tocar | No hay tiempo para desplegar y mantener un servidor. |
| Tiempo | ~23 h reales, 4 personas, las 4 programan | Ver recortes en la planeación. |

## 3. Misión de la demo (el guion que todo el equipo debe saberse)

> **Sol 412, EVA 07.** Dos astronautas salen de la base en la falda de Mount Sharp para muestrear una cresta de boxwork a ~2.4 km. Abren MARSWALK, buscan "Boxwork B-4", la app traza la ruta a pie evitando una ladera de 31° con roca suelta. Cambian a rover abierto: la ruta cambia sola. Llegan, toman una foto, dejan una nota y la nota aparece en el mapa del compañero.

Coordenadas de referencia: sitio de aterrizaje de Curiosity ≈ **4.59° S, 137.44° E**. La zona boxwork está más arriba en Mount Sharp, al suroeste; **la persona de Datos fija el recorte exacto (≈ 3 × 3 km)** usando el recorrido publicado de Curiosity.

## 4. Capas de datos

El reto sugiere **mínimo 3 tipos de datos**. Cada capa lleva en pantalla una etiqueta **MEDIDO**, **DERIVADO** o **ESTIMADO** (honestidad = puntos en "validez científica").

| # | Capa | Tipo | Fuente NASA | Etiqueta | Prioridad |
|---|---|---|---|---|---|
| 1 | Imagen de órbita | Óptico | MRO **HiRISE** — mosaico ortofoto de Gale (USGS Astrogeology, 25 cm/px) | MEDIDO | **MVP** |
| 2 | Pendiente / semáforo de terreno | Topográfico | **DEM de Gale 1 m/px** (HiRISE, USGS) → pendiente calculada | DERIVADO | **MVP** |
| 3 | Radiación (dosis de la ruta) | Radiación | **MSL RAD**: ~0.67 mSv/día promedio en superficie de Gale | MEDIDO (tasa) / ESTIMADO (dosis por ruta) | **MVP** |
| 4 | Clima del sol | Atmosférico | **MSL REMS**: temperatura, presión, UV | MEDIDO | **MVP** (solo en la barra de telemetría) |
| 5 | Fotos a nivel de suelo (POV) | Óptico | Imágenes crudas de **Curiosity** (Mastcam/Navcam) | MEDIDO | Extra 1 |
| 6 | Térmico (tipo de suelo) | Térmico | Mars Odyssey **THEMIS** — inercia térmica (100 m/px) | MEDIDO | Extra 2 |
| 7 | Mineralogía | Espectral | MRO **CRISM** | MEDIDO | Solo si sobra tiempo (probable recorte) |

### Dónde bajar los datos (públicos)

| Dato | Dónde | Nota |
|---|---|---|
| DEM y ortofoto de Gale | USGS Astrogeology / Astropedia: buscar "MSL Gale Merged DEM 1m" y "MSL Gale Merged Orthophoto Mosaic 25cm" | **Archivos de varios GB.** No bajar completos: recortar en remoto (ver abajo). |
| DTM/ortofoto individual HiRISE | uahirise.org/dtm | Plan B si el mosaico es demasiado pesado. |
| Mosaicos base | Mars Trek (trek.nasa.gov/mars) — sirve teselas WMTS | Plan C: usarlo como fondo visual. |
| Radiación RAD | PDS Planetary Plasma Interactions Node (MSL RAD) | Para el MVP basta la tasa promedio publicada (Hassler et al., 2014). |
| Clima REMS | PDS Atmospheres Node (MSL REMS) | Guardar un sol representativo en un JSON. |
| Fotos de Curiosity | mars.nasa.gov → MSL raw images | Bajar a mano 8–12 fotos de la zona boxwork; guardar sol y cámara. |
| Recorrido de Curiosity | Mapa "Where is Curiosity" (mars.nasa.gov) | Para ubicar la zona boxwork y como referencia de terreno transitable. |
| Geología | USGS-NASA Planetary Geologic Mapping Program | Contexto para la presentación. |

> Todas las URLs exactas se anotan en `RESOURCES.md` conforme se bajen: fuente, fecha, licencia/crédito. **Esto va también en la página del proyecto.**

**Truco para no bajar GB:** si el GeoTIFF está en un servidor con *range requests*, GDAL lo recorta en remoto:

```bash
gdal_translate -projwin <xmin> <ymax> <xmax> <ymin> /vsicurl/<URL_DEL_TIF> recorte.tif
```

Si no funciona en 30 min → pasar a plan B (un solo DTM HiRISE) sin discutir.

## 5. Supuestos del modelo (declararlos en la app y en la presentación)

Son **números propuestos por nosotros**, no datos NASA. Viven en un solo archivo: `lib/modes.ts`.

| | A pie | Rover abierto | Rover presurizado |
|---|---|---|---|
| Pendiente máx. | 15° | 25° | 18° |
| Velocidad en plano | 3 km/h | 10 km/h | 14 km/h |
| Alcance | 2 km (radio) | 20 km | 100 km |
| Recurso límite | Oxígeno del traje (8 h) | Batería | Días de misión |
| Factor de blindaje de radiación | 1.0 | 1.0 | 0.5 |

- **Semáforo de terreno:** verde = pendiente < 60 % del máximo del modo · ámbar = 60–100 % · rojo = sobre el máximo o zona marcada "NO PISAR". **La ruta nunca entra en rojo.**
- **Velocidad real** = velocidad en plano × (1 − 0.6 × pendiente/pendiente_máx).
- **Dosis** = 0.67 mSv/día × tiempo de ruta × factor de blindaje. Ojo: una EVA de ~100 min da ≈ **0.05 mSv**, no 0.21 como decía el boceto. Usar el valor calculado.
- **Oxígeno** = 100 % − (tiempo ida y vuelta / 8 h), con margen de reserva del 20 %. Si el regreso no alcanza → la app avisa en ámbar.
- **Riesgo global** (BAJO / MEDIO / ALTO) = el peor de: pendiente máx. del trayecto, reserva de recurso, dosis.

## 6. Arquitectura

```
DATOS NASA ──► PREPROCESO (Python, 1 vez) ──► ARCHIVOS ESTÁTICOS ──► APP (Next.js en Vercel)
DEM, ortofoto      recortar, pendiente,         /public/data/gale/      MapLibre + A* en Web Worker
RAD, REMS, fotos   exportar PNG/bin/JSON                                       │
                                                                               ▼
                                                             SUPABASE (notas, fotos, tiempo real)
```

### Estructura del repo

```
SpaceAppNasa/
├─ CONTEXTO.md  PLANEACION.md  TAREAS.md (quién toca qué)
├─ data-pipeline/              # P1 · Python. Salida → Frontend/martianmap/public/data/gale/
│  ├─ recortar.py  pendiente.py  exportar.py
│  ├─ requirements.txt  (fuentes: RESOURCES.md)
├─ Frontend/martianmap/        # Next.js 16 + Tailwind 4 (¡leer AGENTS.md: tiene cambios de API!)
│  ├─ app/            P4 · page.tsx  layout.tsx  globals.css (tokens de color)
│  ├─ components/
│  │  ├─ AppShell.tsx P4 · une todo; nadie más lo edita
│  │  ├─ map/         P3 · MapView.tsx  map.css  layers/  Legend.tsx
│  │  ├─ panels/      P4 · TopBar  ModeSwitch  LayerToggles  MetricsBar  NoteCard
│  │  └─ ui/          P4 · Button  Toggle  Chip  Panel
│  ├─ lib/
│  │  ├─ types.ts     COMPARTIDO · contrato (congelado)
│  │  ├─ geo.ts       COMPARTIDO · radio de Marte, celda ↔ lon/lat
│  │  ├─ data/        P1 · zone.ts  useZone.ts      layers.ts  P1 · catálogo de capas
│  │  ├─ routing/     P2 · useRoute.ts  astar.ts  worker.ts
│  │  ├─ modes.ts  metrics.ts                       P2
│  │  └─ notes/       P2 · useNotes.ts  supabase.ts
│  ├─ scripts/        fake-terrain.mjs (P2) · copy-maplibre-worker.mjs
│  └─ public/data/gale/  P1 · hoy con terreno sintético
├─ Backend/                    # Django: NO se usa
└─ presentacion/               # guion, slides, video, capturas
```

### Contrato de datos (se acuerda en la hora 0 — así nadie espera a nadie)

Datos entrega estos archivos en `public/data/gale/`. Mientras llegan, Ruta y Mapa trabajan con **datos falsos del mismo formato** (un script genera un terreno sintético).

| Archivo | Contenido |
|---|---|
| `meta.json` | `{ width, height, metersPerPixel, bounds: {west, south, east, north}, base: {lat, lon}, sources: [...] }` |
| `ortho.webp` | Ortofoto recortada, máx. 4096 px de lado. Se pinta como *image source* en MapLibre. |
| `slope.bin` | Pendiente en grados, `Uint8`, una celda por byte, fila por fila desde el norte. Malla de ruteo a **4 m/celda** (~750 × 750 para 3 km). |
| `elevation.bin` | Elevación `Int16` en metros (misma malla). Opcional. |
| `slope.png`, `thermal.png` | Capas ya coloreadas con transparencia, mismas esquinas que la ortofoto. |
| `nogo.geojson` | Polígonos "NO PISAR" marcados a mano (roca suelta, escarpes). |
| `pois.geojson` | Base, objetivos boxwork, puntos con foto POV (`{name, type, photo, sol, camera}`). |
| `weather.json` | Sol de referencia REMS: temperatura mín/máx, presión, UV. |

**Dos detalles técnicos que ahorran horas:**

1. **MapLibre cree que está en la Tierra.** Usamos lat/lon de Marte tal cual (Gale está a 4.6° del ecuador, la distorsión es despreciable), con un estilo vacío sin mapa base. Pero **las distancias se calculan con el radio de Marte: 3 389.5 km** (`lib/geo.ts`), nunca con funciones de distancia de la librería.
2. **MapLibre solo corre en el navegador:** el componente del mapa es `'use client'` y se carga sin SSR.

### Algoritmo de ruta

A* sobre la malla de 4 m, 8 vecinos, en un **Web Worker** (la UI no se congela).
`costo(celda) = distancia / velocidad_real(pendiente, modo)` → minimiza **tiempo**; celdas en rojo o dentro de `nogo` = infranqueables. Cambiar de modo = volver a correr con otros números. Salida: `{ path: [lon,lat][], distanceM, timeMin, maxSlopeDeg, doseMSv, resourcePct, risk }`.

## 7. Base de datos (Supabase / Postgres)

Solo guarda **lo que escribe el astronauta**. Los ráster y capas son archivos estáticos.

```sql
create table evas (
  id uuid primary key default gen_random_uuid(),
  code text not null,              -- 'EVA 07'
  sol int not null,                -- 412
  objective text,
  created_at timestamptz default now()
);

create table annotations (         -- notas de campo (TIEMPO REAL activado)
  id uuid primary key default gen_random_uuid(),
  eva_id uuid references evas(id) on delete cascade,
  author text not null,            -- 'AST-1' | 'AST-2'
  lat double precision not null,
  lon double precision not null,
  title text not null,             -- 'Veta mineral expuesta'
  note text,
  tags text[] default '{}',        -- MUESTRA | GEOLOGIA | REVISAR | PELIGRO
  photo_url text,                  -- bucket 'field-photos'
  sample_code text,                -- 'M-07'
  sol int, local_time text,
  created_at timestamptz default now()
);

create table routes (              -- rutas guardadas (extra)
  id uuid primary key default gen_random_uuid(),
  eva_id uuid references evas(id) on delete cascade,
  mode text check (mode in ('walk','open_rover','pressurized_rover')),
  path jsonb not null,             -- GeoJSON LineString
  distance_m real, time_min real, max_slope_deg real, dose_msv real,
  created_at timestamptz default now()
);

create table positions (           -- posición en vivo del compañero (extra)
  author text primary key,
  eva_id uuid references evas(id) on delete cascade,
  lat double precision, lon double precision,
  updated_at timestamptz default now()
);
```

- **Storage:** bucket público `field-photos`.
- **Realtime:** activado en `annotations` (y `positions` si se llega).
- **Seguridad (solo hackathon):** RLS activado con políticas abiertas de lectura/escritura para `anon`. Sin login. Decirlo como limitación conocida.
- **Si Supabase falla:** las notas caen a `localStorage` con la misma forma. La demo nunca depende de la red.

## 8. Diseño

### Principio de color: lo contrario de Marte

Marte vive en el naranja-rojo (matiz ~15–25°). La interfaz vive en su **complemento: cian/turquesa (~175–200°)** sobre fondos casi negros azulados. Todo lo que es *interfaz* es frío; lo cálido se reserva **solo para peligro**, así el calor en pantalla siempre significa algo.

Ventaja real: **la ortofoto HiRISE es en escala de grises**, así que el mapa base es neutro y el rojo de "NO PISAR" no se confunde con el suelo.

| Token | Hex | Uso |
|---|---|---|
| `--bg-0` | `#070A10` | Fondo principal (obsidiana) |
| `--bg-1` | `#0B132B` | Fondo secundario / degradados |
| `--surface` | `#111827` al 80 % + blur 12 px | Paneles y tarjetas (glassmorphism) |
| `--border` | `#1F2937` | Borde de paneles |
| `--text` | `#E5E7EB` | Texto principal (contraste > 15:1) |
| `--text-dim` | `#94A3B8` | Etiquetas y unidades |
| `--route` | `#2DD4BF` | Ruta activa, acción principal, foco |
| `--info` | `#38BDF8` | Capas informativas, compañero, enlaces |
| `--safe` | `#34D399` | Terreno seguro (usar poco: no competir con la ruta) |
| `--warn` | `#FBBF24` | Precaución, radiación, recurso bajo |
| `--danger` | `#EF4444` al 45 % + **rayado diagonal** | Zona prohibida |
| `--science` | `#A78BFA` | Objetivos científicos, notas, muestras |

Reglas:
- **Nunca solo color:** rojo = rayado, ámbar = punteado, y siempre texto ("NO PISAR"). Sirve para daltonismo y con visor empañado.
- La ruta lleva **borde oscuro** (`#070A10`, 2 px) para leerse sobre cualquier terreno.
- Capas ráster (pendiente, térmico) al 55–65 % de opacidad, con leyenda.
- Tipografía: **Inter** para UI; **JetBrains Mono** para números y telemetría (dígitos de ancho fijo: no "bailan" al actualizarse). Cuerpo mínimo 16 px, métricas 24–32 px.
- **Guantes presurizados:** todo lo tocable mide **≥ 56 px**, separación ≥ 12 px, sin gestos finos ni *hover*; un toque = una acción.
- Animaciones cortas (150–200 ms) y respetar `prefers-reduced-motion`.

### Componentes

1. **TopBar:** buscador "¿A dónde vamos?" + chips fijos `SOL 412` · `EVA 07` · `ENLACE OK` · clima REMS.
2. **ModeSwitch:** 3 botones con icono (a pie / rover abierto / presurizado). Al cambiar: recalcula ruta y métricas.
3. **LayerToggles:** interruptores HiRISE · Pendiente · Radiación · Térmico · Mineralogía, cada uno con etiqueta MEDIDO / DERIVADO / ESTIMADO.
4. **MetricsBar:** distancia · tiempo ida/vuelta · pendiente máx. · dosis · recurso (O₂ o batería) · RIESGO.
5. **NoteCard:** título, nota, foto, etiquetas, lat/lon y sol automáticos.
6. **Mapa:** ortofoto, capas, ruta, base, destino, zonas NO PISAR, notas, compañero.

### Responsivo

Un solo layout con CSS grid; los paneles cambian de sitio, no de contenido.

| Ancho | Dispositivo | Layout |
|---|---|---|
| < 640 px | Teléfono | Mapa a pantalla completa. TopBar compacta. Métricas en **hoja inferior** deslizable (cerrada: distancia, tiempo, riesgo). Capas y modo detrás de botones flotantes. |
| 640–1023 px | **Tablet (objetivo principal, horizontal)** | Mapa al fondo. TopBar arriba, capas a la izquierda, modo a la derecha, métricas abajo. Paneles flotantes. |
| ≥ 1024 px | Pantalla del hábitat | Igual que tablet + panel lateral derecho fijo con notas y avance de exploración. |

```
TABLET / HÁBITAT                              TELÉFONO
┌────────────────────────────────────────┐    ┌──────────────┐
│ [¿A dónde vamos?]   SOL 412·EVA 07·OK  │    │ [buscar] SOL │
│┌───────┐                      ┌───────┐│    │              │
││ CAPAS │                      │ MODO  ││    │     MAPA  [≡]│
││ ◉ Img │        MAPA          │ 🚶 ◉  ││    │           [⇄]│
││ ◉ Pend│                      │ 🛻    ││    │              │
││ ○ Rad │                      │ 🚐    ││    ├──────────────┤
│└───────┘                      └───────┘│    │ 2.4km·48min  │
│ 2.4 km · 48 min │12°│0.05mSv│68%│BAJO  │    │ RIESGO BAJO ▲│
└────────────────────────────────────────┘    └──────────────┘
```

Detalles: unidades `dvh` para la altura (barras del navegador móvil), `env(safe-area-inset-*)`, y `touch-action` correcto para que el mapa no pelee con el scroll de la hoja inferior.

**Modo HUD (extra):** `data-mode="hud"` en `<html>`. Cambia los tokens: fondos 100 % transparentes, sin blur, solo líneas y texto en cian con brillo suave; se oculta todo menos ruta, siguiente giro, distancia, recurso y riesgo, pegados a las esquinas para no tapar el centro de la visión. Para la demo se pone una foto de Curiosity de fondo simulando la vista del casco.

## 9. Cómo nos evalúan (Space Apps)

Impacto · Creatividad · Validez · Relevancia · Presentación. Traducción para nosotros:

- **Relevancia:** decir literalmente qué pide el reto y dónde lo cumplimos (≥ 3 tipos de datos, ruta que evita obstáculos, seguridad, radiación, movilidad con traje, fotos POV).
- **Validez:** etiquetas MEDIDO/ESTIMADO, tabla de supuestos, fuentes citadas.
- **Creatividad:** los modos de transporte y el mapa que el astronauta también escribe.
- **Presentación:** demo real funcionando, historia de una EVA concreta.

## 10. Glosario rápido

**EVA:** actividad extravehicular (caminata). **Sol:** día marciano (24 h 39 min). **DEM/DTM:** modelo digital de elevación. **HiRISE:** cámara de MRO, 25 cm/px. **RAD / REMS:** instrumentos de radiación y clima de Curiosity. **THEMIS:** cámara térmica de Mars Odyssey. **CRISM:** espectrómetro de MRO. **Boxwork:** crestas minerales en forma de red, formadas por agua subterránea. **POV:** vista a nivel de suelo.
