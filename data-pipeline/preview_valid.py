# -*- coding: utf-8 -*-
"""
preview_valid.py
Genera una imagen pequeña mostrando la mascara de datos validos
y el rectangulo inscrito calculado, para inspeccion visual.
"""
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

import numpy as np
import rasterio
from PIL import Image, ImageDraw

DEM_IN = "dem_recorte.tif"
SIZE   = 600

with rasterio.open(DEM_IN) as src:
    scale = min(SIZE / src.width, SIZE / src.height)
    sw = int(src.width  * scale)
    sh = int(src.height * scale)
    data = src.read(1, out_shape=(sh, sw),
                    resampling=rasterio.enums.Resampling.nearest).astype(np.float32)
    nd = src.nodata
    bounds = src.bounds

# Mascara valida
if nd is not None:
    valid = (data != nd) & np.isfinite(data)
else:
    valid = np.isfinite(data)

# Imagen de la mascara
mask_img = np.zeros((sh, sw, 3), dtype=np.uint8)
mask_img[valid]  = [200, 200, 200]   # gris = datos
mask_img[~valid] = [0,   0,   0]     # negro = sin datos

# Calcular rectangulo por acumulacion de columnas validas por fila
row_left  = np.full(sh, sw,  dtype=int)
row_right = np.full(sh, -1,  dtype=int)
for r in range(sh):
    cols = np.where(valid[r])[0]
    if len(cols) >= 2:
        row_left[r]  = int(cols[0])
        row_right[r] = int(cols[-1])

rows_with_data = np.where(row_right >= 0)[0]
r_top    = int(rows_with_data[0])
r_bottom = int(rows_with_data[-1])

# Buscar el rectangulo de maximo area por programacion dinamica simple
# Para cada par (r_top, r_bottom) calcular c_left y c_right
best_area = 0
best_rect = None
# Muestrear cada 10 filas para rapidez
step = 5
for rt in range(r_top, r_bottom, step):
    cl = row_left[rt]
    cr = row_right[rt]
    for rb in range(rt + step, r_bottom + 1, step):
        cl = max(cl, row_left[rb])
        cr = min(cr, row_right[rb])
        if cr > cl:
            area = (rb - rt) * (cr - cl)
            if area > best_area:
                best_area = area
                best_rect = (rt, rb, cl, cr)

if best_rect:
    rt, rb, cl, cr = best_rect
    # Margen 1%
    mr = max(1, int((rb-rt) * 0.01))
    mc = max(1, int((cr-cl) * 0.01))
    rt += mr; rb -= mr; cl += mc; cr -= mc

    # Dibujar rectangulo en la imagen
    img = Image.fromarray(mask_img)
    draw = ImageDraw.Draw(img)
    draw.rectangle([cl, rt, cr, rb], outline=(0, 255, 0), width=3)
    img.save("preview_valid.png")
    print(f"Preview guardado: preview_valid.png")
    print(f"Rectangulo optimo (pixeles thumbnail): top={rt} bottom={rb} left={cl} right={cr}")
    print(f"Area: {best_area} px^2  ({cr-cl} x {rb-rt})")

    # Convertir a coordenadas proyectadas
    px_w = (bounds.right - bounds.left) / sw
    px_h = (bounds.top   - bounds.bottom) / sh
    ulx = bounds.left + cl * px_w
    lrx = bounds.left + cr * px_w
    uly = bounds.top  - rt * px_h
    lry = bounds.top  - rb * px_h

    print(f"\n=== RECORTE OPTIMO ===")
    print(f"  ULX={ulx:.4f}  ULY={uly:.4f}  LRX={lrx:.4f}  LRY={lry:.4f}")
    print(f"  Ancho: {lrx-ulx:.0f} m   Alto: {uly-lry:.0f} m")
    print(f"\ngdal_translate -projwin {ulx:.4f} {uly:.4f} {lrx:.4f} {lry:.4f} dem_recorte.tif dem_clean.tif")
    print(f"gdal_translate -projwin {ulx:.4f} {uly:.4f} {lrx:.4f} {lry:.4f} ortho_recorte.tif ortho_clean.tif")
else:
    print("No se encontro rectangulo valido")
