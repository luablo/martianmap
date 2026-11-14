# -*- coding: utf-8 -*-
import sys, os, json
sys.stdout.reconfigure(encoding='utf-8')
os.chdir(os.path.dirname(os.path.abspath(__file__)))

import numpy as np
from pathlib import Path
import rasterio
from rasterio.enums import Resampling
from rasterio.warp import transform_bounds
from PIL import Image

ORTHO_IN = Path("ortho_recorte.tif")
OUT_DIR  = Path("../Frontend/martianmap/public/data/gale")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# CRS geografico de Marte (lo que usa MapLibre)
MARS_GEO_CRS = "GEOGCS['GCS_MARS',DATUM['D_MARS',SPHEROID['MARS_localRadius',3396190,0]],PRIMEM['Reference_Meridian',0],UNIT['degree',0.0174532925199433]]"

BASE_LAT = -4.5895
BASE_LON = 137.4417
MAX_PX   = 4096

if not ORTHO_IN.exists():
    print("ERROR: No se encuentra ortho_recorte.jp2")
    sys.exit(1)

print(f"Abriendo {ORTHO_IN}...")
with rasterio.open(ORTHO_IN) as src:
    w, h = src.width, src.height
    scale = min(MAX_PX / w, MAX_PX / h, 1.0)
    new_w = int(w * scale)
    new_h = int(h * scale)

    print(f"Ortofoto: {w}x{h} px -> exportando {new_w}x{new_h} px ...")

    data = src.read(
        out_shape=(src.count, new_h, new_w),
        resampling=Resampling.lanczos,
    )

    # Convertir bounds proyectados a lat/lon de Marte
    try:
        bounds_geo = transform_bounds(src.crs, MARS_GEO_CRS, *src.bounds)
        west, south, east, north = bounds_geo
    except Exception as e:
        print(f"Advertencia transform_bounds: {e}")
        # Fallback: usar bounds del DEM que ya sabemos funcionan
        west, south, east, north = 137.33, -4.785, 137.44, -4.72

    nodata = src.nodata

# Normalizar a uint8
data = data.astype(np.float32)
if nodata is not None:
    data[data == nodata] = np.nan
valid_min = np.nanmin(data)
valid_max = np.nanmax(data)
data = (data - valid_min) / (valid_max - valid_min + 1e-6) * 255
data = np.nan_to_num(data, nan=0).astype(np.uint8)

if data.shape[0] == 1:
    img = Image.fromarray(data[0], mode="L").convert("RGB")
elif data.shape[0] >= 3:
    img = Image.fromarray(np.moveaxis(data[:3], 0, -1), mode="RGB")
else:
    img = Image.fromarray(data[0], mode="L").convert("RGB")

ortho_path = OUT_DIR / "ortho.webp"
img.save(ortho_path, format="WEBP", quality=85, method=6)
print(f"OK ortho.webp  ({new_w}x{new_h} px)")

# Leer dimensiones de slope.bin para el meta
slope_bin = OUT_DIR / "slope.bin"
slope_data = np.fromfile(slope_bin, dtype=np.uint8)
total = slope_data.size
slope_h = 3383
slope_w  = total // slope_h

meta = {
    "width":       new_w,
    "height":      new_h,
    "metersPerPixel": 4.0,
    "slopeWidth":  slope_w,
    "slopeHeight": slope_h,
    "bounds": {
        "west":  round(west,  6),
        "south": round(south, 6),
        "east":  round(east,  6),
        "north": round(north, 6),
    },
    "base": {
        "lat": BASE_LAT,
        "lon": BASE_LON,
    },
    "sources": [
        {
            "layer":    "ortho",
            "name":     "PSP_001488_1750 RED Orthophoto (HiRISE/MRO)",
            "provider": "NASA/JPL/UA HiRISE",
            "label":    "MEDIDO",
            "url":      "https://hirise-pds.lpl.arizona.edu/PDS/DTM/PSP/ORB_001400_001499/PSP_001488_1750_PSP_001752_1750/"
        },
        {
            "layer":    "slope",
            "name":     "Pendiente derivada de DTEEC_001488_1750 DTM 1m/px",
            "provider": "NASA/JPL/UA HiRISE / USGS Astrogeology",
            "label":    "DERIVADO",
            "url":      "https://hirise-pds.lpl.arizona.edu/PDS/DTM/PSP/ORB_001400_001499/PSP_001488_1750_PSP_001752_1750/"
        },
        {
            "layer":    "radiation",
            "name":     "Tasa RAD: 0.67 mSv/dia (Hassler et al. 2014)",
            "provider": "NASA/JPL - instrumento RAD (MSL)",
            "label":    "MEDIDO",
            "url":      "https://doi.org/10.1126/science.1244797"
        },
    ],
    "fake": False,
}

meta_path = OUT_DIR / "meta.json"
with open(meta_path, "w", encoding="utf-8") as f:
    json.dump(meta, f, indent=2, ensure_ascii=False)
print(f"OK meta.json")

print(f"\nBounds lat/lon: W={west:.4f} E={east:.4f} S={south:.4f} N={north:.4f}")
print(f"Archivos en: {OUT_DIR.resolve()}")
print("Pipeline completo!")
