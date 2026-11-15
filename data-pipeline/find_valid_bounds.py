# -*- coding: utf-8 -*-
"""
find_valid_bounds.py
Encuentra el mayor rectangulo recto con datos validos dentro del DEM/ortofoto.
Maneja franjas diagonales calculando el rectangulo inscrito correctamente.
"""
import sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

import numpy as np
import rasterio

DEM_IN   = "dem_recorte.tif"
ORTHO_IN = "ortho_recorte.tif"

def find_valid_rect(path, sample_size=800):
    with rasterio.open(path) as src:
        scale = min(sample_size / src.width, sample_size / src.height)
        sw = int(src.width  * scale)
        sh = int(src.height * scale)
        data = src.read(1, out_shape=(sh, sw),
                        resampling=rasterio.enums.Resampling.nearest).astype(np.float32)
        bounds = src.bounds
        nd = src.nodata

    # Mascara de datos validos
    if nd is not None:
        valid = (data != nd) & np.isfinite(data)
    else:
        valid = np.isfinite(data) & (data != 0)

    # Por cada fila: columna mas a la izquierda y mas a la derecha con datos
    row_left  = np.full(sh, sw,  dtype=int)
    row_right = np.full(sh, -1, dtype=int)
    for r in range(sh):
        cols = np.where(valid[r])[0]
        if len(cols) >= 2:
            row_left[r]  = int(cols[0])
            row_right[r] = int(cols[-1])

    # Filas que tienen datos
    rows_with_data = np.where(row_right >= 0)[0]
    if len(rows_with_data) == 0:
        raise ValueError(f"No se encontraron datos validos en {path}")

    r_top    = int(rows_with_data[0])
    r_bottom = int(rows_with_data[-1])

    # Rectangulo inscrito: dentro del rango de filas validas,
    # la columna izquierda es el MAXIMO de row_left (la mas restrictiva)
    # la columna derecha es el MINIMO de row_right (la mas restrictiva)
    rng = slice(r_top, r_bottom + 1)
    c_left  = int(np.max(row_left [rng]))
    c_right = int(np.min(row_right[rng]))

    print(f"  Filas con datos: {r_top} - {r_bottom}  ({r_bottom-r_top} filas)")
    print(f"  Cols inscrito:   {c_left} - {c_right}  ({c_right-c_left} cols)")

    if c_right <= c_left:
        # La franja es muy diagonal — usamos la mediana en lugar del max/min
        c_left  = int(np.median(row_left [rng]))
        c_right = int(np.median(row_right[rng]))
        print(f"  Ajuste por diagonal — usando mediana: {c_left} - {c_right}")

    # Margen de 2% para evitar pixeles de borde con artefactos
    margin_r = max(2, int((r_bottom - r_top)  * 0.02))
    margin_c = max(2, int((c_right  - c_left) * 0.02))
    r_top    += margin_r;  r_bottom -= margin_r
    c_left   += margin_c;  c_right  -= margin_c

    # Pixeles del thumbnail -> coordenadas proyectadas
    px_w = (bounds.right - bounds.left) / sw
    px_h = (bounds.top   - bounds.bottom) / sh

    ulx = bounds.left + c_left   * px_w
    lrx = bounds.left + c_right  * px_w
    uly = bounds.top  - r_top    * px_h
    lry = bounds.top  - r_bottom * px_h

    print(f"  ULX={ulx:.2f}  ULY={uly:.2f}  LRX={lrx:.2f}  LRY={lry:.2f}")
    return ulx, uly, lrx, lry

print("=== DEM ===")
ulx_d, uly_d, lrx_d, lry_d = find_valid_rect(DEM_IN)

print("\n=== ORTOFOTO ===")
ulx_o, uly_o, lrx_o, lry_o = find_valid_rect(ORTHO_IN)

# Interseccion conservadora de ambos
ulx = max(ulx_d, ulx_o)
uly = min(uly_d, uly_o)
lrx = min(lrx_d, lrx_o)
lry = max(lry_d, lry_o)

print(f"""
=== RECORTE FINAL ===
  ULX = {ulx:.4f}
  ULY = {uly:.4f}
  LRX = {lrx:.4f}
  LRY = {lry:.4f}
  Ancho: {lrx-ulx:.0f} m   Alto: {uly-lry:.0f} m

Comandos gdal_translate:
  gdal_translate -projwin {ulx:.4f} {uly:.4f} {lrx:.4f} {lry:.4f} dem_recorte.tif    dem_clean.tif
  gdal_translate -projwin {ulx:.4f} {uly:.4f} {lrx:.4f} {lry:.4f} ortho_recorte.tif  ortho_clean.tif
""")
