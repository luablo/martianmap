# MARSWALK

**El camino seguro por Marte, a un toque — incluso con guantes.**

NASA Space Apps Challenge 2026 · Reto *Interplanetary Survival Guide: Martian Map*.

**▶ Probar la app: https://martianmap-rosy.vercel.app** (funciona en escritorio, tablet y teléfono; las notas de campo se comparten en tiempo real).

Los mapas de Marte que existen se hicieron para mirar el planeta desde órbita, no para caminarlo. MARSWALK es un mapa hiperlocal para una caminata extravehicular (EVA): el astronauta elige un destino y la app traza la ruta segura desde la base, con distancia, tiempo, riesgo, dosis de radiación estimada y el recurso que le queda al volver.

![Ruta a pie hasta Boxwork B-4 sobre la imagen HiRISE de Gale](presentacion/capturas/C1-a-pie.png)

## Qué hace

- **Ruta segura.** Un A* sobre la pendiente real (4 m por celda) evita las pendientes que el modo no aguanta y las zonas NO PISAR. Corre en un Web Worker para no congelar la pantalla.
- **El modo cambia la decisión.** A pie, rover abierto o rover presurizado: cada uno con su pendiente máxima, velocidad, alcance, recurso y blindaje. En la demo, Boxwork B-4 queda a 2.4 km a pie (riesgo ALTO, fuera de alcance) y a 1.8 km en rover abierto (riesgo MEDIO).
- **Cada número dice de dónde sale.** Las capas se marcan como MEDIDO, DERIVADO o ESTIMADO, y el botón «i» muestra todos los supuestos y las fuentes.
- **Notas de campo.** Se toca el lugar de un hallazgo y se deja una nota con etiquetas y foto. Con Supabase se comparte en tiempo real; sin red, se guarda en el dispositivo.
- **Pensado para guantes.** Todo lo tocable mide al menos 56 px. Funciona en escritorio, tablet, teléfono y en modo HUD (solo distancia, riesgo y recurso en las esquinas).

## Datos de NASA

| Dato | Producto | Uso en la app |
|---|---|---|
| Imagen | HiRISE PSP_001488_1750 (MRO) | Fondo del mapa · MEDIDO |
| Elevación | DTM HiRISE DTEEC_001488_1750, 1 m/px | Pendiente a 4 m por celda · DERIVADO |
| Radiación | MSL RAD, 0.67 mSv/día (Hassler et al. 2014) | Dosis por ruta · ESTIMADO |
| Clima | MSL REMS, sol 412 | Temperatura en la barra superior |
| Mapas base | NASA Mars Trek (Viking, MOLA, MOLA + HRSC) | Contexto alrededor de la zona |

La zona es un recorte del cráter Gale (137.24–137.35 °E, 4.72–4.95 °S). La base de la EVA, los objetivos y las zonas NO PISAR son supuestos del equipo marcados sobre la imagen. Fuentes, herramientas y cómo se hizo todo (en inglés): [RESOURCES.md](RESOURCES.md).

## Correrlo

En línea: **https://martianmap-rosy.vercel.app** (Vercel publica `main` automáticamente; las notas usan Supabase).

En local:

```bash
cd Frontend/martianmap
npm install
npm run dev
```

Abrir http://localhost:3000. Las notas compartidas son opcionales: para activarlas, crear un proyecto de Supabase, correr [supabase/schema.sql](supabase/schema.sql) y poner `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `Frontend/martianmap/.env.local`.

Pruebas de la ruta: `npx tsx scripts/test-route.ts` (dentro de `Frontend/martianmap`).

## Cómo está hecho

| Carpeta | Qué hay |
|---|---|
| `Frontend/martianmap/` | Next.js 16, React 19, Tailwind 4 y MapLibre GL |
| `Frontend/martianmap/lib/routing/` | A*, Web Worker y métricas |
| `Frontend/martianmap/public/data/gale/` | Datos de la zona ya procesados |
| `data-pipeline/` | Python (rasterio, NumPy, Pillow): recorte, pendiente y exportación |
| `supabase/` | Esquema de la base de datos de notas (Postgres, Realtime y Storage) |
| `presentacion/` | Guion, slides, subtítulos y el script que saca las capturas |

Fuentes y herramientas: [RESOURCES.md](RESOURCES.md). Más contexto: [CONTEXTO.md](CONTEXTO.md) (supuestos y diseño) y [TAREAS.md](TAREAS.md) (quién hizo qué).

## Limitaciones conocidas

- La dosis y el recurso son estimaciones del modelo, no mediciones.
- Las notas en Supabase no piden inicio de sesión (decisión de hackathon).
- Térmico (THEMIS) y mineralogía (CRISM) tienen lugar en la app, pero todavía no hay datos procesados para esta zona.

## Uso de inteligencia artificial

El equipo usó asistentes de IA (Claude) como apoyo para escribir y revisar código, resolver conflictos de git y redactar documentación. Las decisiones de diseño, los supuestos del modelo y la elección de datos son del equipo; el código se revisó y probó antes de integrarlo.
