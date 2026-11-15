# -*- coding: utf-8 -*-
import os, shutil, subprocess, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# gdal_translate se toma de la variable GDAL_TRANSLATE o del PATH (conda install gdal).
# Antes estaba fija la ruta de una sola computadora.
GDAL = os.environ.get("GDAL_TRANSLATE") or shutil.which("gdal_translate")
if not GDAL:
    sys.exit("ERROR: no encuentro gdal_translate. Instala GDAL o define GDAL_TRANSLATE con su ruta.")

ULX = "-2130.6315"
ULY = "-280484.2874"
LRX = "1728.2645"
LRY = "-292663.1895"

jobs = [
    ("dem_recorte.tif",   "dem_clean.tif"),
    ("ortho_recorte.tif", "ortho_clean.tif"),
]

for src, dst in jobs:
    print(f"Recortando {src} -> {dst} ...")
    r = subprocess.run([GDAL, "-projwin", ULX, ULY, LRX, LRY, src, dst],
                       capture_output=True, text=True)
    if r.stdout: print(r.stdout)
    if r.stderr: print(r.stderr)
    if r.returncode != 0:
        print(f"ERROR en {src}")
        sys.exit(1)
    size_mb = os.path.getsize(dst) / 1024 / 1024
    print(f"OK {dst} ({size_mb:.1f} MB)")

print("Recorte completado. Siguiente: run_pendiente.py y luego run_exportar.py")
