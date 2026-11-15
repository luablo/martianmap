# FUENTES DE DATOS — MARSWALK

Lo que de verdad usa la app (`Frontend/martianmap/public/data/gale/`). Lo genera `run_pendiente.py` y luego `run_exportar.py`.

| # | Dato | Archivo en la app | Fuente | URL | Etiqueta en la app | Crédito |
|---|---|---|---|---|---|---|
| 1 | DTM 1 m/px (DTEEC_001488_1750) | `slope.bin`, `slope.png` (pendiente a 4 m/celda) | HiRISE, par estéreo PSP_001488_1750 / PSP_001752_1750 | https://hirise-pds.lpl.arizona.edu/PDS/DTM/PSP/ORB_001400_001499/PSP_001488_1750_PSP_001752_1750/ | DERIVADO | NASA/JPL/University of Arizona |
| 2 | Ortofoto RED (PSP_001488_1750) | `ortho.webp` | HiRISE, mismo producto | (misma URL) | MEDIDO | NASA/JPL/University of Arizona |
| 3 | Tasa de radiación en superficie: 0.67 mSv/día | constante en `lib/metrics.ts` | Hassler et al. (2014), *Science* 343 | https://doi.org/10.1126/science.1244797 | ESTIMADO (la dosis por ruta es un cálculo del modelo) | NASA/JPL, instrumento MSL RAD |
| 4 | Clima de un sol de referencia (sol 412) | `weather.json` | MSL REMS, PDS Atmospheres Node | https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/MARS/curiosity_rems.html | MEDIDO | NASA/JPL/CAB |
| 5 | Zonas NO PISAR, base y puntos de interés | `nogo.geojson`, `pois.geojson` | Marcados por el equipo sobre la ortofoto | — | supuesto del equipo | MARSWALK |

**Notas**
- La zona es el recorte del DTM HiRISE (137.239–137.354 °E, 4.721–4.949 °S). Bradbury Landing (4.59 °S, 137.44 °E) queda fuera, así que la "Base EVA" es un punto supuesto dentro del recorte.
- `recortar.py` y `exportar.py` son la primera versión del pipeline (mosaico USGS de Gale) y ya no generan lo que usa la app.
- `elevation.bin` sale de `run_pendiente.py` pero la app no lo usa: está en `.gitignore`.
- Pendiente: falta anotar la fecha de descarga del DTM y los valores exactos de REMS del sol 412 (archivo y fila).
