# MARSWALK · Guion de la presentación y el video

> Dueño: P4. Fuente de la historia: [PLANEACION.md §5](../PLANEACION.md). Datos y supuestos: [CONTEXTO.md](../CONTEXTO.md).
> **Antes de grabar:** confirmar en la página de la sede la duración del video, el número de slides y si hay pitch en vivo.

---

## 1. La historia (la misma en video, slides y pitch)

| # | Momento | Frase |
|---|---|---|
| 1 | Problema | "Los mapas de Marte se hicieron para mirar el planeta, no para caminarlo." |
| 2 | Quién | Dos astronautas, **Sol 412, EVA 07**, quieren muestrear el boxwork **B-4**, a 2.4 km de la base por la ruta segura a pie. |
| 3 | Solución | Buscan el destino → aparece la ruta → cambian de modo → la ruta y el riesgo cambian. |
| 4 | Por qué confiar | Datos de HiRISE, RAD y REMS; cada capa dice si es **MEDIDO**, **DERIVADO** o **ESTIMADO**. |
| 5 | Lo distinto | El astronauta escribe el mapa: una nota con foto aparece al instante para el compañero. |
| 6 | Cierre | "MARSWALK: el camino seguro, a un toque — incluso con guantes." |

**El giro de la demo (úsalo):** a pie, B-4 sale con riesgo **ALTO**: la ruta segura mide 2.4 km (1 h 7 min de ida) y el alcance a pie es de 2 km. Al cambiar a **rover abierto**, la ruta es de 1.8 km y 14 min y el riesgo baja a **MEDIO**; en **presurizado**, 1.9 km y 11 min, también MEDIO y con la mitad de dosis. Eso es justo lo que la app debe enseñar: *el modo cambia la decisión*.

---

## 2. Video de 30 s

| Seg. | Imagen | Voz / texto en pantalla |
|---|---|---|
| 0–5 | Foto real de Curiosity en Mount Sharp, texto encima | "Sol 412. Tu objetivo está a 2.4 km. ¿Por dónde caminas?" |
| 5–12 | Toma A + B: buscar "boxwork", elegir B-4, aparece la ruta | "MARSWALK calcula la ruta más segura con datos reales de NASA." |
| 12–18 | Toma C: A pie (ALTO) → Rover abierto → Presurizado | "Cambia cómo te mueves. El camino cambia contigo." |
| 18–24 | Toma D: prender Pendiente y Radiación; zoom a DOSIS y OXÍGENO | "Pendiente, radiación, oxígeno: el peligro se ve, no se lee." |
| 24–28 | Toma E: nota con foto que aparece en un segundo dispositivo | "Y cada hallazgo se queda en el mapa." |
| 28–30 | Logo + URL de Vercel | "MARSWALK." |

Música libre de derechos (YouTube Audio Library o Pixabay Music). Subtítulos siempre: muchos jueces ven sin sonido.

---

## 3. Lista de tomas (grabar en la versión de Vercel, 1080p)

> **Capturas fijas (slides) automáticas:** `node presentacion/capturar.mjs https://<app>.vercel.app` repite las tomas A–F (más supuestos, HUD y tablet) y guarda los PNG en `presentacion/capturas/`. Las de `capturas/` ya son con los datos reales de HiRISE (dom 15 nov, 01:10). El video sí se graba a mano con esta tabla.

**Preparación (una vez):**
- [ ] Ventana del navegador a **1920 × 1080**, zoom 100 %, sin extensiones ni barra de marcadores.
- [ ] Cursor grande o resaltado de clics activado; mover el mouse despacio.
- [ ] Recargar la app antes de cada toma (sin destino, modo **A pie**, solo **Pendiente** encendida).
- [ ] Para la toma E: dos ventanas lado a lado o tablet + laptop, ambas en la URL de Vercel.

| Toma | Qué se hace en la app | Qué debe verse | Dura |
|---|---|---|---|
| **A · Buscar** | Clic en "¿A dónde vamos?" → escribir `boxwork` | La lista con B-4 y B-2 y su distancia | 4 s |
| **B · Ruta** | Elegir **Boxwork B-4** | La ruta turquesa desde BASE, la barra con DISTANCIA / IDA / RIESGO | 4 s |
| **C · Modos** | MODO: A pie → Rover abierto → Presurizado (pausa de 1.5 s en cada uno) | A pie: 2.4 km, **ALTO**, «Fuera de alcance» · Rover abierto: 1.8 km, 14 min, MEDIO · Presurizado: 1.9 km, 11 min, MEDIO | 6 s |
| **D · Capas** | CAPAS: prender **Radiación** | La ruta se pinta de turquesa a ámbar, etiqueta DOSIS, leyenda con ESTIMADO | 6 s |
| **E · Nota** | **+ NOTA** → tocar junto a B-4 → título "Veta clara en la cresta", GEOLOGÍA + MUESTRA, foto → Guardar | La nota aparece en NOTAS DE CAMPO y sigue ahí al recargar (y en el otro dispositivo si Supabase está conectado; sin Supabase, solo entre pestañas del mismo navegador) | 6 s |
| **F · Teléfono** (respaldo) | Vista de teléfono (375 × 812) con la ruta y la barra inferior | Que se usa con una mano; botones grandes | 4 s |

> Si el tiempo real de Supabase no está listo el domingo, la toma E se graba en un solo dispositivo y la voz dice "cada hallazgo se queda en el mapa" (sin "al instante").

**Primera versión fea del video: domingo 09:30.** Una mejor después, si da tiempo.

---

## 4. Pitch en vivo (si lo piden, ~2 min)

1. **(15 s)** Problema + quién (frases 1 y 2).
2. **(60 s)** Demo en vivo siguiendo las tomas A → D. Si falla la red: video de respaldo.
3. **(20 s)** Por qué confiar: abrir CAPAS y señalar MEDIDO / DERIVADO / ESTIMADO.
4. **(15 s)** Notas de campo (toma E).
5. **(10 s)** Cierre (frase 6) + URL.

**Preguntas probables y respuesta corta:**
- *¿Los datos son reales?* — La imagen y la pendiente vienen del modelo de elevación HiRISE DTEEC_001488_1750 (cráter Gale); la base, los objetivos y las zonas NO PISAR los marcó el equipo. La radiación es una tasa medida por RAD y la dosis por ruta es **estimada**.
- *¿Por qué 15° a pie?* — Supuesto conservador para traje presurizado; está en la pantalla de supuestos y en CONTEXTO.md.
- *¿Funciona sin internet?* — Los datos de la zona van dentro de la app; las notas se guardan localmente si no hay red.

---

## 5. Supuestos del modelo (para slide 5 y preguntas)

| Modo | Pendiente máx | Velocidad | Alcance | Recurso | Blindaje |
|---|---|---|---|---|---|
| A pie | 15° | 3 km/h | 2 km | Oxígeno | 1 (ninguno) |
| Rover abierto | 25° | 10 km/h | 20 km | Batería | 1 (ninguno) |
| Presurizado | 18° | 14 km/h | 100 km | Autonomía | 0.5 |

- Dosis: tasa de superficie de **0.67 mSv/día** (MSL RAD) × tiempo de ida y vuelta × blindaje → 0.062 mSv a pie y 0.013 mSv en rover abierto para B-4. **ESTIMADO.**
- Reserva: el recurso debe alcanzar para volver con **20 %** de margen.
- Fuentes y enlaces: `RESOURCES.md` y la sección «Datos de NASA usados» de `pagina-proyecto.md`.

---

## 6. Pendientes de otros

- [x] **P1:** tabla de fuentes con enlaces (ya está en `pagina-proyecto.md` y `RESOURCES.md`).
- [ ] **P1:** foto real de Curiosity para el segundo 0 del video (con su crédito NASA/JPL-Caltech).
- [x] **P3:** capturas limpias con la ortofoto real (las saca `capturar.mjs`).
- [x] **P2:** la ruta real rodea las pendientes (A* de Fer, probado en los 3 modos).
- [ ] **P4/P2:** notas en tiempo real entre dispositivos: falta crear el proyecto de Supabase (`supabase/schema.sql`) y poner las llaves.
