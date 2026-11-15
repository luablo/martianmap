# Plan personal P4 · Interfaz, integración e historia

> Archivo personal (está en `.gitignore`, no se sube). Fuente de verdad del equipo: [TAREAS.md §7](TAREAS.md) y [PLANEACION.md](PLANEACION.md).
> Todo el código vive en `Frontend/martianmap/`. Rama: **`p4/ui`**.

**Mis archivos:** `components/AppShell.tsx`, `components/panels/**`, `components/ui/**`, `app/**` (incluye `globals.css`), `presentacion/**`, `package.json` (solo yo instalo dependencias).
**No toco:** `lib/routing/**`, `lib/data/**`, `lib/notes/**` (desde el bloque 3 es de P2), `components/map/**`, `lib/types.ts` (solo en punto de control).

**Regla de cada fase:** al terminar → `npm run lint` + `npm run build` → probar a 1024×768 y 375×812 → fusionar a `main` → avisar en el chat qué cambió.

---

## Resumen de fases

| Fase | Hora | Qué sale | Fusiono a `main` |
|---|---|---|---|
| 0 · Infraestructura | 13:00–14:00 | Supabase, `.env.local`, Vercel publicando | Sí (si cambié algo) |
| 1 · Piezas base | 14:00–15:30 | `Button`, `Panel`, paneles usándolos | Sí |
| 2 · Pantalla con datos | 15:30–18:00 | Buscador de POI, clima, MetricsBar con estados | Sí, antes de las 18:00 |
| 🚩 Punto de control 1 | 18:00 | | |
| 3 · Notas (interfaz) | 18:00–20:00 | Modo nota, `NoteCard`, lista de notas | Sí |
| 4 · Integración y presentación | 20:30–22:00 | Etiquetas MEDIDO/ESTIMADO, guion, esqueleto de slides | Sí |
| 🚩 Punto de control 2 | 22:00 | | |
| 5 · Extras | 22:00–01:00 | Acerca de / supuestos, modo HUD | Sí, antes de dormir |
| 6 · Domingo | 07:00–11:30 | Capturas, video, slides, entrega | Solo correcciones |

---

## Fase 0 · Infraestructura (13:00–14:00)

**Meta:** que P2 tenga llaves de Supabase y que `main` se publique solo en Vercel.

- [ ] `git checkout main && git pull` (una vez que se fusione `base-frontend`) → `git checkout -b p4/ui`.
- [ ] `npm install` en `Frontend/martianmap` → `npm run dev` → se ve la zona sintética.
- [ ] **Supabase**
  - [ ] Crear proyecto (región más cercana, contraseña de BD en tu gestor de contraseñas).
  - [ ] SQL Editor → pegar el SQL de [CONTEXTO.md §7](CONTEXTO.md) (`evas`, `annotations`, `routes`, `positions` + políticas `anon`).
  - [ ] Storage → bucket **público** `field-photos`.
  - [ ] Database → Replication → activar Realtime en `annotations`.
  - [ ] Probar en el SQL Editor: `insert into annotations (...) values (...)` y `select` desde la API (Table Editor) para confirmar las políticas.
- [ ] **`.env.local`** en `Frontend/martianmap/`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  ```
  Confirmar que `git status` **no** lo muestra. Pasar las llaves a P2 por mensaje privado.
- [ ] **Vercel:** importar el repo, *Root Directory* = `Frontend/martianmap`, las mismas 2 variables, desplegar. Anotar la URL en el chat del equipo.
- [ ] Confirmar en la página de la sede el formato de entrega (duración del video, número de slides, pitch en vivo) y avisar al equipo.

**Listo cuando:** la URL de Vercel muestra la app y P2 confirmó que recibió las llaves.

---

## Fase 1 · Piezas base (14:00–15:30)

**Meta:** dejar de repetir clases; todo lo tocable mide ≥ 56 px.

- [ ] `components/ui/Button.tsx`
  ```ts
  type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "solid" | "ghost" | "danger";   // solid = turquesa, ghost = borde
    active?: boolean;                          // texto en color ruta
  };
  ```
  Siempre `type="button"` por defecto y clase `touch` (min 56 px).
- [ ] `components/ui/Panel.tsx`: `<section className="panel pointer-events-auto p-1.5">` + `title?: string` (reemplaza `PanelTitle` de AppShell).
- [ ] Usar `Panel` y `Button` en `AppShell.tsx` (paneles laterales, botones flotantes de teléfono), `ModeSwitch.tsx` y el botón de expandir de `MetricsBar.tsx`.
- [ ] Revisar foco visible (`focus-visible:ring-2 ring-route`) en `Button`, `Toggle` e input del buscador.

**Listo cuando:** la pantalla se ve igual que antes, pero sin clases repetidas, y se puede navegar con Tab.

---

## Fase 2 · Pantalla con datos de la zona (15:30–18:00)

**Meta:** que la barra superior y la de métricas usen los datos reales que llegan de P1 y P2.

### 2a. Buscador de destinos (`TopBar.tsx`)
- [ ] Nuevas props:
  ```ts
  { pois: Poi[]; weather: Weather | null; onPick: (p: Poi) => void }
  ```
- [ ] En AppShell: `pois={zone?.pois ?? []}`, `weather={zone?.weather ?? null}`, `onPick={(p) => setDestination([p.lon, p.lat])}`.
- [ ] Filtro sin acentos ni mayúsculas (`normalize("NFD").replace(/\p{M}/gu, "")`), sobre `name` y `description`.
- [ ] Lista desplegable debajo del input: filas ≥ 56 px, icono por `type` (base / objetivo morado `#A78BFA` / foto), nombre y distancia desde la base (`distanceM` de `lib/geo.ts`).
- [ ] Teclado: ↑ ↓ Enter Escape. Con el input vacío y enfocado, mostrar todos los objetivos (`type: "target"`) primero.
- [ ] Al elegir: cerrar la lista, poner el nombre en el input y quitar el foco (en teléfono baja el teclado).

### 2b. Chip de clima
- [ ] `TopBar`: chip `−78 / −8 °C` con `weather.tempMinC` / `tempMaxC`, `hidden lg:inline-flex`. Si `weather` es `null`, no se muestra.
- [ ] Chip `SOL 412` → `SOL {weather?.sol ?? 412}`.

### 2c. MetricsBar con estados
- [ ] Nueva prop `computing: boolean` → en AppShell `const { route, computing } = useRoute(...)`.
- [ ] Mientras `computing`: etiqueta `CALCULANDO…` parpadeando (respetar `prefers-reduced-motion`) y métricas anteriores atenuadas (`opacity-60`).
- [ ] Recurso: `text-warn` si < 50 %, `text-danger` si < 20 %.
- [ ] `warning` en una fila propia con icono, color `danger` si `risk === "ALTO"`, si no `warn`.
- [ ] Teléfono: cerrada muestra DISTANCIA, IDA, RIESGO; abierta las 6. Ya funciona: solo verificar que el aviso no tape el mapa (máx. 2 líneas, `line-clamp-2`).
- [ ] Botón "×" o tocar la base para borrar el destino (`setDestination(null)`).

**Listo cuando:** buscar "boxwork" y elegirlo dibuja la ruta igual que tocar el mapa; el clima aparece en tablet; con la ruta de P2 se ve "CALCULANDO…".

**🚩 18:00:** fusionar a `main`, comprobar Vercel en el teléfono. Si P2 aún no entrega `computing`, el valor queda en `false` y no rompe nada.

---

## Fase 3 · Notas de campo, interfaz (18:00–20:00)

**Meta:** que se pueda crear una nota con foto tocando el mapa; el guardado real lo hace P2 detrás de `useNotes`.

- [ ] **Modo nota en AppShell**
  ```ts
  type Tool = "route" | "note";
  const [tool, setTool] = useState<Tool>("route");
  const [draftAt, setDraftAt] = useState<LonLat | null>(null);
  const handleMapClick = (p: LonLat) =>
    tool === "note" ? setDraftAt(p) : setDestination(p);
  ```
  `onMapClick={handleMapClick}` en `<MapView/>` (no cambia las props de P3).
- [ ] Botón `+ NOTA` (flotante, esquina derecha arriba de MetricsBar en teléfono; en el panel derecho en tablet). Activo → borde morado y texto "Toca el mapa donde está el hallazgo".
- [ ] `components/panels/NoteCard.tsx`
  ```ts
  { at: LonLat; sol: number; onSave: (n: NewNote, photo?: File) => Promise<void>; onCancel: () => void }
  ```
  - Campos: título (obligatorio), nota, etiquetas como `Toggle` (MUESTRA / GEOLOGIA / REVISAR / PELIGRO; se muestra "GEOLOGÍA"), foto `<input type="file" accept="image/*" capture="environment">` con miniatura (`URL.createObjectURL`, liberarla al cerrar).
  - Automáticos: `lat`, `lon` (de `at`, mostrados con 5 decimales), `sol`, `localTime`, `author: "EVA 07"`.
  - Botón GUARDAR deshabilitado mientras guarda; error visible si falla.
  - Teléfono: hoja inferior a pantalla completa; tablet: panel derecho.
- [ ] **Pendiente de acordar con P2 (a las 18:00):** `addNote(n: NewNote)` no recibe la foto. Propuesta sin romper nada: segundo parámetro opcional `addNote(n, photo?: File)` en `useNotes`. Lo hace P2 en su archivo. Mientras tanto `NoteCard` llama `addNote(n)` y guarda la foto solo en la vista previa.
- [ ] **Lista de notas** (≥ 1024 px) en "NOTAS DE CAMPO": más recientes arriba, título, etiquetas y hora; por ahora solo se muestran. Centrar el mapa al tocar una nota necesita que P3 agregue una prop opcional `focus?: LonLat` a `MapView`; pedirlo solo si da tiempo.
- [ ] En teléfono, contador de notas en el botón `+ NOTA` (`3`).

**Listo cuando:** en modo nota, tocar el mapa abre la tarjeta; guardar la nota la hace aparecer en la lista y el siguiente toque vuelve a marcar destino.

---

## Fase 4 · Integración y presentación (20:30–22:00)

### 4a. Integración
- [ ] Jalar `main` y probar todo junto con los datos reales de P1 y la ruta de P2.
- [ ] `LayerToggles`: confirmar chips MEDIDO / DERIVADO / ESTIMADO con datos reales y "SIN DATOS" deshabilitado.
- [ ] Quitar el aviso "TERRENO SINTÉTICO" no hace falta: desaparece solo cuando `meta.fake` no existe. Verificar.
- [ ] Estados vacíos y de error: sin zona, sin ruta (`route === null` con destino puesto → "No hay ruta segura"), sin red.
- [ ] Prueba en un teléfono y una tablet reales sobre la URL de Vercel: sin scroll horizontal, nada debajo del notch, botones tocables con el pulgar.

### 4b. Presentación (`presentacion/`)
- [ ] `presentacion/guion.md`: historia de 6 pasos y video de 30 s de [PLANEACION.md §5](PLANEACION.md), con la lista de **tomas a grabar** (qué pantalla, qué modo, qué destino).
- [ ] Esqueleto de 7 slides (títulos + qué captura va en cada una). Herramienta: la que el equipo ya use (Google Slides / Canva).
- [ ] Pedir a P1 la tabla de fuentes para la slide 5 y a P3 capturas limpias.

**🚩 22:00:** recorrer el "mínimo que debe jalar" en Vercel. Si falta algo mío, no paso a la fase 5.

---

## Fase 5 · Extras (22:00–01:00, solo si el mínimo está completo)

### 5a. Acerca de / supuestos
- [ ] `components/panels/AboutSheet.tsx`: abre desde un botón "i" en TopBar.
- [ ] Tabla de modos desde `MODES` (pendiente máx, velocidad, alcance, recurso, blindaje) y de capas desde `LAYERS` (procedencia + fuente). Texto de fuentes que pase P1.
- [ ] Nota de honestidad: "Las cifras de dosis y recurso son estimaciones del modelo, no mediciones".

### 5b. Modo HUD
- [ ] `app/globals.css`: bloque `[data-mode="hud"]` que redefine tokens: fondos de panel transparentes, bordes de 1 px, texto más grande.
- [ ] Botón HUD en TopBar → `document.documentElement.dataset.mode = "hud" | ""` (guardar en `localStorage` con try/catch).
- [ ] En HUD, AppShell oculta paneles de capas, modo y notas; solo quedan ruta, distancia, recurso y riesgo en las esquinas.

**01:00 a dormir:** `main` compilando y 5 pendientes escritos para la mañana.

---

## Fase 6 · Domingo (07:00–11:30): video y entrega son prioridad 1

| Hora | Qué |
|---|---|
| 07:00–08:00 | Último detalle de interfaz. Probar en teléfono, tablet y laptop. |
| **08:00** | **Congelamiento.** Solo correcciones de errores. |
| 08:00–09:00 | Con P1: grabar capturas a 1080p en Vercel con la EVA 07 precargada (lista de tomas de `guion.md`). |
| 09:00–09:30 | **Primera versión fea del video** (30 s). |
| 09:30–10:30 | Video mejorado · slides terminadas con P3 · página del proyecto con P1 (incluye declaración de uso de IA). |
| 10:30–11:00 | Ensayo con cronómetro ×2. Revisión en ventana de incógnito. |
| **11:00–11:30** | **Subo la entrega** (video, URL de Vercel, repo público, página). P1 revisa. |

---

## Lista rápida de verificación (antes de cada fusión)

- [ ] `npm run lint` y `npm run build` sin errores
- [ ] 375×812: sin scroll horizontal, MetricsBar no tapa el destino
- [ ] 1024×768: paneles a los lados, mapa libre al centro
- [ ] Todo lo tocable ≥ 56 px; foco visible con teclado
- [ ] No edité archivos de otros (`git diff --stat main` solo muestra mis carpetas)
- [ ] Sin llaves en el código (`git grep -n "supabase.co"` vacío)
