# -*- coding: utf-8 -*-
import os, subprocess, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))

GDAL = r"C:\Users\Colet\miniconda3\envs\marswalk\Library\bin\gdal_translate.exe"
os.environ["GDAL_DATA"] = r"C:\Users\Colet\miniconda3\envs\marswalk\Library\share\gdal"

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

print("Recorte completado.")
