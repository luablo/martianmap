# MARSWALK · Lista de entrega (domingo)

> Dueño: P4. Fase 6 del plan. P1 revisa antes de subir.
> Material listo en esta carpeta: `guion.md`, `slides.md`, `capturas/`, `capturar.mjs`, `video-subtitulos.srt`, `pagina-proyecto.md`.
> **Decisión (dom 15 nov): no habrá slides; la presentación es solo el video.** App: https://martianmap-rosy.vercel.app

---

## 07:00–08:00 · Último detalle de interfaz
- [x] Recorrido en 1920×1080, 1024×768 (tablet) y 375×812 (teléfono) con `capturar.mjs`.
- [x] Corregido: en teléfono los botones CAPAS / MODO / + NOTA tapaban el aviso "TERRENO SINTÉTICO".
- [x] Corregido: en MAPA BASE no se veía el círculo de las opciones no elegidas.
- [x] Probar en un teléfono real sobre la URL de Vercel (y notas en tiempo real entre dos dispositivos).

## 08:00 · Congelamiento
Desde aquí solo correcciones de errores. Nada de funciones nuevas.

## 08:00–09:00 · Capturas finales
- [x] Jalar `main` con los datos reales de P1 y la ruta de P2 (dom 15 nov, 01:00).
- [x] Regrabar todas las tomas con los datos reales (en local; repetir contra Vercel cuando esté publicada):
  ```
  node presentacion/capturar.mjs https://<app>.vercel.app
  ```
- [x] Revisar `capturas/`: la ruta ya no es línea recta y rodea las pendientes (toma B).
- [x] ~~Subir las capturas nuevas a las slides~~ — no aplica: sin slides.

| Archivo | Toma | Slide |
|---|---|---|
| `A-buscar.png` | A · buscar «boxwork» | 3 |
| `B-ruta.png` | B · ruta a B-4 | 1 y 3 |
| `C1-a-pie.png` · `C2-rover-abierto.png` · `C3-presurizado.png` | C · modos | 4 |
| `D-radiacion.png` | D · capa de radiación | 5 |
| `E1-nota-tarjeta.png` · `E2-nota-guardada.png` | E · nota de campo | 6 |
| `F-telefono.png` | F · teléfono | 6 |
| `G-supuestos.png` | Pantalla de supuestos | respaldo para preguntas |
| `H-hud.png` · `I-tablet.png` | Modo HUD y tablet | respaldo |

## 09:00–09:30 · Primera versión fea del video (30 s)
- [ ] Grabar la pantalla siguiendo la tabla de `guion.md` §2 (las tomas en video, no en foto).
- [ ] Toma E con dos ventanas: Supabase en tiempo real ya funciona.
- [ ] Música libre de derechos (YouTube Audio Library o Pixabay Music).
- [ ] Subtítulos: importar `video-subtitulos.srt` en el editor (CapCut, Clipchamp, DaVinci).

## 09:30–10:30 · Pulir
- [ ] Video mejorado (cortes en los 1.5 s de cada modo, zoom a DOSIS y OXÍGENO).
- [x] ~~Slides con P3~~ — no aplica: sin slides.
- [x] ~~Slide 7~~ — no aplica: sin slides (Supabase sí quedó conectado).
- [ ] Página del proyecto: ya tiene fuentes, repo, URL de Vercel y Supabase; ya tiene los nombres; falta `[enlace del video]` (también en `README.md`).

## 10:30–11:00 · Ensayo
- [ ] Ver el video completo ×2 antes de subirlo (audio, subtítulos, duración).
- [ ] Abrir la URL de Vercel en una ventana de incógnito: carga, busca, traza ruta, cambia modo.
- [x] ~~Exportar slides a PDF~~ — no aplica: sin slides.

## 11:00–11:30 · Subir la entrega
- [ ] Video (enlace público, sin restricción de edad ni región).
- [ ] URL de Vercel.
- [ ] Repositorio público en GitHub (revisar que no haya llaves: `git grep -n "supabase.co"` vacío y `.env.local` fuera).
- [ ] Página del proyecto con la declaración de uso de IA.
- [ ] P1 revisa todo antes de enviar.
