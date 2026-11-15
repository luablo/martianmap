# MARSWALK · Lista de entrega (domingo)

> Dueño: P4. Fase 6 del plan. P1 revisa antes de subir.
> Material listo en esta carpeta: `guion.md`, `slides.md`, `capturas/`, `capturar.mjs`, `video-subtitulos.srt`, `pagina-proyecto.md`.
> Slides: [MARSWALK · Pitch](https://claude.ai/artifact/2M422wToS83dVPDy2DFDop) (privada hasta que se comparta desde Share; se exporta a PPTX o PDF).

---

## 07:00–08:00 · Último detalle de interfaz
- [x] Recorrido en 1920×1080, 1024×768 (tablet) y 375×812 (teléfono) con `capturar.mjs`.
- [x] Corregido: en teléfono los botones CAPAS / MODO / + NOTA tapaban el aviso "TERRENO SINTÉTICO".
- [x] Corregido: en MAPA BASE no se veía el círculo de las opciones no elegidas.
- [ ] Probar en un teléfono y una tablet reales sobre la URL de Vercel.

## 08:00 · Congelamiento
Desde aquí solo correcciones de errores. Nada de funciones nuevas.

## 08:00–09:00 · Capturas finales
- [x] Jalar `main` con los datos reales de P1 y la ruta de P2 (dom 15 nov, 01:00).
- [x] Regrabar todas las tomas con los datos reales (en local; repetir contra Vercel cuando esté publicada):
  ```
  node presentacion/capturar.mjs https://<app>.vercel.app
  ```
- [x] Revisar `capturas/`: la ruta ya no es línea recta y rodea las pendientes (toma B).
- [ ] Subir las capturas nuevas a las slides (reemplazar imagen en cada slide).

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
- [ ] Toma E con dos ventanas si Supabase en tiempo real funciona; si no, una sola y la voz sin «al instante».
- [ ] Música libre de derechos (YouTube Audio Library o Pixabay Music).
- [ ] Subtítulos: importar `video-subtitulos.srt` en el editor (CapCut, Clipchamp, DaVinci).

## 09:30–10:30 · Pulir
- [ ] Video mejorado (cortes en los 1.5 s de cada modo, zoom a DOSIS y OXÍGENO).
- [ ] Slides con P3: llenar `[4 nombres]`, `[URL de Vercel]`, `[repo]`, `[video]` y la tabla de fuentes de P1 (slide 5).
- [ ] Slide 7: quitar «Supabase» si no quedó conectado (las notas igual se guardan en el dispositivo).
- [ ] Página del proyecto: ya tiene fuentes y repo; faltan `[URL de Vercel]`, `[enlace del video]`, `[4 nombres]` y confirmar Supabase.

## 10:30–11:00 · Ensayo
- [ ] Pitch con cronómetro ×2 (guion.md §4, ~2 min).
- [ ] Abrir la URL de Vercel en una ventana de incógnito: carga, busca, traza ruta, cambia modo.
- [ ] Exportar slides a PDF y abrirlas en otra computadora.

## 11:00–11:30 · Subir la entrega
- [ ] Video (enlace público, sin restricción de edad ni región).
- [ ] URL de Vercel.
- [ ] Repositorio público en GitHub (revisar que no haya llaves: `git grep -n "supabase.co"` vacío y `.env.local` fuera).
- [ ] Página del proyecto con la declaración de uso de IA.
- [ ] P1 revisa todo antes de enviar.
