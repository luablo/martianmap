"""
exportar.py — P1 Datos
Convierte ortho_recorte.tif a ortho.webp y genera meta.json.
Debe ejecutarse después de recortar.py y pendiente.py.

Uso:
    python exportar.py

Salida en Frontend/martianmap/public/data/gale/:
    ortho.webp
    meta.json
"""

import json
import numpy as np
from pathlib import Path

import rasterio
from rasterio.enums import Resampling
from PIL import Image

ORTHO_IN  = Path("ortho_recorte.tif")
OUT_DIR   = Path("../Frontend/martianmap/public/data/gale")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Coordenadas de la base de Curiosity (punto de partida de la EVA)
BASE_LAT = -4.5895
BASE_LON = 137.4417

# Tamaño máximo de la ortofoto exportada
MAX_PX = 4096


def exportar_ortho(src_path: Path, dest_path: Path, max_px: int) -> dict:
    """Recorta a max_px, guarda como WebP, devuelve bounds y dimensiones."""
    with rasterio.open(src_path) as src:
        bounds = src.bounds   # west, south, east, north
        w, h = src.width, src.height

        # Escalar para no pasar de max_px en ningún lado
        scale = min(max_px / w, max_px / h, 1.0)
        new_w = int(w * scale)
        new_h = int(h * scale)

        print(f"Ortofoto original: {w}×{h} px")
        print(f"Exportando a: {new_w}×{new_h} px ...")

        # Leer bandas (puede ser 1 o 3)
        data = src.read(
            out_shape=(src.count, new_h, new_w),
            resampling=Resampling.lanczos,
        )

    # Normalizar a uint8
    data = data.astype(np.float32)
    data = (data - data.min()) / (data.max() - data.min() + 1e-6) * 255
    data = data.astype(np.uint8)

    if data.shape[0] == 1:
        img = Image.fromarray(data[0], mode="L").convert("RGB")
    else:
        img = Image.fromarray(np.moveaxis(data[:3], 0, -1), mode="RGB")

    img.save(dest_path, format="WEBP", quality=85, method=6)
    print(f"✓ {dest_path}")

    return {
        "width": new_w,
        "height": new_h,
        "bounds": {
            "west":  bounds.left,
            "south": bounds.bottom,
            "east":  bounds.right,
            "north": bounds.top,
        },
    }


if __name__ == "__main__":
    if not ORTHO_IN.exists():
        raise FileNotFoundError(f"No se encuentra {ORTHO_IN}. Ejecuta recortar.py primero.")

    slope_bin = OUT_DIR / "slope.bin"
    if not slope_bin.exists():
        raise FileNotFoundError("No se encuentra slope.bin. Ejecuta pendiente.py primero.")

    # Leer dimensiones de la malla de pendiente
    slope_data = np.fromfile(slope_bin, dtype=np.uint8)

    ortho_info = exportar_ortho(ORTHO_IN, OUT_DIR / "ortho.webp", MAX_PX)

    # Calcular metros por píxel de la malla de ruteo
    # La malla de slope.bin es cuadrada a 4 m/celda
    bounds = ortho_info["bounds"]
    span_lon = bounds["east"] - bounds["west"]
    MARS_RADIUS_M = 3_389_500.0
    meters_per_cell = 4.0   # fijo en pendiente.py

    # Calcular dimensiones de la malla de slope
    # slope.bin es Uint8 con new_h * new_w celdas (ver pendiente.py)
    # Inferimos dimensiones del tamaño del archivo
    total_cells = slope_data.size
    # La malla es aproximadamente cuadrada
    side = int(np.sqrt(total_cells))
    slope_w = side
    slope_h = total_cells // side

    meta = {
        "width":  ortho_info["width"],
        "height": ortho_info["height"],
        "metersPerPixel": meters_per_cell,
        "slopeWidth":  slope_w,
        "slopeHeight": slope_h,
        "bounds": ortho_info["bounds"],
        "base": {
            "lat": BASE_LAT,
            "lon": BASE_LON,
        },
        "sources": [
            {
                "layer": "ortho",
                "name":  "MSL Gale Orthophoto Mosaic 25cm",
                "provider": "NASA/JPL/USGS Astrogeology",
                "label": "MEDIDO",
                "url": "https://astropedia.astrogeology.usgs.gov"
            },
            {
                "layer": "slope",
                "name":  "Pendiente derivada de DEM HiRISE 1m",
                "provider": "NASA/JPL/USGS Astrogeology",
                "label": "DERIVADO",
                "url": "https://astropedia.astrogeology.usgs.gov"
            },
            {
                "layer": "radiation",
                "name":  "Tasa RAD: 0.67 mSv/día (Hassler et al. 2014)",
                "provider": "NASA/JPL — instrumento RAD (MSL)",
                "label": "MEDIDO",
                "url": "https://doi.org/10.1126/science.1244797"
            },
        ],
    }

    meta_path = OUT_DIR / "meta.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    print(f"✓ {meta_path}")

    print("\n✓ Pipeline completo. Archivos en:", OUT_DIR)
    print("  ortho.webp · slope.bin · slope.png · elevation.bin · meta.json")
