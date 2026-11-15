# MARSWALK · Esqueleto de slides (7 máximo)

> Dueño: P4 (P3 ayuda a terminarlas el domingo 09:00–10:30). Herramienta: la que use el equipo (Google Slides o Canva).
> Estilo: fondo `#070A10`, texto `#E5E7EB`, acento turquesa `#2DD4BF`; ámbar y rojo **solo** para peligro. Tipografías: Inter y JetBrains Mono (las de la app).
> Regla: una idea por slide, máximo ~20 palabras en pantalla; lo demás va en lo que se dice.
>
> **Versión armada:** [MARSWALK · Pitch](https://claude.ai/artifact/2M422wToS83dVPDy2DFDop): las 7 slides con las capturas de `capturas/` y lo que se dice en las notas del orador. Se exporta a PPTX (Google Slides / Canva la importan) o PDF. Falta llenar los `[corchetes]` (nombres, URL de Vercel, video).

---

## 1 · Título
- **En pantalla:** "MARSWALK" + "Los mapas de Marte se hicieron para mirar el planeta, no para caminarlo." + captura del mapa con la ruta.
- **Captura:** toma B (ruta a Boxwork B-4), escritorio 1920 × 1080.
- **Se dice:** el problema en una frase y quiénes somos.

## 2 · El hueco
- **En pantalla:** dos columnas — *Mars Trek / USGS: mapas regionales para mirar* vs. *MARSWALK: hiperlocal, para caminar una EVA*.
- **Captura:** ninguna, o una de Mars Trek a la izquierda (citar la fuente).
- **Se dice:** nadie responde "¿por dónde camino hoy, con este traje, sin pasarme de oxígeno?".

## 3 · Demo: destino → ruta
- **En pantalla:** GIF o 3 capturas en fila: buscar "boxwork" → elegir B-4 → ruta + métricas.
- **Captura:** tomas A y B.
- **Se dice:** Sol 412, EVA 07; un toque y la ruta evita lo peligroso.

## 4 · Modos de transporte
- **En pantalla:** tres capturas del mismo destino: A pie (RIESGO ALTO), Rover abierto, Presurizado.
- **Captura:** toma C, una por modo.
- **Se dice:** el giro — a pie no alcanza con reserva; el modo cambia la decisión, no solo el tiempo.

## 5 · Capas y honestidad
- **En pantalla:** tabla de capas con MEDIDO / DERIVADO / ESTIMADO y su fuente + tabla corta de supuestos (de `guion.md` §5).
- **Captura:** panel CAPAS + leyenda con Radiación encendida (toma D).
- **Se dice:** cada número dice de dónde sale; lo estimado se marca como estimado.
- **Falta:** tabla de fuentes de P1.

## 6 · Notas de campo, tiempo real y formatos
- **En pantalla:** captura de la nota (toma E) + captura de teléfono (toma F) + mención del modo HUD si existe.
- **Se dice:** el astronauta escribe el mapa; funciona en tablet con guantes (botones de 56 px) y en teléfono.

## 7 · Cómo está hecho y qué sigue
- **En pantalla:**
  - Hecho con: Next.js · MapLibre · Supabase · Python (GDAL/rasterio) · datos de NASA (HiRISE, MSL RAD, REMS).
  - Qué sigue: ruta de regreso, más zonas, alertas por clima, modo offline completo.
  - Equipo (4 nombres) · URL de Vercel · repo · video.
- **Se dice:** cierre — "MARSWALK: el camino seguro, a un toque — incluso con guantes."

---

## Checklist antes de exportar
- [x] Todas las capturas con los datos reales (ya sin aviso "TERRENO SINTÉTICO").
- [x] Fuentes de NASA citadas en la slide 5 con enlace.
- [x] Declaración de uso de IA en la página del proyecto (Space Apps la pide).
- [ ] Exportar a PDF y probar que abre en otra computadora.
