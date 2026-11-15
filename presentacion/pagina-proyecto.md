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
3. **Modo.** A pie, rover abierto o rover presurizado. Cambiar de modo cambia la decisión: en la demo, el boxwork B-4 sale con riesgo ALTO a pie (fuera del alcance con oxígeno de reserva) y con riesgo BAJO en rover.
4. **Capas.** Pendiente, radiación, térmico y mineralogía. Cada capa dice si es **MEDIDO**, **DERIVADO** o **ESTIMADO**, y de qué instrumento sale.
5. **Notas de campo.** El astronauta toca el lugar de un hallazgo y deja una nota con título, etiquetas (MUESTRA, GEOLOGÍA, REVISAR, PELIGRO) y foto. La nota queda en el mapa para el resto del equipo.
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
[P1: pegar aquí la tabla de `data-pipeline/FUENTES.md` con el enlace de cada producto.]

- MRO HiRISE: imagen y modelo de elevación de la zona → pendiente. [enlace]
- MSL RAD (Curiosity): tasa de radiación en superficie. [enlace]
- MSL REMS (Curiosity): temperatura y presión del sol 412. [enlace]
- Mapas base: NASA Mars Trek (Viking color, MOLA, MOLA + HRSC). [enlace]
- Térmico y mineralogía: Mars Odyssey THEMIS y MRO CRISM, si P1 los procesó para la zona. [confirmar]

## Cómo está hecho
Next.js y MapLibre en el navegador; datos de la zona procesados con Python (GDAL y rasterio); Supabase para las notas compartidas [confirmar que quedó conectado]. Código: [URL del repo].

## Enlaces
- App: [URL de Vercel]
- Video (30 s): [enlace]
- Repositorio: [URL del repo]

## Declaración de uso de inteligencia artificial
El equipo usó asistentes de IA (Claude) como apoyo para escribir y revisar código, resolver conflictos de git y redactar documentación, el guion y las slides. Las decisiones de diseño, los supuestos del modelo y la elección de datos son del equipo, y todo el código generado se revisó y probó antes de integrarlo. Las capturas de la presentación salen de la app real; no se generaron imágenes con IA. [Ajustar si alguien del equipo usó otra herramienta.]

## Equipo
[4 nombres y roles: P1 datos · P2 ruta y notas · P3 mapa · P4 interfaz e historia]
