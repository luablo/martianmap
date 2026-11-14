"use client";

import { Map as MlMap, Marker, setWorkerUrl, type GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { ZONE, gridLines } from "@/lib/geo";
import type { LonLat } from "@/lib/types";

interface Props {
  destination: LonLat | null;
  /** Camino a dibujar. Hoy es una línea recta; luego será la salida del A*. */
  path: LonLat[] | null;
  onPickDestination: (p: LonLat) => void;
}

function markerEl(kind: "base" | "dest", label: string) {
  const el = document.createElement("div");
  el.className = `marker marker-${kind}`;
  el.innerHTML = `<span class="marker-dot"></span><span>${label}</span>`;
  return el;
}

const line = (coords: LonLat[]) => ({
  type: "Feature" as const,
  properties: {},
  geometry: { type: "LineString" as const, coordinates: coords },
});

export default function MapView({ destination, path, onPickDestination }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const destMarker = useRef<Marker | null>(null);
  const onPick = useRef(onPickDestination);
  useEffect(() => {
    onPick.current = onPickDestination;
  }, [onPickDestination]);

  useEffect(() => {
    if (!container.current) return;
    // Copiado a /public por scripts/copy-maplibre-worker.mjs (postinstall)
    setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
    const { west, south, east, north } = ZONE.bounds;
    const pad = 0.02;

    // Estilo vacío: MapLibre cree que está en la Tierra, pero aquí solo usamos
    // lon/lat de Marte como coordenadas. No hay mapa base terrestre.
    const map = new MlMap({
      container: container.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          { id: "bg", type: "background", paint: { "background-color": "#070a10" } },
        ],
      },
      bounds: [west, south, east, north],
      fitBoundsOptions: { padding: 40 },
      maxBounds: [west - pad, south - pad, east + pad, north + pad],
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("grid", {
        type: "geojson",
        data: { type: "FeatureCollection", features: gridLines(500).map(line) },
      });
      map.addLayer({
        id: "grid",
        type: "line",
        source: "grid",
        paint: { "line-color": "#1f2937", "line-width": 1 },
      });

      map.addSource("zone", {
        type: "geojson",
        data: line([
          [west, south], [east, south], [east, north], [west, north], [west, south],
        ]),
      });
      map.addLayer({
        id: "zone",
        type: "line",
        source: "zone",
        paint: { "line-color": "#38bdf8", "line-width": 1.5, "line-opacity": 0.6 },
      });

      // Ruta: borde oscuro debajo para leerse sobre cualquier terreno
      map.addSource("route", { type: "geojson", data: line([]) });
      map.addLayer({
        id: "route-casing",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#070a10", "line-width": 9 },
      });
      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#2dd4bf", "line-width": 5 },
      });
    });

    new Marker({ element: markerEl("base", "BASE"), anchor: "top", offset: [0, -9] })
      .setLngLat(ZONE.base)
      .addTo(map);

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      if (lng < west || lng > east || lat < south || lat > north) return;
      onPick.current([lng, lat]);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      destMarker.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (destination) {
      if (!destMarker.current) {
        destMarker.current = new Marker({
          element: markerEl("dest", "DESTINO"),
          anchor: "top",
          offset: [0, -9],
        })
          .setLngLat(destination)
          .addTo(map);
      } else destMarker.current.setLngLat(destination);
    } else {
      destMarker.current?.remove();
      destMarker.current = null;
    }

    const draw = () =>
      (map.getSource("route") as GeoJSONSource | undefined)?.setData(line(path ?? []));
    if (map.getSource("route")) draw();
    else map.once("load", draw);
  }, [destination, path]);

  // El CSS de MapLibre pone `position: relative` al contenedor: por eso va envuelto.
  return (
    <div className="absolute inset-0">
      <div ref={container} className="h-full w-full" aria-label="Mapa de la zona" />
    </div>
  );
}
