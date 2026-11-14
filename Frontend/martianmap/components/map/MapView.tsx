"use client";
// Dueño: P3 (Mapa). Las props son el contrato con AppShell (P4): no cambiarlas sin avisar.
// Para capas nuevas, crear un archivo en components/map/layers/ y llamarlo desde aquí.

import { Map as MlMap, Marker, setWorkerUrl, type GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";
import { useEffect, useRef } from "react";
import { gridLines, insideBounds } from "@/lib/geo";
import type { LayerId, LonLat, Note, RouteResult, ZoneData } from "@/lib/types";
import { addNoGoLayer } from "./layers/nogo";
import { addPoiLayer } from "./layers/pois";

export interface MapViewProps {
  zone: ZoneData;
  destination: LonLat | null;
  route: RouteResult | null;
  /** Qué capas pidió encender el usuario (P3 decide cómo pintarlas) */
  layers: Record<LayerId, boolean>;
  notes: Note[];
  /** Toque dentro de la zona */
  onMapClick: (p: LonLat) => void;
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

export default function MapView({ zone, destination, route, onMapClick }: MapViewProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const destMarker = useRef<Marker | null>(null);
  const onClick = useRef(onMapClick);
  useEffect(() => {
    onClick.current = onMapClick;
  }, [onMapClick]);

  // Se crea una sola vez por zona
  useEffect(() => {
    if (!container.current) return;
    // Copiado a /public por scripts/copy-maplibre-worker.mjs (postinstall)
    setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

    const { meta } = zone;
    const { west, south, east, north } = meta.bounds;
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
        data: { type: "FeatureCollection", features: gridLines(meta, 500).map(line) },
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

      if (zone.nogo) addNoGoLayer(map, zone.nogo);
      addPoiLayer(map, zone.pois);

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
      .setLngLat([meta.base.lon, meta.base.lat])
      .addTo(map);

    map.on("click", (e) => {
      const p: LonLat = [e.lngLat.lng, e.lngLat.lat];
      if (insideBounds(meta, p)) onClick.current(p);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      destMarker.current = null;
    };
  }, [zone]);

  // Destino y ruta
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
      (map.getSource("route") as GeoJSONSource | undefined)?.setData(line(route?.path ?? []));
    if (map.getSource("route")) draw();
    else map.once("load", draw);
  }, [destination, route]);

  // TODO P3: efecto con `layers` (encender/apagar ortho, slope, radiación) y con `notes`.

  // El CSS de MapLibre pone `position: relative` al contenedor: por eso va envuelto.
  return (
    <div className="absolute inset-0">
      <div ref={container} className="h-full w-full" aria-label="Mapa de la zona" />
    </div>
  );
}
