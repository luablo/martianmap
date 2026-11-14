# MARSWALK — Planeación del hackathon

> 4 personas · ~23 h · Entrega: **domingo 15 nov, 12:00**.
> Contexto, datos, base de datos y diseño: [CONTEXTO.md](CONTEXTO.md).
> Las horas suponen arranque el **sábado a las 13:00**. Si arrancan más tarde, recorran los bloques pero **no muevan los puntos de control del domingo**.

---

## 1. Reglas del juego

1. **Primero lo mínimo, completo y desplegado.** Después los extras, de uno en uno.
2. **La presentación es un entregable, no un cierre.** Tiene dueño desde la hora 0 y el video se graba el domingo temprano, no al final.
3. **Nadie espera a nadie:** se trabaja contra el contrato de datos con datos falsos hasta que lleguen los reales.
4. **Regla de los 30 minutos:** si algo te atora 30 min, lo dices en el grupo. Si en 1 h no sale, se pasa al plan B.
5. **`main` siempre funciona.** Se despliega solo en Vercel en cada push.
6. **Congelamiento de funciones: domingo 08:00.** Después solo se arreglan errores.

## 2. Alcance

### Mínimo que debe jalar (sábado 22:00)

- [ ] Mapa de la zona de Gale con la ortofoto real
- [ ] Una ruta calculada de la base al objetivo, que evita zonas rojas
- [ ] Tres capas que se prenden y apagan: imagen, pendiente, radiación
- [ ] Cambio de modo (a pie / rover abierto / presurizado) que recalcula la ruta
- [ ] Barra de métricas: distancia, tiempo, pendiente máx., dosis, recurso, riesgo
- [ ] Se ve bien en tablet y en teléfono
- [ ] Publicado en Vercel

> **Si esto no está el sábado a las 22:00, se cancelan todos los extras** y la noche se usa para terminarlo.

### Extras, en este orden (uno a la vez)

| # | Extra | Costo | Por qué vale |
|---|---|---|---|
| 1 | **Notas de campo** con foto y coordenada (Supabase) | 2–3 h | "El astronauta también escribe el mapa" |
| 2 | **Fotos POV de Curiosity** en puntos del mapa | 1 h | Lo sugiere el reto; muy visual en el video |
| 3 | **Tiempo real:** la nota aparece en otro dispositivo | 1 h (si ya está el 1) | El momento "wow" de la demo |
| 4 | **Modo HUD** (tema transparente) | 1–2 h | Dos formatos con el mismo código |
| 5 | Capa térmica THEMIS | 1–2 h | Cuarto tipo de dato |
| 6 | Avance de exploración (% recorrido, muestras) | 1–2 h | Bonito, no esencial |
| 7 | Mineralogía CRISM | 3 h+ | **Casi seguro se recorta** |

### Qué se recorta si vamos tarde (de primero a último)

Mineralogía → avance de exploración → térmico → HUD → tiempo real → fotos POV → notas (pasan a `localStorage`) → buscador (se reemplaza por tocar el mapa).
**Nunca se recortan:** ruta, modos, tres capas, video.

## 3. Equipo

Las 4 personas programan. Cada quien es **dueño** de un área (decide y responde por ella) y tiene un respaldo.

| Rol | Dueño de | Carpetas | Respaldo |
|---|---|---|---|
| **P1 — Datos** | Bajar, recortar, calcular pendiente, exportar capas, `FUENTES.md`. Después: validación científica y supuestos. | `data-pipeline/`, `public/data/` | P2 |
| **P2 — Ruta** | A*, costos por modo, métricas, Web Worker. Desde el bloque 3: código de notas con Supabase. | `lib/routing/`, `lib/modes.ts`, `lib/metrics.ts`, `lib/notes/` | P1 |
| **P3 — Mapa** | MapLibre, ortofoto, capas, dibujar ruta y marcadores, interacción táctil. | `components/map/` | P4 |
| **P4 — Interfaz e historia** | Sistema de diseño, paneles, responsivo, integración (`AppShell`), proyecto de Supabase. **Dueño de la presentación y el video.** | `components/AppShell.tsx`, `components/panels/`, `components/ui/`, `app/`, `presentacion/` | P3 |

Cada carpeta tiene un solo dueño: casi no habrá conflictos de git. **El detalle de código por persona, los archivos compartidos y las reglas de git están en [TAREAS.md](TAREAS.md).**

**Asignen nombres ahora:** P1 = ______ · P2 = ______ · P3 = ______ · P4 = ______

## 4. Cronograma

### Sábado

#### 13:00–14:00 · Arranque (todos juntos)

- [ ] Leer CONTEXTO.md y confirmar: zona, objetivo científico, guion de la EVA
- [ ] Asignar roles y aprobar el contrato de datos (`lib/types.ts`, `meta.json`)
- [ ] **P1:** empezar a bajar/recortar datos **ya** (es lo más lento)
- [ ] **P2:** script de terreno falso con el formato del contrato → `public/data/gale/`
- [ ] **P3:** instalar `maplibre-gl`, página con mapa vacío; conectar Vercel al repo
- [ ] **P4:** tokens de color en `globals.css`, fuentes, proyecto Supabase creado, llaves en `.env.local` y en Vercel

#### 14:00–18:00 · Bloque 1 — Rebanada vertical

| | Tarea | Listo cuando… |
|---|---|---|
| **P1** | Recortar DEM y ortofoto (~3 × 3 km), calcular pendiente, exportar `ortho.webp`, `slope.bin`, `slope.png`, `meta.json` | Los archivos reales reemplazan a los falsos sin cambiar código |
| **P2** | A* en malla con 8 vecinos, costo por pendiente, celdas prohibidas; pruebas con el terreno falso | `findRoute(a, b, modo)` devuelve camino y métricas en < 1 s |
| **P3** | Ortofoto como capa de imagen, límites de la zona, marcadores de base y destino, tocar el mapa = elegir destino | Se ve Gale y se puede marcar un punto |
| **P4** | Componentes base (Panel, Botón ≥ 56 px, Toggle, Chip), TopBar, ModeSwitch, MetricsBar con datos de mentira, grid responsivo | La pantalla completa existe en tablet y teléfono, sin lógica |

**🚩 Punto de control 1 — 18:00 (15 min, de pie):** ortofoto real en pantalla, desplegado en Vercel, A* pasando pruebas. *Si los datos reales no están:* P2 ayuda a P1 una hora; si a las 19:00 siguen sin estar → plan B de datos (un solo DTM HiRISE).

#### 18:00–22:00 · Bloque 2 — Juntar todo

| | Tarea |
|---|---|
| **P1** | `nogo.geojson` y `pois.geojson` (base, objetivos boxwork), `weather.json` de REMS, valor RAD con su cita. Revisar que la ruta "tenga sentido" sobre la imagen. |
| **P2** | Worker conectado al mapa, los tres modos, dosis/recurso/riesgo, ruta de regreso. |
| **P3** | Dibujar ruta (línea turquesa con borde), capa de pendiente y de radiación con opacidad, zonas rojas con rayado, leyenda. |
| **P4** | Conectar paneles al estado real (modo, capas, métricas), etiquetas MEDIDO/ESTIMADO, hoja inferior en teléfono. **Empezar esqueleto de slides y guion del video.** |

Cena: 20:00, 30 min, escalonada si hace falta.

**🚩 Punto de control 2 — 22:00 · ¿SIGUE O SE RECORTA?** Recorrer la lista del "mínimo que debe jalar" en la versión de Vercel, en una tablet o teléfono real.
- Todo marcado → se eligen **máximo 2 extras** para la noche.
- Falta algo → nadie toca extras; todos a cerrar el mínimo.

#### 22:00–01:00 · Bloque 3 — Extras y pulido

| | Si el mínimo está completo |
|---|---|
| **P1** | Extra 2: bajar 8–12 fotos POV de Curiosity y ligarlas a `pois.geojson`. Luego: tabla de supuestos y fuentes para la presentación. |
| **P2** | Casos límite: destino inalcanzable, fuera de alcance, recurso insuficiente (mensajes claros). Luego apoya el Extra 1. |
| **P3** | Mostrar notas y fotos POV en el mapa; pulir zoom, gestos y rendimiento. |
| **P4** | Extra 1: tablas en Supabase, NoteCard, guardar nota con foto. Extra 3 si sobra. |

**01:00 — Todos a dormir.** Mínimo 5.5 h. Un equipo desvelado graba un mal video y rompe `main` a las 10:00. Antes de dormir: `main` funcionando y una lista de 5 pendientes para la mañana.

### Domingo

| Hora | Qué | Quién |
|---|---|---|
| 07:00–08:00 | Último extra pequeño o cerrar pendientes. Probar en teléfono, tablet y laptop. | Todos |
| **08:00** | **🚩 Congelamiento de funciones.** Desde aquí solo errores. | — |
| 08:00–09:00 | Corrección de errores · datos de demo fijos (EVA 07 precargada) · **grabar capturas de pantalla para el video** | P2, P3 errores · P4, P1 graban |
| 09:00–10:30 | Editar video · terminar slides · texto de la página del proyecto · README con cómo correrlo | P4 video · P1 texto y fuentes · P3 slides · P2 README y errores |
| 10:30–11:00 | Ensayo de la presentación con cronómetro, 2 veces. Revisión final en ventana de incógnito. | Todos |
| **11:00–11:30** | **ENTREGAR.** Subir video, enlaces, repo público, página del proyecto. | P4 sube, P1 revisa |
| 11:30–12:00 | Colchón. No se toca nada salvo que la entrega haya fallado. | — |

## 5. Presentación y video

**Dueño: P4.** Todos aportan. Confirmen en la página de su sede el formato exacto (duración del video, número de slides, si hay pitch en vivo) **en la hora de arranque**.

### Historia (la misma en video, slides y pitch)

1. **Problema (1 frase):** "Los mapas de Marte se hicieron para mirar el planeta, no para caminarlo."
2. **Quién:** dos astronautas, Sol 412, quieren muestrear boxwork a 2.4 km.
3. **Solución:** marcan el destino → ruta segura → cambian de modo → la ruta cambia.
4. **Por qué confiar:** datos reales de HiRISE, RAD y REMS; cada capa dice si es medida o estimada.
5. **Lo distinto:** el astronauta escribe el mapa; el compañero lo ve al instante.
6. **Cierre:** "MARSWALK: el camino seguro, a un toque — incluso con guantes."

### Video de 30 s (guion por segundos)

| Seg. | Imagen | Voz / texto |
|---|---|---|
| 0–5 | Foto real de Curiosity en Mount Sharp, texto encima | "Sol 412. Tu objetivo está a 2.4 km. ¿Por dónde caminas?" |
| 5–12 | Buscar destino, aparece la ruta turquesa esquivando la zona roja | "MARSWALK calcula la ruta más segura con datos reales de NASA." |
| 12–18 | Cambiar a pie → rover abierto → presurizado; la ruta cambia | "Cambia cómo te mueves. El camino cambia contigo." |
| 18–24 | Prender capas; métricas de dosis y oxígeno | "Pendiente, radiación, oxígeno: el peligro se ve, no se lee." |
| 24–28 | Nota con foto que aparece en un segundo dispositivo | "Y cada hallazgo se queda en el mapa." |
| 28–30 | Logo + enlace | "MARSWALK." |

Grabar la pantalla a 1080p en la versión de Vercel, sin cursor nervioso, con datos de demo fijos. Música libre de derechos. **Tener una primera versión fea el domingo a las 09:30**; una mejor después si da tiempo.

### Slides (7 máximo)

1. Título + la frase + captura del mapa
2. El hueco: Mars Trek/USGS son regionales → nosotros hiperlocal
3. Demo: destino → ruta (captura o GIF)
4. Modos de transporte: tres rutas, mismo destino
5. Capas y honestidad: tabla de datos con MEDIDO / DERIVADO / ESTIMADO y fuentes
6. Notas de campo y tiempo real · formatos tablet / HUD
7. Cómo está hecho, supuestos, qué sigue · equipo · enlaces

### Página del proyecto (texto)

- [ ] Resumen en 2–3 frases
- [ ] Cómo responde al reto (lista punto por punto)
- [ ] **Datos de NASA usados**, con enlaces (de `FUENTES.md`)
- [ ] Supuestos y limitaciones
- [ ] **Uso de IA:** declarar que se usaron asistentes de IA para código y documentación (Space Apps lo exige)
- [ ] Enlaces: demo en Vercel, repo público, video

## 6. Forma de trabajo

- **Git:** ramas cortas `nombre/tarea`, PR o merge directo a `main` cada 1–2 h. Antes de fusionar: `npm run build` sin errores. Nada de ramas de 6 horas.
- **Comunicación:** un solo chat. Cada punto de control dura 15 min, de pie, tres preguntas: qué terminé, qué sigue, qué me atora.
- **Tablero:** las casillas de este archivo. Márquenlas.
- **Secretos:** las llaves de Supabase van en `.env.local` (ya ignorado por git) y en Vercel. Nunca en el repo.
- **Next.js 16:** tiene cambios respecto a versiones anteriores; leer `Frontend/martianmap/AGENTS.md` antes de escribir código.

## 7. Riesgos y plan B

| Riesgo | Señal de alarma | Plan B |
|---|---|---|
| Archivos de datos enormes o lentos | 15:00 y no hay recorte | Recorte remoto con GDAL → un solo DTM HiRISE → teselas de Mars Trek como fondo + DEM más grueso |
| La zona boxwork no tiene DEM de 1 m | Hueco o bordes en el recorte | Mover el recorte a donde sí haya cobertura sobre el recorrido de Curiosity y ajustar el guion |
| A* lento en el navegador | > 2 s por ruta | Malla a 8 m/celda; limitar la búsqueda a un rectángulo alrededor de origen y destino |
| La ruta "se ve rara" | Zigzag o cruza escarpes | Suavizar la línea al dibujarla; subir el peso de la pendiente; añadir polígono NO PISAR a mano |
| MapLibre + Next.js (SSR) | Error `window is not defined` | Componente cliente cargado de forma dinámica sin SSR |
| Supabase o red fallan en la demo | — | Notas en `localStorage`; el video ya muestra el tiempo real |
| Querer hacer todo | Tres extras a medias a medianoche | Regla del punto de control 2: máximo 2 extras, uno a la vez |
| Video al final | Domingo 10:00 sin video | Versión fea obligatoria a las 09:30 |
| Alguien se queda atorado en silencio | Sin commits en 2 h | Regla de los 30 minutos + respaldo asignado |

## 8. Lista final antes de entregar

- [ ] La demo abre en incógnito, en teléfono y en laptop
- [ ] La EVA de demo carga sola y la ruta aparece sin tocar nada raro
- [ ] Cada capa muestra MEDIDO / DERIVADO / ESTIMADO
- [ ] Supuestos visibles (pantalla "Acerca de" o en el README)
- [ ] Repo público, README con pasos para correrlo, sin llaves secretas
- [ ] Fuentes de NASA citadas con enlace
- [ ] Declaración de uso de IA
- [ ] Video subido y enlace probado desde otra cuenta
- [ ] Página del proyecto completa y **enviada antes de las 11:30**
