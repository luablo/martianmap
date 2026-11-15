# -*- coding: utf-8 -*-
import os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))

import numpy as np
from pathlib import Path
from PIL import Image

OUT_DIR  = Path("../Frontend/martianmap/public/data/gale")
SLOPE_W  = 964
SLOPE_H  = 3045

print("Leyendo slope.bin...")
slope = np.fromfile(OUT_DIR / "slope.bin", dtype=np.uint8).reshape((SLOPE_H, SLOPE_W)).astype(np.float32)
print(f"  {SLOPE_W}x{SLOPE_H}, max={slope.max():.1f} deg")

rgba = np.zeros((SLOPE_H, SLOPE_W, 4), dtype=np.uint8)
rgba[slope < 10]  = [52,  211, 153, 120]
rgba[(slope >= 10) & (slope < 25)] = [251, 191, 36, 150]
rgba[slope >= 25] = [239,  68,  68, 180]

print("Guardando slope.png...")
Image.fromarray(rgba, mode="RGBA").save(OUT_DIR / "slope.png")
print(f"OK slope.png ({os.path.getsize(OUT_DIR / 'slope.png') // 1024} KB)")
