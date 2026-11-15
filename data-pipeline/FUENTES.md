# FUENTES DE DATOS — MARSWALK

Todas las fuentes usadas en el pipeline de datos. Requerido para la pagina del proyecto.

| # | Dato | Archivo generado | Fuente | URL | Fecha descarga | Credito |
|---|---|---|---|---|---|---|
| 1 | DTM 1 m/px — Gale Crater (PSP_001488_1750 + PSP_001752_1750) | `slope.bin`, `elevation.bin`, `slope.png` | NASA/JPL/UA HiRISE — PDS | https://hirise-pds.lpl.arizona.edu/PDS/DTM/PSP/ORB_001400_001499/PSP_001488_1750_PSP_001752_1750/DTEEC_001488_1750_001752_1750_U02.IMG | 14 nov 2026 | NASA/JPL/University of Arizona |
| 2 | Mapa base visual (teselas WMTS) | capa en MapLibre (en linea) | NASA Mars Trek | https://trek.nasa.gov/mars | — | NASA/JPL |
| 3 | Tasa de radiacion RAD — 0.67 mSv/dia en superficie de Gale | `weather.json`, calculo de dosis en ruta | Hassler et al. (2014), Science vol. 343, issue 6169 | https://doi.org/10.1126/science.1244797 | — | NASA/JPL (instrumento RAD, MSL) |
| 4 | Clima REMS — Sol 412 (temp -70/0 C, presion 875 Pa, UV) | `weather.json` | PDS Atmospheres Node / NASA PIA16913 | https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/MARS/curiosity/rems.html | 14 nov 2026 | NASA/JPL/CSIC-INTA/FMI (instrumento REMS, MSL) |
| 6 | Recorrido de Curiosity — referencia zona boxwork | `pois.geojson` (coordenadas base) | NASA Mars Exploration | https://mars.nasa.gov/msl/mission/where-is-the-rover/ | — | NASA/JPL |

> **Nota:** Los archivos crudos (.IMG, .JP2) no estan en el repo por su tamano (344 MB y 27 MB).
> Los archivos procesados listos para el frontend estan en `Frontend/martianmap/public/data/gale/`.
> Todos los datos NASA son de dominio publico bajo la politica de datos abiertos de NASA.
