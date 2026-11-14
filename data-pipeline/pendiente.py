"""
pendiente.py — P1 Datos
Calcula la pendiente en grados desde dem_recorte.tif y exporta:
  - slope.bin   → Uint8, una celda por byte, malla a 4 m/celda (~750×750 para 3 km)
  - slope.png   → imagen coloreada con transparencia para MapLibre
  - elevation.bin → Int16, elevación en metros (misma malla)

Uso:
    python pendiente.py

Requiere: dem_recorte.tif (generado por recortar.py)
"""

import numpy as np
from pathlib import Path
import rasterio
from rasterio.enums import Resampling
from scipy.ndimage import uniform_filter
from PIL import Image

# Radio de Marte en metros (no usar el de la Tierra)
MARS_RADIUS_M = 3_389_500.0

DEM_IN  = Path("dem_recorte.tif")
OUT_DIR = Path("../Frontend/martianmap/public/data/gale")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Malla objetivo: 4 m/celda
TARGET_RES_M = 4.0


def calcular_pendiente(dem: np.ndarray, res_m: float) -> np.ndarray:
    """Pendiente en grados. dem es un array 2D de elevaciones en metros."""
    dz_dy, dz_dx = np.gradient(dem.astype(np.float32), res_m)
    slope_rad = np.arctan(np.sqrt(dz_dx**2 + dz_dy**2))
    return np.degrees(slope_rad)


def colorear_pendiente(slope_deg: np.ndarray) -> np.ndarray:
    """
    Verde  < 10°  — seguro para todos los modos
    Ámbar  10–25° — precaución
    Rojo   > 25°  — peligroso / solo rover presurizado
    Devuelve RGBA uint8.
    """
    h, w = slope_deg.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)

    safe   = slope_deg < 10
    warn   = (slope_deg >= 10) & (slope_deg < 25)
    danger = slope_deg >= 25

    # Verde semitransparente
    rgba[safe]   = [52,  211, 153, 120]   # #34D399
    # Ámbar
    rgba[warn]   = [251, 191,  36, 150]   # #FBBF24
    # Rojo
    rgba[danger] = [239,  68,  68, 180]   # #EF4444

    return rgba


if __name__ == "__main__":
    if not DEM_IN.exists():
        raise FileNotFoundError(f"No se encuentra {DEM_IN}. Ejecuta recortar.py primero.")

    with rasterio.open(DEM_IN) as src:
        # Calcular resolución en metros por píxel
        # En Marte lat/lon: 1 grado ≈ π/180 × R_Marte metros
        deg_per_px = abs(src.transform.a)   # resolución en grados
        res_m_actual = deg_per_px * (np.pi / 180) * MARS_RADIUS_M

        # Factor de remuestreo para llegar a TARGET_RES_M
        scale = res_m_actual / TARGET_RES_M
        new_h = int(src.height * scale)
        new_w = int(src.width  * scale)

        print(f"DEM original: {src.width}×{src.height} px a {res_m_actual:.1f} m/px")
        print(f"Remuestreando a {new_w}×{new_h} px a {TARGET_RES_M} m/px ...")

        dem = src.read(
            1,
            out_shape=(new_h, new_w),
            resampling=Resampling.bilinear,
        ).astype(np.float32)

        bounds = src.bounds
        transform = src.transform

    # Suavizar ligeramente el DEM para reducir ruido en la pendiente
    dem_smooth = uniform_filter(dem, size=3)

    slope = calcular_pendiente(dem_smooth, TARGET_RES_M)

    # --- slope.bin (Uint8, grados truncados a 90) ---
    slope_u8 = np.clip(slope, 0, 90).astype(np.uint8)
    slope_bin_path = OUT_DIR / "slope.bin"
    slope_u8.tofile(slope_bin_path)
    print(f"✓ {slope_bin_path}  ({new_w}×{new_h} celdas)")

    # --- slope.png ---
    rgba = colorear_pendiente(slope)
    img = Image.fromarray(rgba, mode="RGBA")
    slope_png_path = OUT_DIR / "slope.png"
    img.save(slope_png_path, optimize=True)
    print(f"✓ {slope_png_path}")

    # --- elevation.bin (Int16) ---
    elev_i16 = np.clip(dem_smooth, -32768, 32767).astype(np.int16)
    elev_bin_path = OUT_DIR / "elevation.bin"
    elev_i16.tofile(elev_bin_path)
    print(f"✓ {elev_bin_path}")

    print("\nSiguiente paso: python exportar.py")
