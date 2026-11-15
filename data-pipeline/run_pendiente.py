# -*- coding: utf-8 -*-
import sys, os
sys.stdout.reconfigure(encoding='utf-8')
os.chdir(os.path.dirname(os.path.abspath(__file__)))

import numpy as np
from pathlib import Path
import rasterio
from rasterio.enums import Resampling
from rasterio.warp import transform_bounds
from scipy.ndimage import uniform_filter
from PIL import Image

DEM_IN  = Path("dem_recorte.tif")
OUT_DIR = Path("../Frontend/martianmap/public/data/gale")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Queremos la malla de ruteo a 4 m/celda
TARGET_RES_M = 4.0

def calcular_pendiente(dem, res_m):
    dz_dy, dz_dx = np.gradient(dem.astype(np.float32), res_m)
    slope_rad = np.arctan(np.sqrt(dz_dx**2 + dz_dy**2))
    return np.degrees(slope_rad)

def colorear_pendiente(slope_deg):
    h, w = slope_deg.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    safe   = slope_deg < 10
    warn   = (slope_deg >= 10) & (slope_deg < 25)
    danger = slope_deg >= 25
    rgba[safe]   = [52,  211, 153, 120]
    rgba[warn]   = [251, 191,  36, 150]
    rgba[danger] = [239,  68,  68, 180]
    return rgba

if not DEM_IN.exists():
    print("ERROR: No se encuentra dem_recorte.tif")
    sys.exit(1)

print(f"Abriendo {DEM_IN}...")
with rasterio.open(DEM_IN) as src:
    # Resolucion real en metros por pixel
    res_m_actual = src.res[0]  # ~1.01 m/px
    nodata = src.nodata

    # Factor de escala para llegar a TARGET_RES_M
    # Si el DEM es 1 m/px y queremos 4 m/px -> scale = 0.25
    scale = res_m_actual / TARGET_RES_M
    new_h = max(1, int(src.height * scale))
    new_w = max(1, int(src.width  * scale))

    print(f"DEM: {src.width}x{src.height} px a {res_m_actual:.2f} m/px")
    print(f"Remuestreando a {new_w}x{new_h} px a {TARGET_RES_M} m/px ...")

    dem = src.read(
        1,
        out_shape=(new_h, new_w),
        resampling=Resampling.bilinear,
    ).astype(np.float32)

    bounds_proj = src.bounds
    crs = src.crs

# Reemplazar nodata con la mediana del vecindario
if nodata is not None:
    mask = dem == nodata
    if mask.any():
        median_val = float(np.median(dem[~mask]))
        dem[mask] = median_val
        print(f"Nodata reemplazado con mediana: {median_val:.1f} m ({mask.sum()} celdas)")

dem_smooth = uniform_filter(dem, size=3)
slope = calcular_pendiente(dem_smooth, TARGET_RES_M)

# --- slope.bin ---
slope_u8 = np.clip(slope, 0, 90).astype(np.uint8)
slope_bin_path = OUT_DIR / "slope.bin"
slope_u8.tofile(slope_bin_path)
print(f"OK slope.bin  ({new_w}x{new_h} celdas | pendiente max: {slope.max():.1f} deg)")

# --- slope.png ---
rgba = colorear_pendiente(slope)
img = Image.fromarray(rgba, mode="RGBA")
img.save(OUT_DIR / "slope.png", optimize=True)
print(f"OK slope.png")

# --- elevation.bin ---
elev_i16 = np.clip(dem_smooth, -32768, 32767).astype(np.int16)
elev_i16.tofile(OUT_DIR / "elevation.bin")
print(f"OK elevation.bin  (elev min: {dem_smooth.min():.0f}m  max: {dem_smooth.max():.0f}m)")

# Guardar info para el siguiente paso
print(f"\nBounds proyectados: {bounds_proj}")
print(f"Dimensiones malla: width={new_w} height={new_h}")
print("Siguiente paso: run run_exportar.py")
