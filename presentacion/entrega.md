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
- [x] Video armado con Remotion (`presentacion/video/`) a partir de capturas reales de la app en inglés (`capturar-en.mjs`) y el guion `video-script-en.md`, con la voz del equipo.
- [x] Toma E: nota de campo con foto que queda en el mapa.
- [x] Música: `music/drone.wav` es libre de derechos (confirmado por el equipo).
- [x] Subtítulos en inglés integrados en el video (componente `Subtitles` de `Video.tsx`).

## 09:30–10:30 · Pulir
- [x] Video final de 29.5 s (885 cuadros a 30 fps), por debajo del límite de 30 s.
- [x] ~~Slides con P3~~ — no aplica: sin slides.
- [x] ~~Slide 7~~ — no aplica: sin slides (Supabase sí quedó conectado).
- [x] Página del proyecto completa: fuentes, repo, URL de Vercel, Supabase, nombres y video (https://drive.google.com/file/d/1jNl4tkWjWRfV7VHoph0uLnI0YVjWQJjU/view?usp=sharing). También en `README.md` y `README.es.md`.

## 10:30–11:00 · Ensayo
- [ ] Ver el video completo ×2 antes de subirlo (audio, subtítulos, duración).
- [ ] Abrir la URL de Vercel en una ventana de incógnito: carga, busca, traza ruta, cambia modo.
- [x] ~~Exportar slides a PDF~~ — no aplica: sin slides.

## 11:00–11:30 · Subir la entrega
- [x] Video con enlace público de Google Drive (se abre sin iniciar sesión; comprobado dom 15 nov).
- [x] URL de Vercel: https://martianmap-rosy.vercel.app
- [x] Repositorio público en GitHub, sin llaves (`git grep` sin URL ni llave de Supabase; `.env.local` fuera del repo).
- [x] Página del proyecto con la declaración de uso de IA.
- [x] Video revisado por el equipo.
- [ ] Volver a subir el video final (`presentacion/video/out/marswalk-demo-voz-equipo-v3.mp4`: corrige «Bistronauts» en el inicio y el final y agrega la marca «Generated with AI assistance») en Drive con *Administrar versiones → Subir nueva versión*, para que el enlace no cambie.
- [ ] Llenar el formulario con [`space-apps-submission.md`](space-apps-submission.md) (todos los campos en inglés, listos para pegar).
- [ ] **Enviar con «Submit for Judging»** en el sitio de Space Apps antes del domingo 15 nov, 11:59 p. m. (hora local).
