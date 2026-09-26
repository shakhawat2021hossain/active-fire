"use client";

import { useEffect } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Polygon, TileLayer, Tooltip, useMap } from "react-leaflet";

export type FireMapObservation = {
  id: string;
  sensor: "MODIS" | "VIIRS";
  lat: string;
  lon: string;
  frp: number;
};

export type AreaOfInterest = "California, USA" | "Northern California" | "Central California" | "Southern California";

type FireMapProps = {
  observations: FireMapObservation[];
  view: "RAW" | "HARMONIZED";
  aoi: AreaOfInterest;
  mapStyle: "standard" | "light";
  recenterKey: number;
  zoomOffset?: number;
  selectedObservation: FireMapObservation | null;
  onSelect: (observationId: string) => void;
};

const areaViews: Record<AreaOfInterest, { center: [number, number]; zoom: number }> = {
  "California, USA": { center: [37.45, -120.2], zoom: 5 },
  "Northern California": { center: [40.15, -122.15], zoom: 7 },
  "Central California": { center: [37.55, -120.65], zoom: 7 },
  "Southern California": { center: [34.75, -118.8], zoom: 7 },
};

const californiaBoundary: [number, number][] = [
  [42.006, -123.233], [42.012, -122.379], [41.995, -120.002], [40.265, -119.996],
  [39, -120.002], [38.101, -118.715], [37.219, -117.499], [36.502, -116.54],
  [35.971, -115.85], [35.001, -114.634], [34.711, -114.47], [34.305, -114.136],
  [33.698, -114.498], [33.035, -114.662], [32.624, -116.048], [32.537, -117.126],
  [33.123, -117.329], [33.764, -118.184], [34.147, -119.219], [34.475, -120.139],
  [35.1, -120.632], [36.195, -121.716], [36.803, -121.787], [37.241, -122.417],
  [37.783, -122.516], [38.15, -122.406], [38.567, -123.332], [39.553, -123.765],
  [40.106, -124.11], [40.878, -124.159], [41.716, -124.148], [42.001, -124.214],
];

function MapViewport({ aoi, recenterKey, zoomOffset }: { aoi: AreaOfInterest; recenterKey: number; zoomOffset: number }) {
  const map = useMap();

  useEffect(() => {
    const { center, zoom } = areaViews[aoi];
    map.flyTo(center, zoom + zoomOffset, { duration: 0.55 });
  }, [aoi, map, recenterKey, zoomOffset]);

  return null;
}

export default function FireMap({
  observations,
  view,
  aoi,
  mapStyle,
  recenterKey,
  zoomOffset = 0,
  selectedObservation,
  onSelect,
}: FireMapProps) {
  const light = mapStyle === "light";
  const tileUrl = light
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution = light
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className={`map-canvas ${view === "HARMONIZED" ? "map-harmonized" : ""}`}>
      <MapContainer
        className="fire-leaflet-map"
        center={areaViews[aoi].center}
        zoom={areaViews[aoi].zoom + zoomOffset}
        minZoom={4}
        maxZoom={18}
        scrollWheelZoom
        attributionControl
      >
        <MapViewport aoi={aoi} recenterKey={recenterKey} zoomOffset={zoomOffset} />
        <TileLayer attribution={attribution} url={tileUrl} maxZoom={19} />
        <Polygon
          positions={californiaBoundary}
          pathOptions={{ color: "#bd4c1c", weight: 2, opacity: 0.95, fillColor: "#dc784b", fillOpacity: 0.08 }}
          interactive={false}
        >
          <Tooltip permanent direction="center" className="area-map-label">CALIFORNIA</Tooltip>
        </Polygon>
        {observations.map((observation) => {
          const selected = selectedObservation?.id === observation.id;
          const markerClass = [
            "fire-map-marker",
            observation.sensor === "MODIS" ? "marker-modis" : "marker-viirs",
            view === "HARMONIZED" ? "marker-common" : "",
            selected ? "marker-selected" : "",
          ].filter(Boolean).join(" ");
          const icon = divIcon({
            className: "fire-map-icon-wrap",
            html: `<span class="${markerClass}"></span>`,
            iconSize: [25, 25],
            iconAnchor: [12.5, 12.5],
          });

          return (
            <Marker
              key={observation.id}
              position={[Number(observation.lat), Number(observation.lon)]}
              icon={icon}
              title={`Select ${observation.sensor} fire at ${observation.lat}, ${observation.lon}; ${observation.frp} megawatts`}
              alt={`${observation.sensor} fire observation`}
              zIndexOffset={selected ? 1000 : 0}
              eventHandlers={{ click: () => onSelect(observation.id) }}
            />
          );
        })}
      </MapContainer>
      <div className="map-attribution-label">STATIC OBSERVATIONS · NOT LIVE</div>
    </div>
  );
}