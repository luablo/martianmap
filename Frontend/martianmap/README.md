<p align="center">
  <img src="docs/img/banner.svg" alt="MARSWALK: el camino seguro, a un toque" width="100%">
</p>

<p align="center">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="MapLibre GL" src="https://img.shields.io/badge/MapLibre-GL-396CB2">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white">
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white">
  <img alt="NASA Space Apps 2026" src="https://img.shields.io/badge/NASA%20Space%20Apps-2026-0B3D91">
</p>

# MARSWALK

**Un «Google Maps» para caminar en Marte.** El astronauta marca un destino, elige cómo se mueve (a pie, rover abierto o rover presurizado) y la app calcula la ruta más segura sobre datos reales de NASA. El peligro se ve en el mapa y se mide en lo que cuesta: tiempo, oxígeno y dosis de radiación.

> **Reto:** *Interplanetary Survival Guide: Martian Map*, NASA Space Apps Challenge 2026.

| | |
|---|---|
| **Demo** | ⟨enlace de Vercel⟩ |
| **Video** | ⟨enlace al video⟩ |
| **Repositorio** | https://github.com/luablo/martianmap |

---

## El problema

Los mapas de Marte se hicieron para mirar el planeta, no para caminarlo. Mars Trek y los mapas del USGS son vistas regionales o globales, y con ellos nadie puede planear una caminata concreta de 2 a 3 km. MARSWALK cubre ese hueco con una vista **hiperlocal, por capas, pensada para una EVA** (actividad extravehicular).

## La misión de la demo

> **Sol 412, EVA 07.** Dos astronautas salen de la base, en la falda de Mount Sharp, para muestrear una cresta de *boxwork* a unos 2.4 km. Abren MARSWALK y marcan «Boxwork B-4». La app traza la ruta a pie evitando una ladera de más de 30° con roca suelta. Cambian a rover abierto y la ruta cambia sola. Al llegar dejan una nota con foto, y la nota aparece en el mapa del compañero.

*Zona: cráter Gale y Mount Sharp, donde trabaja Curiosity (aprox. 4.59° S, 137.44° E). Objetivo científico: estudiar las formaciones boxwork, evidencia de agua subterránea antigua.*

## Capturas

<p align="center">
  <img src="docs/img/captura-mapa.png" alt="Mapa de Gale con la ruta turquesa, las zonas prohibidas y la barra de métricas" width="85%">
  <br><em>Ruta calculada de la base al objetivo, evitando las zonas rojas, con sus métricas.</em>
</p>

<table>
  <tr>
    <td align="center"><img src="docs/img/captura-modos.png" alt="Tres rutas, una por modo de transporte" width="100%"><br><em>Tres modos, tres rutas al mismo destino</em></td>
    <td align="center"><img src="docs/img/captura-capas.png" alt="Capas de pendiente y radiación activadas" width="100%"><br><em>Capas: imagen, pendiente y radiación</em></td>
  </tr>
  <tr>
    <td align="center" colspan="2"><img src="docs/img/captura-notas.png" alt="Nota de campo con foto sobre el mapa" width="50%"><br><em>Notas de campo con foto y coordenada</em></td>
  </tr>
</table>

## Qué hace

- **Ruta segura:** A* de 8 vecinos sobre una malla de 4 m por celda, que minimiza el **tiempo** y nunca entra en terreno rojo.
- **Tres modos de transporte:** a pie, rover abierto y rover presurizado. Cambiar de modo recalcula la ruta.
- **Capas que se prenden y apagan:** imagen de órbita (HiRISE), pendiente y radiación, cada una con su etiqueta **MEDIDO / DERIVADO / ESTIMADO**.
- **Métricas de la ruta:** distancia, tiempo, pendiente máxima, dosis de radiación (ida y vuelta), recurso restante (oxígeno o batería) y riesgo global.
- **Casos límite explicados:** destino inalcanzable, fuera de alcance del modo o recurso insuficiente muestran un aviso claro en lugar de una ruta falsa.
- **Pensada para guantes:** botones de 56 px o más, sin gestos finos ni *hover*, y el color nunca es la única señal (la zona prohibida lleva rayado y texto).
- **Notas de campo:** el astronauta escribe el mapa, con foto, etiquetas y coordenada, y el compañero lo ve en tiempo real.
- **Responsiva:** teléfono, tablet (objetivo principal) y pantalla del hábitat con el mismo código.

## Cómo responde al reto

| Lo que pide el reto | Cómo lo cumplimos |
|---|---|
| Al menos 3 tipos de datos | Óptico (HiRISE), topográfico (DEM), radiación (MSL RAD) y clima (MSL REMS) |
| Ruta que evite obstáculos | A* con pendiente máxima por modo y polígonos «NO PISAR» |
| Seguridad y radiación | Dosis por ruta y blindaje distinto por modo |
| Movilidad con traje | Modos de transporte y recurso límite (oxígeno, batería) |
| Vista por capas | Capas con interruptores y leyenda |
| Fotos a nivel de suelo | Fotos de Curiosity ligadas a puntos del mapa |

## Datos de NASA usados

Cada capa dice en pantalla si es medida, derivada o estimada.

| Capa | Fuente | Etiqueta |
|---|---|---|
| Imagen de órbita | MRO **HiRISE**, mosaico ortofoto de Gale a 25 cm/px (USGS Astrogeology) | MEDIDO |
| Pendiente | **DEM de Gale a 1 m/px** (HiRISE, USGS), con la pendiente calculada por nosotros | DERIVADO |
| Radiación | **MSL RAD**: unos 0.67 mSv/día en superficie (Hassler et al., 2014) | MEDIDO (tasa) · ESTIMADO (dosis por ruta) |
| Clima del sol | **MSL REMS**: temperatura, presión, UV | MEDIDO |
| Fotos a nivel de suelo | Imágenes crudas de **Curiosity** (Mastcam y Navcam) | MEDIDO |

Las URLs exactas, fechas y créditos están en [`data-pipeline/FUENTES.md`](data-pipeline/FUENTES.md).

## Supuestos y limitaciones

Estos números **son supuestos del equipo, no datos de NASA**. Viven en un solo archivo, [`lib/modes.ts`](Frontend/martianmap/lib/modes.ts).

<p align="center">
  <img src="docs/img/modos.svg" alt="Tres modos, tres rutas: supuestos del equipo" width="90%">
</p>

| | A pie | Rover abierto | Rover presurizado |
|---|---|---|---|
| Pendiente máxima | 15° | 25° | 18° |
| Velocidad en plano | 3 km/h | 10 km/h | 14 km/h |
| Alcance | 2 km | 20 km | 100 km |
| Recurso límite | Oxígeno del traje (8 h) | Batería (4 h) | Autonomía (72 h) |
| Factor de blindaje | 1.0 | 1.0 | 0.5 |

- **Velocidad real** = velocidad en plano × (1 − 0.6 × pendiente / pendiente máxima).
- **Dosis** = 0.67 mSv/día × tiempo de ruta (ida y vuelta) × factor de blindaje. Una EVA de unos 100 min da alrededor de 0.05 mSv.
- **Recurso** = 100 % − (tiempo de ida y vuelta / autonomía), con una reserva mínima del 20 % al volver.
- **Riesgo global (BAJO / MEDIO / ALTO):** sube si la ruta sale del alcance del modo, deja menos de 20 % de reserva o supera la pendiente máxima.
- **Limitaciones conocidas:** la dosis por ruta es una estimación a partir de una tasa promedio, no una medición en cada punto; las zonas «NO PISAR» se marcaron a mano; el modelo de velocidad es una simplificación; la base de datos de notas tiene políticas abiertas (solo para el hackathon, sin inicio de sesión).
- Si `public/data/gale/meta.json` dice `"fake": true`, esa zona usa **terreno sintético** de `scripts/fake-terrain.mjs` y no datos reales.

## Cómo funciona la ruta

```
costo(celda) = distancia / velocidad_real(pendiente, modo)
```

El A* corre en un **Web Worker**, así que la interfaz no se congela. Las celdas con pendiente mayor a la máxima del modo, o dentro de un polígono «NO PISAR», son infranqueables. Las distancias se calculan con el **radio de Marte (3 389.5 km)**, nunca con funciones de la librería de mapas, que asumen la Tierra.

## Arquitectura

<p align="center">
  <img src="docs/img/arquitectura.svg" alt="Cómo fluyen los datos: datos NASA, preproceso, archivos estáticos y app web con Supabase" width="95%">
</p>

```
.
├─ data-pipeline/            # Python: recorta, calcula pendiente y exporta
├─ Frontend/martianmap/      # App Next.js 16 + Tailwind 4
│  ├─ app/                   # Página y estilos globales
│  ├─ components/            # Mapa, paneles y componentes de interfaz
│  ├─ lib/                   # types, geo, modes, metrics, routing, notes
│  ├─ scripts/               # terreno sintético y pruebas de ruta
│  └─ public/data/gale/      # Capas y datos de la zona
└─ presentacion/             # Guion, slides y capturas
```

## Cómo correrlo

Necesitas **Node.js 20.9 o superior**.

```bash
git clone https://github.com/luablo/martianmap.git
cd martianmap/Frontend/martianmap
npm install
npm run dev
```

Abre <http://localhost:3000>.

**Notas de campo (opcional).** Crea un archivo `.env.local` con las llaves de tu proyecto de Supabase. Sin ellas, la app sigue funcionando y las notas se guardan en el navegador (`localStorage`).

```bash
NEXT_PUBLIC_SUPABASE_URL=tu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-llave-anon
```

**Producción.**

```bash
npm run build
npm start
```

**Si en Windows aparece «no es una aplicación Win32 válida»** (el binario de SWC quedó dañado), reinstálalo o arranca con Webpack: `npm run dev -- --webpack`.

## Pruebas

```bash
npx tsc --noEmit                      # tipos
npx tsx scripts/test-astar.ts         # el A* rodea un muro con un hueco
npx tsx scripts/test-route.ts         # ruta completa en los tres modos
```

`test-route.ts` imprime PASS o FAIL por modo, junto con distancia, tiempo, pendiente máxima, dosis, recurso y riesgo.

## Uso de inteligencia artificial

Este proyecto se desarrolló con apoyo de **Claude** (Anthropic), un asistente de inteligencia artificial. Lo usamos para:

- escribir y revisar código (por ejemplo, el motor de rutas A*, el Web Worker y el cálculo de métricas);
- redactar documentación, como este README;
- planear el trabajo y resolver errores durante el hackathon.

Las decisiones de diseño, la elección de datos y las pruebas fueron del equipo, que es responsable del resultado final.

## Equipo

| Rol | Persona |
|---|---|
| Datos | Julieta Rodriguez Cid |
| Ruta | Fernanda De Jesus Gonzalez |
| Mapa | Julio Cesar Trinidad Garcia |
| Interfaz e historia | Luis Angel Carcamo Huerta |

## Créditos

Datos de NASA/JPL-Caltech, NASA/Univ. of Arizona (HiRISE) y USGS Astrogeology Science Center. MSL RAD y MSL REMS vía el Planetary Data System de NASA. Los mapas base de Mars Trek son de NASA. Este proyecto no está afiliado ni respaldado por NASA.
