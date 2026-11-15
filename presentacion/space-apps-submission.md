# MARSWALK · Space Apps 2026 submission form (ready to paste)

Team **Bitstronauts** · Challenge *Interplanetary Survival Guide: Martian Map*
Project page: https://www.spaceappschallenge.org/2026/find-a-team/bitstronauts/?tab=project

Copy each block into the field with the same name. Every link below was checked on Nov 15, 2026 and opens without logging in.

---

## Project Summary

### Project Name

```
MARSWALK
```

### Summary (≈185 words · 1,150 characters, limit 1,500)

```
MARSWALK is a hyperlocal, layered map for planning a walk on Mars. Today's Mars maps were made to look at the planet from orbit, not to plan a 2–3 km extravehicular activity (EVA) on foot or by rover. In MARSWALK, an astronaut picks a target and the app computes the safest route from the base over real NASA terrain: an A* search on a 4 m slope grid derived from a HiRISE elevation model of Gale crater, avoiding slopes too steep for the chosen travel mode and NO-GO zones. For every route it shows distance, time, maximum slope, estimated radiation dose (based on MSL RAD), the oxygen or battery left on return and an overall risk level, so the crew sees the danger before stepping out. Three travel modes (on foot, open rover, pressurized rover) change the decision, an EVA simulation plays the round trip, and geolocated field notes with photos are shared with the crew in real time. Every layer says whether it is measured, derived or estimated. It is built for gloved hands and a helmet HUD, runs on phone, tablet and habitat screens, and works in English and Spanish.
```

---

## Project Links

### Project Demonstration (video, 29.5 s, English subtitles)

```
https://drive.google.com/file/d/1jNl4tkWjWRfV7VHoph0uLnI0YVjWQJjU/view?usp=sharing
```

### Project (one link)

```
https://github.com/luablo/martianmap
```

The repository README opens with the live app (https://martianmap-rosy.vercel.app), the video, the team and the full documentation, so judges reach everything from one link. If you prefer the judges to land directly on the working app, use https://martianmap-rosy.vercel.app instead (its "i" button lists the assumptions and sources).

---

## Project Information

### Project Details

Paste this into the editor (it keeps the headings as plain text; you can make them bold with the editor's toolbar).

```
WHAT IT DOES
MARSWALK turns orbital data into a walking plan. The astronaut searches for a target (for example "Boxwork B-4", a boxwork ridge in Gale crater, evidence of ancient groundwater) or taps the map. The app draws the safest route from the EVA base and shows its cost: distance, one-way time, maximum slope, radiation dose for the round trip, the oxygen or battery left on return (with a 20 % reserve) and an overall risk (LOW / MEDIUM / HIGH). In the demo, Boxwork B-4 is 2.4 km on foot (HIGH risk, out of the 2 km walking range) but 1.8 km and 14 minutes by open rover (MEDIUM risk): the travel mode changes the decision.

HOW IT WORKS
1. Data pipeline (Python): we cropped the HiRISE digital terrain model DTEEC_001488_1750 (1 m/px) and its orthoimage to the largest clean rectangle with data, resampled it to 4 m per cell and computed the slope of each cell (964 × 3045 cells, about 3.9 × 12.2 km).
2. Safe route: an 8-neighbor A* search runs in a Web Worker so the screen never freezes. Cells steeper than the mode allows (15° on foot, 25° open rover, 18° pressurized rover) and NO-GO polygons are impassable. Cost = distance / real speed, where speed drops with slope. Distances use the radius of Mars, not Earth.
3. Metrics: dose = 0.67 mSv/day (Curiosity's MSL RAD surface rate) × round-trip time × the mode's shielding. The resource model uses each mode's autonomy (8 h oxygen, 4 h battery, 72 h pressurized).
4. Layers: HiRISE image (MEASURED), slope (DERIVED) and radiation (ESTIMATED), plus base maps around the area from MRO CTX, Mars Odyssey THEMIS and Viking. Each layer shows its provenance label and source.
5. Field notes: the astronaut taps a finding and saves a note with tags and a photo. Notes are stored in a Supabase database and appear on every crew device in real time; without a network they are kept on the device.
6. EVA simulation: "Start EVA" plays the round trip: a marker leaves the base, follows the route, stops to sample and returns, while mission time, dose and remaining resource fill in live.

BENEFITS
- Shows the danger before the step: slope, radiation and resource limits in one view, measured in what they cost.
- Honest: every number says where it comes from (MEASURED / DERIVED / ESTIMATED), and an "Assumptions and sources" sheet lists every assumption and dataset.
- Built for a suit: touch targets of at least 56 px, no fine gestures, color is never the only signal, and a HUD mode keeps only distance, risk and resource in the corners of the visor.
- Works on phone, tablet and habitat screens, in English and Spanish.

WHAT WE HOPE TO ACHIEVE
Today it covers one area of Gale crater; the pipeline works for any HiRISE elevation model, so the same tool can plan walks wherever there is high-resolution terrain. We hope it shows how NASA's orbital data can become a practical, everyday tool for crews, and inspires students to explore real Mars data.

TOOLS, LANGUAGES AND SOFTWARE
TypeScript, Next.js 16, React 19, Tailwind CSS 4 and MapLibre GL JS for the web app; Python with rasterio, NumPy, SciPy, Pillow, GDAL, pyproj and Shapely for the data pipeline; Supabase (Postgres, Realtime and Storage) for shared notes; Vercel for hosting; GitHub for version control; Remotion for the video. Hardware: our laptops and phones for testing.

WHAT MAKES IT CREATIVE
Instead of another global map, MARSWALK zooms into the scale of a single walk and treats terrain as a cost: the route changes with how you travel, and the risk is shown in oxygen, battery and dose. It combines route planning, radiation estimates and crew notes in one interface designed for gloves and helmets.

FACTORS WE CONSIDERED
Scientific honesty (assumptions are labeled and the dose is an estimate, not a measurement), suit usability, offline use, performance on mobile devices and accessibility. Known limitations: the dose uses an average surface rate; NO-GO zones, the EVA base and the targets were marked by the team on the orthoimage; the speed model is a simplification; the notes database has no login (hackathon only).

TEAM BITSTRONAUTS
Julieta Rodriguez Cid (data), Fernanda De Jesus Gonzalez (route and notes), Julio Cesar Trinidad Garcia (map), Luis Angel Carcamo Huerta (interface and story).

Use of AI: we used Claude (Anthropic), an AI assistant, to help write and review code, plan the deployment and write documentation. Design decisions, data choices and testing were the team's. No images, video or voices were generated with AI; the video uses real screenshots of the app and the team's own voice.
```

### Use of Super Intelligence (SI)

Select the options that match **code and text help from an AI assistant** (the dropdown usually lists them as something like "large language model / chatbot" and "code generation"). Do **not** select image, video or audio generation: the video uses real screenshots, an astronaut drawn in code (SVG) and the team's own voice.

Where it is disclosed (the form requires this): the "Use of artificial intelligence" section of the README (https://github.com/luablo/martianmap#use-of-artificial-intelligence), RESOURCES.md and the last paragraph of Project Details above.

### NASA Data (Link Text → Link Url)

| Link Text | Link Url |
|---|---|
| MRO HiRISE Digital Terrain Model DTEEC_001488_1750 (Gale crater, 1 m/px) | https://www.uahirise.org/dtm/dtm.php?ID=PSP_001488_1750 |
| MRO HiRISE DTM and orthoimage PSP_001488_1750 (PDS archive) | https://hirise-pds.lpl.arizona.edu/PDS/DTM/PSP/ORB_001400_001499/PSP_001488_1750_PSP_001752_1750/ |
| MSL RAD surface radiation dose rate (Hassler et al., 2014, Science) | https://doi.org/10.1126/science.1244797 |
| MSL REMS weather data, sol 412 (PDS Atmospheres Node) | https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/MARS/curiosity/rems.html |
| Mars Odyssey THEMIS Day IR 100 m global mosaic | https://astrogeology.usgs.gov/search/map/mars_odyssey_themis_day_ir_global_mosaic_100m_v12 |
| Viking MDIM 2.1 colorized global mosaic | https://astrogeology.usgs.gov/search/map/mars_viking_mdim21_colorized_global_mosaic_232m |
| MRO Context Camera (CTX) imagery | https://mars.nasa.gov/mro/mission/instruments/ctx/ |
| NASA Mars Trek (base maps used in the prototype) | https://trek.nasa.gov/mars/ |

### Space Agency Partner & Other Data (Link Text → Link Url)

| Link Text | Link Url |
|---|---|
| MARSWALK source code (our repository) | https://github.com/luablo/martianmap |
| Esri Living Atlas OnMars CTX tile service (CTX base map) | https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer?f=pjson |
| USGS Astrogeology Planetary Maps WMS (THEMIS and Viking base maps) | https://planetarymaps.usgs.gov/ |
| Next.js | https://nextjs.org/ |
| React | https://react.dev/ |
| MapLibre GL JS | https://maplibre.org/ |
| Tailwind CSS | https://tailwindcss.com/ |
| Supabase (database, realtime and photo storage) | https://supabase.com/ |
| Vercel (hosting) | https://vercel.com/ |
| rasterio | https://rasterio.readthedocs.io/ |
| GDAL | https://gdal.org/ |
| NumPy | https://numpy.org/ |
| SciPy | https://scipy.org/ |
| Pillow | https://python-pillow.org/ |
| Remotion (video) | https://www.remotion.dev/ |
| Inter and JetBrains Mono fonts (Google Fonts) | https://fonts.google.com/ |
| Claude by Anthropic (AI assistant for code and documentation) | https://www.anthropic.com/claude |
| Background music of the video (royalty-free) | ⟨paste the page where you got the track⟩ |

---

## Project Submission Verification

Check both boxes (Terms and Conditions, and All Work is Original). Every external resource is listed above, which is what the second box confirms.

---

## Checklist against the official requirements

| Requirement (Submission Guide and judging sheet) | Status |
|---|---|
| Summary of 50–200 words | ✅ ~185 words |
| Demo: video of 30 s or less | ✅ 29.5 s (885 frames at 30 fps) |
| English subtitles | ✅ burned into the video |
| Only ONE demo link, public, no password or login | ✅ Google Drive, checked while logged out |
| Project link public | ✅ GitHub repository is public; live app on Vercel |
| No names, voices or likenesses of anyone under 18 | ⚠️ confirm all four team members are 18 or older (names and voices appear in the video) |
| No NASA logos, flags or mission patches | ✅ only plain text such as "NASA HiRISE data" |
| SI use disclosed; SI images or video watermarked | ✅ code and text disclosed; no SI images, video or audio |
| At least one NASA resource | ✅ eight NASA resources listed |
| All other code, text, images and music listed | ✅ listed above (add the music link) |
| Copyrighted material only with permission | ✅ music is royalty-free; screenshots are ours; NASA data is public |
| New website: Web Filter Classification (recommended) | Optional: request it for martianmap-rosy.vercel.app if your school or venue blocks new sites |
| Submit before Sunday, Nov 15, 11:59 PM local time | ⏳ press **Submit for Judging** |

### How the project meets the judging criteria

- **Impact:** helps crews decide where it is safe to walk, before the step, using the cost in oxygen, battery and dose.
- **Creativity:** a walk-scale map where terrain is a cost and the travel mode changes the route; route, radiation and crew notes in one interface for gloves and a helmet HUD.
- **Validity:** a working app on real HiRISE terrain, an A* tested in three modes, a metrics model with its assumptions shown, and a reproducible data pipeline.
- **Relevance:** answers the Martian Map challenge directly, with NASA data at the core (HiRISE terrain and image, MSL RAD, MSL REMS, CTX, THEMIS, Viking).
- **Presentation:** a 29.5 s story (problem → solution → future) with the team's voice and English subtitles, a bilingual README with screenshots, and a live app.

---

## Steps on the Space Apps page

1. Open the project page, go to the **Project** tab and click **Edit**. Turn **Lock** on so no one else edits at the same time.
2. Fill in **Project Name** and **Summary**, and click **Save Progress**.
3. Paste the **Project Demonstration** link (video) and the **Project** link (repository). Save.
4. Paste **Project Details**, choose the **SI** options and add each **NASA Data** link and each **Other Data** link with **Add New Link**. Save.
5. Check both verification boxes.
6. Open the video and the repository links in a private window to confirm they work without logging in.
7. Click **Submit for Judging** and wait for the notification bar at the top. Only the last submission counts.
