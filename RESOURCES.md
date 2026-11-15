# MARSWALK · Resources, tools and how it was built

NASA Space Apps Challenge 2026 · Challenge: *Interplanetary Survival Guide: Martian Map*

- **Live app:** https://martianmap-rosy.vercel.app
- **Repository:** https://github.com/luablo/martianmap

This document lists every data source the app uses, every tool we used to build it, and how the pieces fit together, from raw NASA files to the deployed app.

---

## 1. NASA data used

Everything the app loads lives in `Frontend/martianmap/public/data/gale/`. The study area is the largest clean rectangle inside a single HiRISE elevation model in Gale crater: **137.264–137.329 °E, 4.732–4.937 °S** (about 3.9 × 12.2 km, 964 × 3045 cells of 4 m).

| # | Data | File in the app | Source | Link | Label in the app | Credit |
|---|---|---|---|---|---|---|
| 1 | Digital terrain model, 1 m/px (DTEEC_001488_1750), downloaded 14 Nov 2026 | `slope.bin`, `slope.png` (slope at 4 m per cell) | MRO HiRISE stereo pair PSP_001488_1750 / PSP_001752_1750 | [HiRISE PDS](https://hirise-pds.lpl.arizona.edu/PDS/DTM/PSP/ORB_001400_001499/PSP_001488_1750_PSP_001752_1750/) | DERIVED | NASA/JPL/University of Arizona |
| 2 | Orthoimage, RED band (PSP_001488_1750) | `ortho.webp` | MRO HiRISE, same product | (same link) | MEASURED | NASA/JPL/University of Arizona |
| 3 | Surface radiation dose rate: 0.67 mSv/day | constant in `lib/metrics.ts` | MSL RAD, Hassler et al. (2014), *Science* 343 | [doi:10.1126/science.1244797](https://doi.org/10.1126/science.1244797) | ESTIMATED (dose per route is a model result) | NASA/JPL, MSL RAD |
| 4 | Weather for a reference sol (sol 412, 29 Oct 2013): −70 °C / 0 °C, 875 Pa, moderate UV | `weather.json` | MSL REMS, PDS Atmospheres Node | [PDS Atmospheres · REMS](https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/MARS/curiosity_rems.html) | MEASURED | NASA/JPL/CAB |
| 5 | Base maps around the area: MRO CTX (~6 m/px, shown at ~20 m/px), Mars Odyssey THEMIS IR Day mosaic (100 m/px, terrain relief) and Viking MDIM 2.1 colorized mosaic (natural color) | loaded at runtime (`components/map/layers/basemap.ts`) | CTX: Esri Living Atlas OnMars · THEMIS and Viking: USGS Astrogeology WMS | [OnMars CTX](https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer) · [USGS planetary maps](https://planetarymaps.usgs.gov/) | context only | NASA/JPL/MSSS, NASA/JPL/ASU, NASA/USGS |
| 6 | EVA base, points of interest and NO-GO zones | `pois.geojson`, `nogo.geojson` | Drawn by the team on top of the orthoimage | — | team assumption | MARSWALK team |

**Notes on honesty**
- Bradbury Landing (4.59 °S, 137.44 °E) is outside this footprint, so the "EVA Base" is an assumed point inside the study area.
- The HiRISE strip is tilted, so about 25 % of its bounding box has no data. `find_valid_bounds.py` finds the largest rectangle with valid data and `crop.py` cuts both the DTM and the orthoimage to it, so the map has no empty black borders and routes never cross terrain without data.
- Thermal (THEMIS) and mineralogy (CRISM) mission layers are supported by the code but hidden, because no processed data exists yet for this area. They appear on their own as soon as `meta.json` lists their files.
- Sol 412 weather values are typical for sols 300–500 and were cross-checked against NASA image release PIA16913 and the REMS archive (instrument reference: Gómez-Elvira et al. 2012, *Space Sci Rev*, doi:10.1007/s11214-012-9921-1). The exact REMS file and row is not recorded.

---

## 2. Tools we used

### App (frontend)
| Tool | Version | What for |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16 | App framework; the page is prerendered as static content |
| [React](https://react.dev/) | 19 | User interface |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Typed code and shared data contracts (`lib/types.ts`) |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Styling; every touch target is at least 56 px (usable with gloves) |
| [MapLibre GL JS](https://maplibre.org/) | 6 | Map rendering: orthoimage, slope, radiation, routes and notes |
| Web Workers (browser API) | — | Runs the A* route search off the main thread so the screen never freezes |
| [supabase-js](https://supabase.com/docs/reference/javascript) | 2 | Client for the shared field notes |

### Data pipeline
| Tool | What for |
|---|---|
| Python 3 | Processing scripts in `data-pipeline/` |
| [GDAL](https://gdal.org/) | Crop the DTM and orthoimage to the clean rectangle (`gdal_translate`) |
| [rasterio](https://rasterio.readthedocs.io/) | Read, crop and reproject the HiRISE DTM and orthoimage |
| [NumPy](https://numpy.org/) | Slope computation (gradient → degrees) |
| [SciPy](https://scipy.org/) | Smoothing filters on the elevation grid |
| [Pillow](https://python-pillow.org/) | Export the orthoimage (WebP) and the colored slope layer (PNG) |
| [pyproj](https://pyproj4.github.io/pyproj/) and [Shapely](https://shapely.readthedocs.io/) | Mars coordinate systems and geometry |

### Backend and hosting
| Service | What for |
|---|---|
| [Supabase](https://supabase.com/) | Postgres database for field notes, **Realtime** so a note appears on every device instantly, and **Storage** (`field-photos` bucket) for note photos. Schema: `supabase/schema.sql` |
| [Vercel](https://vercel.com/) | Hosting. Every merge to `main` is built and published automatically |
| [GitHub](https://github.com/) | Code, branches per team member and pull requests |

There is no custom server. The route search runs in the browser, the terrain data is pre-processed into static files, and Supabase provides the database and real-time API. (`Backend/` contains an empty Django scaffold that the app does not use.)

### Presentation
| Tool | What for |
|---|---|
| Headless Chrome (`presentacion/capturar.mjs`) | Automatic 1080p screenshots of the real app for every video shot |
| SRT subtitles (`presentacion/video-subtitulos.srt`) | Subtitles for the 30-second video |

### Artificial intelligence
We used AI assistants (Claude, by Anthropic) to help write and review code, resolve git conflicts, plan the deployment and write documentation and the video script. Design decisions, model assumptions and data choices are the team's own, and all generated code was reviewed and tested before merging. Screenshots come from the real app; no images were generated with AI.

---

## 3. How it was built

```
NASA HiRISE DTM + orthoimage ─┐
                              │  data-pipeline/ (Python)
                              ▼
     crop → slope at 4 m/cell → mask cells without data → export
                              │
                              ▼
   public/data/gale/  (meta.json, slope.bin, slope.png, ortho.webp,
                       pois.geojson, nogo.geojson, weather.json)
                              │
                              ▼
   Next.js app in the browser ── MapLibre map + layers
          │                     └─ A* on the slope grid (Web Worker)
          │                         → distance, time, risk, dose, resource
          ▼
   Supabase (notes, realtime, photos)      Vercel (hosting from main)
```

### Step 1 · Terrain data (`data-pipeline/`)
1. Download the HiRISE DTM DTEEC_001488_1750 (1 m/px) and its orthoimage from the HiRISE PDS archive.
2. `find_valid_bounds.py` finds the largest axis-aligned rectangle with valid data (`preview_valid.py` draws it for a visual check), and `crop.py` cuts the DTM and the orthoimage to it with GDAL (`gdal_translate -projwin`).
3. `run_pendiente.py` resamples the DTM to **4 m per cell**, smooths it (SciPy) and computes the slope in degrees with a NumPy gradient. It writes `slope.bin` (one byte per cell, read by the route search) and `slope.png` (green < 10°, yellow 10–25°, red > 25°).
4. `run_exportar.py` exports the orthoimage to WebP and writes `meta.json`: grid size (964 × 3045), bounds, base location and the source list the app shows in its "i" sheet. It refuses to write a `meta.json` whose size does not match `slope.bin`.
5. Before every build, `npm run check-data` (`Frontend/martianmap/scripts/check-data.mjs`) checks the files against the data contract in `lib/types.ts`: grid size vs. `slope.bin` and `slope.png`, base and points inside the area, sources as text and the weather fields. If anything is off, the Vercel build stops instead of publishing a broken app.
6. `limpiar_sin_datos.py` (older approach) marks cells without coverage as blocked; it is only needed if the full, uncropped strip is used again.

### Step 2 · Safe route
- `lib/routing/astar-core.ts` runs **A\*** with 8 neighbors over the slope grid. Each travel mode masks cells that are too steep for it and every NO-GO zone.
- It runs inside a **Web Worker** (`lib/routing/worker.ts`), with a fallback on the main thread. A route over the real 964 × 3045 grid takes well under a second (about 40 ms by rover).
- `lib/metrics.ts` turns the route into distance, round-trip time, risk, radiation dose and remaining resource.

**Model assumptions** (also shown in the app):

| Mode | Max slope | Speed | Range | Resource | Shielding |
|---|---|---|---|---|---|
| On foot | 15° | 3 km/h | 2 km | Oxygen | none |
| Open rover | 25° | 10 km/h | 20 km | Battery | none |
| Pressurized rover | 18° | 14 km/h | 100 km | Autonomy | × 0.5 |

- Dose = 0.67 mSv/day (MSL RAD surface rate) × round-trip time × mode shielding. **This is an estimate.**
- The resource must last for the return trip with at least a 20 % reserve.
- Example: Boxwork B-4 is 2.4 km on foot (HIGH risk, out of range) and 1.8 km / 14 min by open rover (MEDIUM risk).

### Step 3 · Map and interface
- MapLibre draws the HiRISE orthoimage, the slope and radiation layers, the base maps, the route, the points of interest and the notes.
- The CTX service uses a geographic (degree) tile grid, not Web Mercator, so the app downloads the 12 tiles that cover the area, stitches them in a canvas and places the result with its real coordinates. THEMIS and Viking come as one 1024 × 768 image of the same area from the USGS WMS. (The first version used MOLA color relief and gray Viking, which looked pixelated and oddly colored next to the HiRISE image.)
- Every layer is labeled **MEASURED**, **DERIVED** or **ESTIMATED**, and the "i" button lists every assumption and source.
- Designed for gloves: touch targets of at least 56 px, plus a HUD mode that keeps only distance, risk and resource in the corners. Tested on desktop, tablet and a real phone.

### Step 4 · Shared field notes
- An astronaut taps a spot, adds a title, tags (MUESTRA, GEOLOGÍA, REVISAR, PELIGRO: sample, geology, check, danger) and a photo.
- With Supabase configured, notes are stored in the `annotations` table, photos go to the `field-photos` bucket (resized to JPEG ≤ 800 px), and every open device receives new notes in **real time**. Tested between two devices on the live app.
- Without network or keys, notes are saved on the device (`localStorage`) in the same format, so the demo never depends on the connection.
- Hackathon limitation: notes do not require login (open policies for the `anon` key).

### Step 5 · Deployment
1. **Supabase:** project created from the Vercel integration; `supabase/schema.sql` run in the SQL Editor (tables, open policies, Realtime and the `field-photos` bucket).
2. **Vercel:** repository imported with Root Directory `Frontend/martianmap`, with the environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Production branch: `main`.
3. Every merge to `main` publishes a new version at https://martianmap-rosy.vercel.app. No keys are stored in the repository.

### Run it locally
```bash
cd Frontend/martianmap
npm install
npm run dev
```
Open http://localhost:3000. For shared notes, put the two Supabase variables in `Frontend/martianmap/.env.local`. Route tests: `npx tsx scripts/test-route.ts`.
