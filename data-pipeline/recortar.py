"""
recortar.py — P1 Datos
Recorta el DEM y la ortofoto de Gale a la zona de trabajo (~3×3 km).
Intenta recorte remoto con /vsicurl/ para no bajar el archivo completo.
Si falla, usar Plan B: bajar un DTM individual de uahirise.org.

Uso:
    python recortar.py

Salida:
    dem_recorte.tif
    ortho_recorte.tif
"""

import subprocess
import sys
from pathlib import Path

# ------------------------------------------------------------------
# ZONA DE TRABAJO
# Ajustar estas coordenadas una vez confirmado el recorte exacto.
# Centro aproximado: base de Curiosity 4.59°S 137.44°E
# Recorte de ~3×3 km en grados decimales (Marte usa lat/lon igual que Tierra)
# ------------------------------------------------------------------
BOUNDS = {
    "west":  137.37,   # xmin
    "east":  137.51,   # xmax
    "south": -4.65,    # ymin
    "north": -4.53,    # ymax
}

# ------------------------------------------------------------------
# URLs remotas (range requests con /vsicurl/)
# Reemplazar con la URL exacta del archivo en Astropedia.
# ------------------------------------------------------------------
URL_DEM   = "https://astropedia.astrogeology.usgs.gov/download/Mars/InSitu/MSL/hirise/MSL_Gale_DEM_Mosaic_10m.tif"
URL_ORTHO = "https://astropedia.astrogeology.usgs.gov/download/Mars/InSitu/MSL/hirise/MSL_Gale_Orthophoto_Mosaic_25cm.tif"

OUT_DEM   = Path("dem_recorte.tif")
OUT_ORTHO = Path("ortho_recorte.tif")


def recortar(url: str, salida: Path, bounds: dict) -> bool:
    """Llama a gdal_translate con /vsicurl/. Devuelve True si tuvo éxito."""
    cmd = [
        "gdal_translate",
        "-projwin",
        str(bounds["west"]),
        str(bounds["north"]),
        str(bounds["east"]),
        str(bounds["south"]),
        f"/vsicurl/{url}",
        str(salida),
    ]
    print(f"\n→ Recortando {salida.name} ...")
    print("  " + " ".join(cmd))
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr.strip()}")
        return False
    print(f"  OK: {salida} generado.")
    return True


if __name__ == "__main__":
    ok_dem   = recortar(URL_DEM,   OUT_DEM,   BOUNDS)
    ok_ortho = recortar(URL_ORTHO, OUT_ORTHO, BOUNDS)

    if not ok_dem or not ok_ortho:
        print("\n⚠  Recorte remoto falló. Opciones:")
        print("   Plan B: bajar un DTM individual desde uahirise.org/dtm")
        print("   Plan C: usar teselas WMTS de Mars Trek como fondo.")
        sys.exit(1)

    print("\n✓ Archivos listos. Siguiente paso: python pendiente.py")
