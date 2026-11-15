# -*- coding: utf-8 -*-
import sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

import numpy as np
from pathlib import Path
import rasterio
from rasterio.enums import Resampling
from scipy.ndimage import uniform_filter
from PIL import Image

DEM_IN  = Path("dem_clean.tif")
OUT_DIR = Path("../Frontend/martianmap/public/data/gale")
OUT_DIR.mkdir(parents=True, exist_ok=True)
TARGET_RES_M = 4.0

def calcular_pendiente(dem, res_m):
    dz_dy, dz_dx = np.gradient(dem.astype(np.float32), res_m)
    slope_rad = np.arctan(np.sqrt(dz_dx**2 + dz_dy**2))
    return np.degrees(slope_rad)

def colorear_pendiente(slope_deg):
    h, w = slope_deg.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[slope_deg < 10]  = [52,  211, 153, 120]
    rgba[(slope_deg >= 10) & (slope_deg < 25)] = [251, 191, 36, 150]
    rgba[slope_deg >= 25] = [239,  68,  68, 180]
    return rgba

if not DEM_IN.exists():
    print("ERROR: No se encuentra dem_clean.tif. Ejecuta crop.py primero.")
    sys.exit(1)

print(f"Abriendo {DEM_IN}...")
with rasterio.open(DEM_IN) as src:
    res_m_actual = src.res[0]
    nodata = src.nodata
    scale = res_m_actual / TARGET_RES_M
    new_h = max(1, int(src.height * scale))
    new_w = max(1, int(src.width  * scale))
    print(f"DEM limpio: {src.width}x{src.height} px a {res_m_actual:.2f} m/px")
    print(f"Remuestreando a {new_w}x{new_h} px a {TARGET_RES_M} m/px ...")
    dem = src.read(1, out_shape=(new_h, new_w), resampling=Resampling.bilinear).astype(np.float32)

if nodata is not None:
    mask = dem == nodata
    if mask.any():
        dem[mask] = float(np.median(dem[~mask]))
        print(f"Nodata reemplazado ({mask.sum()} celdas)")

dem_smooth = uniform_filter(dem, size=3)
slope = calcular_pendiente(dem_smooth, TARGET_RES_M)

slope_u8 = np.clip(slope, 0, 90).astype(np.uint8)
slope_u8.tofile(OUT_DIR / "slope.bin")
print(f"OK slope.bin  ({new_w}x{new_h} | max pendiente: {slope.max():.1f} deg)")

Image.fromarray(colorear_pendiente(slope), mode="RGBA").save(OUT_DIR / "slope.png", optimize=True)
print("OK slope.png")

np.clip(dem_smooth, -32768, 32767).astype(np.int16).tofile(OUT_DIR / "elevation.bin")
print(f"OK elevation.bin  (elev {dem_smooth.min():.0f}m a {dem_smooth.max():.0f}m)")

print(f"\nDimensiones malla: width={new_w} height={new_h}")
print("Siguiente: run_exportar.py")
