import rasterio

with rasterio.open("dem_recorte.tif") as src:
    print("size:", src.width, "x", src.height)
    print("transform:", src.transform)
    print("res (m):", src.res)
    print("bounds:", src.bounds)
    print("crs:", src.crs.to_string()[:300])
    # Leer una muestra para ver rango de valores
    import numpy as np
    sample = src.read(1, out_shape=(100, 100))
    valid = sample[sample != src.nodata] if src.nodata else sample.flatten()
    print("elev min:", valid.min(), "max:", valid.max(), "nodata:", src.nodata)
