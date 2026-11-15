# MARSWALK · Video de 30 s (Remotion)

Video final: https://drive.google.com/file/d/1jNl4tkWjWRfV7VHoph0uLnI0YVjWQJjU/view?usp=sharing (29.5 s, voz del equipo, subtítulos en inglés).

- Guion: [`../video-script-en.md`](../video-script-en.md).
- Escenas, subtítulos y el astronauta (dibujado con SVG, no generado con IA): `src/Video.tsx`.
- Marca de agua «Generated with AI assistance» arriba a la izquierda durante todo el video (regla de uso de IA de Space Apps): el código de la animación se escribió con ayuda de Claude.
- Imágenes: capturas reales de la app en inglés, tomadas con `capturar-en.mjs`.

Las capturas, la ortofoto, la música y las voces no están en el repo (ver `.gitignore`). Para volver a renderizar:

```bash
npm install
node capturar-en.mjs https://martianmap-rosy.vercel.app   # capturas en public/shots/
cp ../../Frontend/martianmap/public/data/gale/ortho.webp public/
# agregar public/music/drone.wav y la voz en public/vo3/grabacion.m4a
npm run render
```
