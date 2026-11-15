# MARSWALK · Texto para la página del proyecto (Space Apps)

> Dueño: P4, con P1 para las fuentes. Copiar y pegar en el formulario de entrega.
> Lo que va entre `[corchetes]` falta llenarlo antes de subir.

---

## Nombre
MARSWALK

## Reto
Interplanetary Survival Guide: Martian Map

## Resumen corto (una línea)
El camino seguro por Marte, a un toque — incluso con guantes.

## Descripción

Los mapas de Marte que existen se hicieron para mirar el planeta desde órbita, no para caminarlo. MARSWALK es un mapa hiperlocal para una caminata extravehicular (EVA): el astronauta elige un destino y la app traza la ruta desde la base, con distancia, tiempo, riesgo, dosis de radiación estimada y el recurso que le queda (oxígeno, batería o autonomía).

**Cómo funciona**
1. **Destino.** Se busca un objetivo («boxwork») o se toca el mapa.
2. **Ruta.** La ruta evita pendientes más fuertes que las que permite el modo y las zonas marcadas NO PISAR.
3. **Modo.** A pie, rover abierto o rover presurizado. Cambiar de modo cambia la decisión: en la demo, el boxwork B-4 queda a 2.4 km por la ruta segura a pie, más que los 2 km de alcance, así que sale con riesgo ALTO; en rover abierto la ruta es de 1.8 km y 14 min, con riesgo MEDIO.
4. **Capas.** Imagen HiRISE, pendiente y radiación. Cada capa dice si es **MEDIDO**, **DERIVADO** o **ESTIMADO**, y de qué instrumento sale. Térmico (THEMIS) y mineralogía (CRISM) ya tienen su lugar en la app, pero todavía no hay datos procesados para esta zona y así lo dice la app.
5. **Notas de campo.** El astronauta toca el lugar de un hallazgo y deja una nota con título, etiquetas (MUESTRA, GEOLOGÍA, REVISAR, PELIGRO) y foto. La nota queda en el mapa para el resto del equipo y, si no hay red, se guarda en el dispositivo.
6. **Pensado para guantes.** Todo lo tocable mide al menos 56 px. Funciona en tablet, en teléfono y en modo HUD (visor del casco), que deja solo distancia, riesgo y recurso en las esquinas.

**Supuestos del modelo** (también dentro de la app, botón «i»)

| Modo | Pendiente máx | Velocidad | Alcance | Recurso | Blindaje |
|---|---|---|---|---|---|
| A pie | 15° | 3 km/h | 2 km | Oxígeno | ninguno |
| Rover abierto | 25° | 10 km/h | 20 km | Batería | ninguno |
| Presurizado | 18° | 14 km/h | 100 km | Autonomía | ×0.5 |

- Dosis = 0.67 mSv/día (tasa de superficie medida por MSL RAD) × tiempo de ida y vuelta × blindaje del modo. **Es una estimación.**
- El recurso debe alcanzar para volver con al menos 20 % de reserva.

## Datos de NASA usados
La zona es el recorte del modelo de elevación HiRISE DTEEC_001488_1750 en el cráter Gale (137.26–137.33 °E, 4.73–4.94 °S, unos 3.9 × 12.2 km, sin bordes vacíos). El detalle está en `RESOURCES.md`.

- **MRO HiRISE**: ortofoto PSP_001488_1750 (imagen de fondo, MEDIDO) y modelo de elevación DTEEC_001488_1750 a 1 m/px, del que sale la pendiente a 4 m por celda (DERIVADO). https://hirise-pds.lpl.arizona.edu/PDS/DTM/PSP/ORB_001400_001499/PSP_001488_1750_PSP_001752_1750/
- **MSL RAD (Curiosity)**: tasa de radiación en superficie, 0.67 mSv/día (Hassler et al. 2014, *Science*). https://doi.org/10.1126/science.1244797
- **MSL REMS (Curiosity)**: temperatura y presión de un sol de referencia (sol 412). https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/MARS/curiosity_rems.html
- **Mapas base**: MRO CTX (NASA/JPL/MSSS, vía Esri OnMars), Viking MDIM 2.1 y MGS MOLA (USGS Astrogeology). https://planetarymaps.usgs.gov/
- **Supuestos del equipo, no de NASA**: la base de la EVA, los objetivos y las zonas NO PISAR se marcaron sobre la ortofoto. Bradbury Landing queda fuera de este recorte.

## Cómo está hecho
Next.js 16 y MapLibre en el navegador; la ruta es un A* sobre la malla de pendiente que corre en un Web Worker para no congelar la pantalla. Los datos de la zona se procesaron con Python (rasterio, NumPy y Pillow). Las notas se guardan en Supabase con tiempo real y, si no hay red, en el dispositivo. Código: https://github.com/luablo/martianmap

## Enlaces
- App: https://martianmap-rosy.vercel.app
- Video (30 s): [enlace]
- Repositorio: https://github.com/luablo/martianmap

## Declaración de uso de inteligencia artificial
El equipo usó asistentes de IA (Claude) como apoyo para escribir y revisar código, resolver conflictos de git y redactar documentación y el guion del video. Las decisiones de diseño, los supuestos del modelo y la elección de datos son del equipo, y todo el código generado se revisó y probó antes de integrarlo. Las capturas de la presentación salen de la app real; no se generaron imágenes con IA. [Ajustar si alguien del equipo usó otra herramienta.]

## Equipo
| Rol | Persona |
|---|---|
| Datos | Julieta Rodriguez Cid |
| Ruta y notas | Fernanda De Jesus Gonzalez |
| Mapa | Julio Cesar Trinidad Garcia |
| Interfaz e historia | Luis Angel Carcamo Huerta |
