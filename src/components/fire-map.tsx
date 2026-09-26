"use client";

import { useEffect } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

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
  selectedObservation: FireMapObservation | null;
  onSelect: (observationId: string) => void;
};

const areaViews: Record<AreaOfInterest, { center: [number, number]; zoom: number }> = {
  "California, USA": { center: [37.45, -120.2], zoom: 5 },
  "Northern California": { center: [40.15, -122.15], zoom: 7 },
  "Central California": { center: [37.55, -120.65], zoom: 7 },
  "Southern California": { center: [34.75, -118.8], zoom: 7 },
};

function MapViewport({ aoi, recenterKey }: { aoi: AreaOfInterest; recenterKey: number }) {
  const map = useMap();

  useEffect(() => {
    const { center, zoom } = areaViews[aoi];
    map.flyTo(center, zoom, { duration: 0.55 });
  }, [aoi, map, recenterKey]);

  return null;
}

export default function FireMap({
  observations,
  view,
  aoi,
  mapStyle,
  recenterKey,
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
        center={areaViews["California, USA"].center}
        zoom={areaViews["California, USA"].zoom}
        minZoom={4}
        maxZoom={18}
        scrollWheelZoom
        attributionControl
      >
        <MapViewport aoi={aoi} recenterKey={recenterKey} />
        <TileLayer attribution={attribution} url={tileUrl} maxZoom={19} />
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