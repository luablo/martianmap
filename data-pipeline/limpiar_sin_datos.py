# -*- coding: utf-8 -*-
"""
Dueño: P1. Se corre DESPUÉS de run_pendiente.py y run_exportar.py.

El DTM de HiRISE es una franja inclinada: ~24 % del rectángulo no tiene datos (en la
ortofoto esos píxeles valen 0). run_pendiente.py rellena ese hueco con la mediana, así
que salía como terreno plano: verde en el mapa y la ruta podía cruzarlo.

Este script, usando solo lo que ya está en public/data/gale/:
  1. Marca "sin datos" donde la ortofoto es 0, más 2 celdas de margen (en el borde de la
     franja la pendiente sale falsa, de hasta 89°).
  2. slope.bin: esas celdas valen 255 → bloqueadas en todos los modos.
  3. slope.png: transparente < 9°, ámbar 9–15°, rojo > 15°, alfa 60 % (los colores que
     acordaron P1 y P3, ver components/map/layers/slope.ts); "sin datos" transparente.

Uso:  python data-pipeline/limpiar_sin_datos.py
Requiere: numpy, Pillow (con WebP).
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")
DIR = Path(__file__).resolve().parent.parent / "Frontend" / "martianmap" / "public" / "data" / "gale"
SIN_DATOS = 255
MARGEN = 2  # celdas

meta = json.loads((DIR / "meta.json").read_text(encoding="utf-8"))
w, h = meta["width"], meta["height"]
slope = np.fromfile(DIR / "slope.bin", dtype=np.uint8)
assert slope.size == w * h, f"slope.bin mide {slope.size}, meta dice {w}x{h}"
slope = slope.reshape(h, w)

# 1) Máscara desde la ortofoto, llevada a la malla de pendiente (vecino más cercano).
ortho = Image.open(DIR / meta["files"]["ortho"]).convert("L")
vacio = np.asarray(ortho.resize((w, h), Image.NEAREST)) == 0

# Margen: dilatar MARGEN celdas en las 8 direcciones (sin scipy).
for _ in range(MARGEN):
    m = vacio.copy()
    m[1:, :] |= vacio[:-1, :]
    m[:-1, :] |= vacio[1:, :]
    m[:, 1:] |= vacio[:, :-1]
    m[:, :-1] |= vacio[:, 1:]
    vacio = m

# Si ya se corrió antes, lo marcado con 255 también cuenta como vacío.
vacio |= slope == SIN_DATOS

# 2) slope.bin
slope = slope.copy()
slope[vacio] = SIN_DATOS
slope.tofile(DIR / "slope.bin")

# 3) slope.png
rgba = np.zeros((h, w, 4), dtype=np.uint8)
valido = ~vacio
ambar = valido & (slope >= 9) & (slope <= 15)
rojo = valido & (slope > 15)
rgba[ambar] = [0xFB, 0xBF, 0x24, 153]
rgba[rojo] = [0xEF, 0x44, 0x44, 153]
Image.fromarray(rgba, mode="RGBA").save(DIR / "slope.png", optimize=True)

v = slope[valido]
print(f"Sin datos: {vacio.mean():.1%} de la malla (bloqueado, transparente)")
print(f"Con datos: < 9° {np.mean(v < 9):.1%} · 9–15° {np.mean((v >= 9) & (v <= 15)):.1%} · > 15° {np.mean(v > 15):.1%} · máx {v.max()}°")
print("OK slope.bin y slope.png")
