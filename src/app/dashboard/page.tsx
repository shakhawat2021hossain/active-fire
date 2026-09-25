"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  CalendarDays,
  ChevronDown,
  Crosshair,
  Info,
  Layers2,
  MapPin,
  Satellite,
  SlidersHorizontal,
  X,
} from "lucide-react";

type Sensor = "MODIS" | "VIIRS";
type Confidence = "All" | "High" | "Nominal" | "Low";
type TimeOfDay = "All" | "Day" | "Night";
type FireType = "All" | "Vegetation" | "Volcano" | "Static" | "Offshore";
type DashboardFilters = { sensor: "All" | Sensor; confidence: Confidence; timeOfDay: TimeOfDay; fireType: FireType };
type Observation = {
  id: string;
  sensor: Sensor;
  satellite: string;
  date: string;
  time: string;
  lat: string;
  lon: string;
  frp: number;
  confidence: string;
  confidenceLevel: Exclude<Confidence, "All">;
  timeOfDay: Exclude<TimeOfDay, "All">;
  fireTypeCategory: Exclude<FireType, "All">;
  brightness: number;
  fireType: string;
  x: number;
  y: number;
};

const observationRecords: Omit<Observation, "confidenceLevel" | "timeOfDay" | "fireTypeCategory">[] = [
  { id: "v1", sensor: "VIIRS", satellite: "NOAA-20", date: "18 Mar 2025", time: "20:42:16", lat: "39.7284", lon: "-121.6182", frp: 1284, confidence: "High · 94%", brightness: 367.8, fireType: "Vegetation fire", x: 42, y: 29 },
  { id: "m1", sensor: "MODIS", satellite: "TERRA", date: "18 Mar 2025", time: "19:51:08", lat: "39.6842", lon: "-121.7021", frp: 842, confidence: "Nominal", brightness: 341.2, fireType: "Vegetation fire", x: 39, y: 31 },
  { id: "v2", sensor: "VIIRS", satellite: "S-NPP", date: "18 Mar 2025", time: "21:06:44", lat: "40.1285", lon: "-121.3261", frp: 614, confidence: "High · 89%", brightness: 351.6, fireType: "Vegetation fire", x: 45, y: 22 },
  { id: "v3", sensor: "VIIRS", satellite: "NOAA-21", date: "18 Mar 2025", time: "21:14:02", lat: "38.1481", lon: "-120.4148", frp: 462, confidence: "High · 91%", brightness: 338.3, fireType: "Vegetation fire", x: 56, y: 47 },
  { id: "m2", sensor: "MODIS", satellite: "AQUA", date: "18 Mar 2025", time: "20:19:36", lat: "37.7486", lon: "-120.9142", frp: 391, confidence: "Nominal", brightness: 329.7, fireType: "Vegetation fire", x: 52, y: 57 },
  { id: "v4", sensor: "VIIRS", satellite: "S-NPP", date: "18 Mar 2025", time: "21:27:51", lat: "36.8241", lon: "-119.6844", frp: 348, confidence: "High · 88%", brightness: 342.8, fireType: "Vegetation fire", x: 62, y: 66 },
  { id: "v5", sensor: "VIIRS", satellite: "NOAA-20", date: "18 Mar 2025", time: "21:31:09", lat: "41.0821", lon: "-123.0174", frp: 274, confidence: "Nominal", brightness: 319.5, fireType: "Vegetation fire", x: 29, y: 13 },
  { id: "m3", sensor: "MODIS", satellite: "TERRA", date: "18 Mar 2025", time: "19:43:20", lat: "34.8412", lon: "-118.6238", frp: 226, confidence: "Nominal", brightness: 326.9, fireType: "Vegetation fire", x: 72, y: 79 },
  { id: "v6", sensor: "VIIRS", satellite: "NOAA-21", date: "18 Mar 2025", time: "21:44:11", lat: "37.1628", lon: "-119.3821", frp: 204, confidence: "High · 92%", brightness: 337.1, fireType: "Vegetation fire", x: 66, y: 58 },
  { id: "m4", sensor: "MODIS", satellite: "AQUA", date: "18 Mar 2025", time: "20:27:54", lat: "38.0241", lon: "-121.9820", frp: 183, confidence: "Nominal", brightness: 312.6, fireType: "Vegetation fire", x: 37, y: 48 },
  { id: "v7", sensor: "VIIRS", satellite: "S-NPP", date: "18 Mar 2025", time: "21:19:08", lat: "35.9144", lon: "-118.4170", frp: 176, confidence: "Nominal", brightness: 321.4, fireType: "Vegetation fire", x: 76, y: 71 },
  { id: "m5", sensor: "MODIS", satellite: "TERRA", date: "18 Mar 2025", time: "19:38:47", lat: "40.6517", lon: "-122.5850", frp: 143, confidence: "Nominal", brightness: 308.8, fireType: "Vegetation fire", x: 34, y: 17 },
  { id: "v8", sensor: "VIIRS", satellite: "NOAA-20", date: "18 Mar 2025", time: "21:53:31", lat: "34.2801", lon: "-117.4689", frp: 121, confidence: "High · 86%", brightness: 316.4, fireType: "Vegetation fire", x: 84, y: 88 },
  { id: "m6", sensor: "MODIS", satellite: "AQUA", date: "18 Mar 2025", time: "20:34:18", lat: "39.2491", lon: "-120.0772", frp: 94, confidence: "Nominal", brightness: 301.7, fireType: "Vegetation fire", x: 58, y: 36 },
  { id: "v9", sensor: "VIIRS", satellite: "NOAA-21", date: "18 Mar 2025", time: "21:02:12", lat: "40.4921", lon: "-121.5050", frp: 59, confidence: "Low", brightness: 306.2, fireType: "Volcano", x: 49, y: 18 },
  { id: "m7", sensor: "MODIS", satellite: "TERRA", date: "18 Mar 2025", time: "19:56:43", lat: "37.8044", lon: "-122.2712", frp: 39, confidence: "Nominal", brightness: 301.1, fireType: "Static", x: 32, y: 52 },
  { id: "v10", sensor: "VIIRS", satellite: "S-NPP", date: "18 Mar 2025", time: "21:18:57", lat: "33.9212", lon: "-120.7310", frp: 23, confidence: "Low", brightness: 298.4, fireType: "Offshore", x: 46, y: 91 },
];

const observations: Observation[] = observationRecords.map((observation, index) => ({
  ...observation,
  confidenceLevel: observation.confidence.startsWith("High") ? "High" : observation.confidence === "Low" ? "Low" : "Nominal",
  timeOfDay: [1, 5, 9, 13, 16].includes(index) ? "Night" : "Day",
  fireTypeCategory: observation.fireType === "Vegetation fire" ? "Vegetation" : observation.fireType as Exclude<FireType, "All">,
}));

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayOfYear = (date: Date) => Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function dailyActivity(date: Date, filters?: DashboardFilters) {
  const day = dayOfYear(date);
  const seasonal = Math.max(0, Math.sin(((day - 90) / 365) * Math.PI * 2));
  const pulse = Math.max(0, 1 - Math.abs(day - 77) / 13);
  const summerPulse = Math.max(0, 1 - Math.abs(day - 230) / 45);
  const wobble = (Math.sin(day * 12.9898) + Math.cos(day * 4.1414)) * 0.5;
  const sensorFactor = filters?.sensor === "MODIS" ? 0.328 : filters?.sensor === "VIIRS" ? 0.672 : 1;
  const confidenceFactor = filters?.confidence === "High" ? 0.43 : filters?.confidence === "Nominal" ? 0.48 : filters?.confidence === "Low" ? 0.09 : 1;
  const timeFactor = filters?.timeOfDay === "Day" ? 0.72 : filters?.timeOfDay === "Night" ? 0.28 : 1;
  const fireFactor = filters?.fireType === "All" || !filters ? 1 : filters.fireType === "Vegetation" ? 0.91 : filters.fireType === "Volcano" ? 0.035 : filters.fireType === "Static" ? 0.035 : 0.02;
  const multiplier = sensorFactor * confidenceFactor * timeFactor * fireFactor;
  const baseObservations = dateKey(date) === "2025-03-18" ? 428 : Math.max(0, Math.round(18 + seasonal * 175 + pulse * 235 + summerPulse * 270 + wobble * 28));
  const observationsCount = Math.round(baseObservations * multiplier);
  const baseActivity = dateKey(date) === "2025-03-18" ? 89 : Math.min(100, Math.round(baseObservations / 4.8));
  const activity = Math.min(100, Math.round(baseActivity * (filters?.sensor === "All" || !filters ? 1 : 0.84) * (filters?.confidence === "All" || !filters ? 1 : 0.87) * (filters?.timeOfDay === "All" || !filters ? 1 : 0.9) * (filters?.fireType === "All" || !filters ? 1 : filters.fireType === "Vegetation" ? 1 : 0.56)));
  const baseFrp = dateKey(date) === "2025-03-18" ? 1284 : Math.round(90 + baseObservations * 1.42);
  const frp = Math.max(0, Math.round(baseFrp * (filters?.sensor === "MODIS" ? 0.74 : filters?.sensor === "VIIRS" ? 1 : 1) * (filters?.confidence === "Low" ? 0.35 : 1) * (filters?.fireType === "All" || !filters || filters.fireType === "Vegetation" ? 1 : 0.24)));
  const anomaly = dateKey(date) === "2025-03-18" ? 42 : Math.round(wobble * 14 + seasonal * 8);
  return {
    date,
    key: dateKey(date),
    observations: observationsCount,
    activity,
    meanFrp: observationsCount ? Math.max(0, Math.round(frp / Math.max(1, observationsCount / 38))) : 0,
    frp,
    anomaly,
  };
}

function dayLabel(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")} ${monthNames[date.getMonth()].toUpperCase()} ${date.getFullYear()}`;
}

function CalendarHeatmap({ selectedDate, onSelect, filters, view }: { selectedDate: Date; onSelect: (date: Date) => void; filters: DashboardFilters; view: "RAW" | "HARMONIZED" }) {
  const days = useMemo(() => Array.from({ length: 365 }, (_, index) => dailyActivity(new Date(2025, 0, index + 1), filters)), [filters]);
  const firstOffset = new Date(2025, 0, 1).getDay();
  const monthStarts = monthNames.map((month, index) => ({ month, week: Math.floor((firstOffset + dayOfYear(new Date(2025, index, 1)) - 1) / 7) }));

  return (
    <div className="calendar-wrap">
      <div className="calendar-months" aria-hidden="true">
        {monthStarts.map(({ month, week }) => <span key={month} style={{ left: `${(week / 53) * 100}%` }}>{month}</span>)}
      </div>
      <div className="calendar-grid" role="group" aria-label="Daily burning activity during 2025">
        {Array.from({ length: firstOffset }, (_, index) => <span aria-hidden="true" className="calendar-blank" key={`blank-${index}`} />)}
        {days.map((day, index) => {
          const intensityValue = view === "RAW" ? day.observations / 4.3 : day.activity;
          const intensity = intensityValue === 0 ? 0 : Math.max(1, Math.min(5, Math.ceil(intensityValue / 20)));
          return (
            <button
              key={day.key}
              type="button"
              aria-label={`${dayLabel(day.date)}: ${day.observations} observations, ${day.activity} harmonized activity, ${day.frp} MW FRP, ${day.anomaly}% anomaly`}
              aria-pressed={dateKey(selectedDate) === day.key}
              className={`calendar-day intensity-${intensity} ${index >= 170 ? "tooltip-align-end" : "tooltip-align-start"}${dateKey(selectedDate) === day.key ? " is-selected" : ""}`}
              title={`${dayLabel(day.date)} · ${day.observations} fire observations · ${day.activity} harmonized activity · ${day.meanFrp} MW mean FRP · ${day.frp.toLocaleString()} MW peak FRP · ${day.anomaly > 0 ? "+" : ""}${day.anomaly}% anomaly`}
              onClick={() => onSelect(day.date)}
            ><span className="calendar-tooltip"><strong>{dayLabel(day.date)}</strong><span>{day.observations.toLocaleString()} fire observations</span><span>{day.activity} harmonized activity</span><span>Mean FRP {day.meanFrp} MW · Peak {day.frp.toLocaleString()} MW</span><span>Anomaly {day.anomaly > 0 ? "+" : ""}{day.anomaly}%</span></span></button>
          );
        })}
      </div>
      <div className="calendar-legend"><span>Low</span>{[1, 2, 3, 4, 5].map((level) => <i className={`intensity-${level}`} key={level} />)}<span>High</span></div>
    </div>
  );
}

function SeasonalChart({ selectedDate, activity, anomaly, view }: { selectedDate: Date; activity: number; anomaly: number; view: "RAW" | "HARMONIZED" }) {
  const selectedMonth = selectedDate.getMonth();
  const selectedActivity = view === "RAW" ? Math.round(activity * 0.78) : activity;
  const selectedBaseline = Math.max(1, Math.round(selectedActivity / (1 + anomaly / 100)));
  const baselinePoints = [
    { month: 0, value: 16, baseline: 20 }, { month: 1, value: 22, baseline: 23 }, { month: 2, value: 72, baseline: 51 },
    { month: 3, value: 43, baseline: 35 }, { month: 4, value: 28, baseline: 33 }, { month: 5, value: 38, baseline: 42 },
    { month: 6, value: 55, baseline: 53 }, { month: 7, value: 76, baseline: 65 }, { month: 8, value: 87, baseline: 78 },
    { month: 9, value: 64, baseline: 62 }, { month: 10, value: 33, baseline: 38 }, { month: 11, value: 18, baseline: 24 },
  ];
  const points = baselinePoints.map((point, index) => index === selectedMonth ? { ...point, value: selectedActivity, baseline: selectedBaseline } : point);
  const x = (index: number) => 42 + index * 51;
  const y = (value: number) => 176 - value * 1.55;
  const line = (key: "value" | "baseline") => points.map((point, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(point[key])}`).join(" ");
  const range = `${points.map((point, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(point.baseline + 11)}`).join(" ")} ${points.slice().reverse().map((point, reverseIndex) => { const index = points.length - 1 - reverseIndex; return `L${x(index)},${y(point.baseline - 11)}`; }).join(" ")} Z`;
  const expectedBoundary = selectedActivity > selectedBaseline + 11 ? selectedBaseline + 11 : selectedActivity < selectedBaseline - 11 ? selectedBaseline - 11 : null;
  return (
    <svg className="chart-svg" viewBox="0 0 650 230" role="img" aria-label="Monthly burning activity compared to historical seasonal baseline">
      {[20, 60, 100, 140, 180].map((lineY) => <g key={lineY}><line className="chart-gridline" x1="42" x2="604" y1={lineY} y2={lineY} /><text className="chart-axis" x="30" y={lineY + 3} textAnchor="end">{Math.round((180 - lineY) / 1.55)}</text></g>)}
      <path className="chart-range" d={range} />
      {expectedBoundary !== null && <rect className="chart-anomaly-region" x={x(selectedMonth) - 5} y={Math.min(y(selectedActivity), y(expectedBoundary))} width="10" height={Math.max(2, Math.abs(y(selectedActivity) - y(expectedBoundary)))} />}
      <path className="chart-baseline" d={line("baseline")} />
      <path className="chart-observed" d={line("value")} />
      <line className="chart-selected-guide" x1={x(selectedMonth)} x2={x(selectedMonth)} y1="20" y2="178" />
      {points.map((point, index) => <g key={index}><circle className={index === selectedMonth ? "chart-point chart-point-selected" : "chart-point"} cx={x(index)} cy={y(point.value)} r={index === selectedMonth ? "5" : "3.5"} aria-label={`${monthNames[index]}: activity index ${point.value}`}><title>{`${monthNames[index]}: activity index ${point.value}${index === selectedMonth ? " · selected period" : ""}`}</title></circle><text className="chart-axis" x={x(index)} y="204" textAnchor="middle">{monthNames[index]}</text></g>)}
    </svg>
  );
}

function FrpChart({ selectedDate, filters }: { selectedDate: Date; filters: DashboardFilters }) {
  const daysInMonth = new Date(2025, selectedDate.getMonth() + 1, 0).getDate();
  const values = Array.from({ length: daysInMonth }, (_, index) => dailyActivity(new Date(2025, selectedDate.getMonth(), index + 1), filters).frp);
  const selectedIndex = selectedDate.getDate() - 1;
  const x = (index: number) => 42 + index * (562 / Math.max(1, values.length - 1));
  const y = (value: number) => 175 - (value / 10) * 1.17;
  const path = values.map((value, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(value)}`).join(" ");
  const area = `${path} L${x(values.length - 1)},178 L${x(0)},178 Z`;
  return (
    <svg className="chart-svg" viewBox="0 0 650 230" role="img" aria-label="Daily fire radiative power during March 2025">
      {[40, 80, 120, 160].map((lineY) => <g key={lineY}><line className="chart-gridline" x1="42" x2="604" y1={lineY} y2={lineY} /><text className="chart-axis" x="30" y={lineY + 3} textAnchor="end">{Math.round((178 - lineY) * 10 / 1.17)}</text></g>)}
      <path className="frp-area" d={area} /><path className="frp-line" d={path} />
      {values.map((value, index) => <circle className={index === selectedIndex ? "frp-point frp-point-selected" : "frp-point"} cx={x(index)} cy={y(value)} key={index} r={index === selectedIndex ? "4" : "2"} aria-label={`${index + 1} ${monthNames[selectedDate.getMonth()]} 2025: ${value} MW`}><title>{`${index + 1} ${monthNames[selectedDate.getMonth()]} 2025 · ${value} MW${index === selectedIndex ? " · selected date" : ""}`}</title></circle>)}
      {[1, 8, 15, 22, 29].filter((day) => day <= daysInMonth).map((day) => <text className="chart-axis" key={day} x={x(day - 1)} y="204" textAnchor="middle">{String(day).padStart(2, "0")} {monthNames[selectedDate.getMonth()]}</text>)}
    </svg>
  );
}

function CaliforniaMap({
  view,
  filters,
  aoi,
  selectedObservation,
  onSelect,
}: {
  view: "RAW" | "HARMONIZED";
  filters: DashboardFilters;
  aoi: string;
  selectedObservation: Observation | null;
  onSelect: (observation: Observation) => void;
}) {
  const visible = observations.filter((observation) => {
    const latitude = Number(observation.lat);
    const inArea = aoi === "Northern California" ? latitude >= 39 : aoi === "Central California" ? latitude >= 36 && latitude < 39 : aoi === "Southern California" ? latitude < 36 : true;
    return inArea && (filters.sensor === "All" || observation.sensor === filters.sensor)
      && (filters.confidence === "All" || observation.confidenceLevel === filters.confidence)
      && (filters.timeOfDay === "All" || observation.timeOfDay === filters.timeOfDay)
      && (filters.fireType === "All" || observation.fireTypeCategory === filters.fireType);
  });
  return (
    <div className={`map-canvas ${view === "HARMONIZED" ? "map-harmonized" : ""}`}>
      <svg className="map-art" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="map-grain" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".55" fill="#bfc6b3" opacity=".45" /></pattern>
          <clipPath id="california-clip"><path d="M302 34 L523 50 L541 115 L558 173 L579 232 L602 290 L624 346 L611 383 L590 423 L570 466 L537 514 L493 557 L440 578 L397 556 L371 514 L339 469 L306 421 L278 377 L256 333 L226 296 L231 254 L249 212 L256 170 L270 128 L284 86 Z" /></clipPath>
        </defs>
        <rect width="900" height="600" fill="#edf0e7" />
        <path d="M0 0h284l-14 86-14 42-7 42-7 42-23 42-4 42 30 37 22 44 28 44 33 48 32 45 26 42 43 22 53-21 44-43 33-48 33-48 25-44 21-41 13-37-22-56-22-58-21-59-18-58-15-55-18-49-221-16H0z" fill="#e5eadf" />
        <path d="M0 0h266l18 41-22 45-21 42-7 42-7 42-23 42-4 42 30 37 22 44 28 44 33 48 32 45 26 42 43 22 53-21 44-43 33-48 33-48 25-44 21-41 13-37-22-56-22-58-21-59-18-58-15-55-18-49" fill="none" stroke="#ffffff" strokeWidth="6" />
        <path d="M287 0v600M0 147h900M0 300h900M0 451h900M650 0v600" stroke="#d9ded3" strokeWidth="1" strokeDasharray="3 7" />
        <path d="M335 0l-4 74 24 62 18 54 22 65 22 66 22 72 22 72 22 91M430 0l-6 80 13 55 16 68 16 68 21 71 24 77 21 68" fill="none" stroke="#d5d3c6" strokeWidth="2" />
        <path d="M0 229c88-17 126-19 225-7m-202 92c67-6 137-6 235 12M23 431c74-22 127-7 248 1M530 87c90 8 184 6 370-1M606 211c110 17 171 8 294 2M641 399c104 5 153 18 259 37" fill="none" stroke="#d4d8cd" strokeWidth="2" />
        <path d="M302 34 L523 50 L541 115 L558 173 L579 232 L602 290 L624 346 L611 383 L590 423 L570 466 L537 514 L493 557 L440 578 L397 556 L371 514 L339 469 L306 421 L278 377 L256 333 L226 296 L231 254 L249 212 L256 170 L270 128 L284 86 Z" fill="#f8f7ef" stroke="#858d7d" strokeWidth="2.5" />
        <g clipPath="url(#california-clip)">
          <rect x="220" y="30" width="420" height="550" fill="url(#map-grain)" />
          <path d="M231 190l316-20M225 267l355-22M247 344l352-18M284 420l308-18M336 492l240-22M275 118l277 28M306 72l254 27M374 543l145-14M407 81l-8 446M480 92l-17 423" stroke="#c8cdbf" strokeWidth="1" fill="none" />
        </g>
        <path d="M248 214l75 11 67-7 69 21 86-2M232 291l89-18 69 18 93-14 114 12M265 365l87-22 68 16 97-9 91 11M318 445l80-25 72 20 73-18M360 511l85-25 72 11" fill="none" stroke="#d2cdbd" strokeWidth="1.6" />
        <path d="M279 153L519 365M252 261L496 498M311 91L575 290M297 385L503 169" stroke="#fcfcf8" strokeWidth="2" fill="none" />
        <text className="map-state-label" x="410" y="311">CALIFORNIA</text>
        <text className="map-city-label" x="381" y="92">SACRAMENTO</text><circle cx="377" cy="97" r="2.5" fill="#737b70" />
        <text className="map-city-label" x="449" y="414">FRESNO</text><circle cx="445" cy="409" r="2.5" fill="#737b70" />
        <text className="map-city-label" x="565" y="507">LOS ANGELES</text><circle cx="559" cy="501" r="2.5" fill="#737b70" />
        <text className="map-city-label" x="670" y="254">NEVADA</text><text className="map-city-label" x="84" y="310">PACIFIC OCEAN</text>
        <path d="M45 76v38m0-38l-7 12m7-12 7 12" stroke="#70786b" strokeWidth="1.5" /><text className="map-city-label" x="45" y="68" textAnchor="middle">N</text>
        <path d="M75 553h60m-60-4v8m60-8v8" stroke="#747b70" strokeWidth="2" /><text className="map-city-label" x="105" y="543" textAnchor="middle">100 km</text>
      </svg>
      {view === "HARMONIZED" && <div className="harmonized-wash" aria-hidden="true" />}
      {visible.map((observation, index) => {
        const isSelected = selectedObservation?.id === observation.id;
        return (
          <button
            className={`map-marker ${observation.sensor === "MODIS" ? "marker-modis" : "marker-viirs"}${view === "HARMONIZED" ? " marker-common" : ""}${isSelected ? " marker-selected" : ""}`}
            key={observation.id}
            style={{ left: `calc(20% + ${observation.x * 0.48}%)`, top: `${4 + observation.y * 0.91}%`, zIndex: isSelected ? 5 : 2 + index }}
            type="button"
            aria-label={`Select ${observation.sensor} fire near ${observation.lat}, ${observation.lon}, ${observation.frp} megawatts`}
            onClick={() => onSelect(observation)}
          >
            {view === "RAW" ? observation.sensor === "MODIS" ? <span className="marker-square" /> : <span className="marker-circle" /> : <span className="marker-harmonized-dot" />}
          </button>
        );
      })}
      <div className="map-attribution">STATIC DEMO · CALIFORNIA</div>
    </div>
  );
}

export default function DashboardPage() {
  const [view, setView] = useState<"RAW" | "HARMONIZED">("RAW");
  const [sensor, setSensor] = useState<"All" | Sensor>("All");
  const [confidence, setConfidence] = useState<Confidence>("All");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("All");
  const [fireType, setFireType] = useState<FireType>("All");
  const filters: DashboardFilters = { sensor, confidence, timeOfDay, fireType };
  const [aoi, setAoi] = useState("California, USA");
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 2, 18));
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [methodsOpen, setMethodsOpen] = useState(false);
  const year = "2025";
  const formattedDate = dayLabel(selectedDate);
  const selectedDay = dailyActivity(selectedDate, filters);
  const isReferenceDay = dateKey(selectedDate) === "2025-03-18";
  const filteredObservations = observations.filter((item) => {
    const latitude = Number(item.lat);
    const inArea = aoi === "Northern California" ? latitude >= 39 : aoi === "Central California" ? latitude >= 36 && latitude < 39 : aoi === "Southern California" ? latitude < 36 : true;
    return inArea && (sensor === "All" || item.sensor === sensor)
      && (confidence === "All" || item.confidenceLevel === confidence)
      && (timeOfDay === "All" || item.timeOfDay === timeOfDay)
      && (fireType === "All" || item.fireTypeCategory === fireType);
  });
  const areaTotal = aoi === "Northern California" ? 6200 : aoi === "Central California" ? 4150 : aoi === "Southern California" ? 2496 : 12846;
  const observationTotal = Math.round(areaTotal * (sensor === "MODIS" ? 0.328 : sensor === "VIIRS" ? 0.672 : 1) * (confidence === "All" ? 1 : confidence === "High" ? 0.43 : confidence === "Nominal" ? 0.48 : 0.09) * (timeOfDay === "All" ? 1 : timeOfDay === "Day" ? 0.72 : 0.28) * (fireType === "All" ? 1 : fireType === "Vegetation" ? 0.91 : fireType === "Volcano" ? 0.035 : fireType === "Static" ? 0.035 : 0.02));
  const peakFrp = selectedDay.frp.toLocaleString();
  const dominantSensor = filteredObservations.filter((item) => item.sensor === "VIIRS").length >= filteredObservations.filter((item) => item.sensor === "MODIS").length ? "VIIRS" : "MODIS";
  const modisShare = filteredObservations.length ? Math.round(filteredObservations.filter((item) => item.sensor === "MODIS").length / filteredObservations.length * 100) : 0;
  const viirsShare = 100 - modisShare;
  const confidenceSummary = confidence === "All" ? "Mixed" : confidence;
  const frpMonthDays = new Date(2025, selectedDate.getMonth() + 1, 0).getDate();

  function selectObservation(observation: Observation) {
    setSelectedObservation(observation);
    setSelectedDate(new Date(2025, 2, 18));
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-brand"><Link href="/" className="brand-mark" aria-label="Fire Harmonize home"><span /></Link><Link href="/" className="brand-name">Fire Harmonize</Link><span className="brand-divider" /><span className="brand-subtitle">MODIS × VIIRS ACTIVE FIRE</span></div>
        <nav className="dashboard-nav" aria-label="Main navigation"><a className="nav-active" href="/dashboard">Dashboard</a><button className="nav-methods" type="button" onClick={() => setMethodsOpen(true)}>Methods &amp; Provenance</button></nav>
        <div className="demo-status"><span className="demo-status-dot" />NASA DATA <i /> DEMO MODE</div>
      </header>

      <div className="dashboard-content">
        <section className="dashboard-intro"><div><div className="eyebrow"><span>FIRE ACTIVITY MONITOR</span><span className="eyebrow-divider" />UNITED STATES</div><h1>Active fire observations</h1><p>Explore sensor observations, harmonized activity, and seasonal context.</p></div><div className="data-stamp"><span>DATASET</span><strong>STATIC DEMO</strong><small>Illustrative · 2025</small></div></section>

        <section className="control-bar" aria-label="Dashboard controls">
          <label className="control-field control-aoi"><span>AREA OF INTEREST</span><span className="control-input"><MapPin aria-hidden="true" /><select value={aoi} onChange={(event) => setAoi(event.target.value)} aria-label="Area of interest"><option>California, USA</option><option>Northern California</option><option>Central California</option><option>Southern California</option></select><ChevronDown className="select-chevron" aria-hidden="true" /></span></label>
          <div className="control-field control-year"><span>TIME</span><div className="control-input control-static"><CalendarDays aria-hidden="true" /><span>2025</span></div></div>
          <div className="control-field control-range"><span>DATE RANGE</span><div className="control-readonly">01 Jan {year} <span>—</span> 31 Dec {year}</div></div>
          <fieldset className="control-field control-sensor"><legend>SENSOR</legend><div className="segmented-control" role="group" aria-label="Sensor filter">{(["All", "MODIS", "VIIRS"] as const).map((option) => <button aria-pressed={sensor === option} className={sensor === option ? "segment-active" : ""} key={option} onClick={() => { setSensor(option); setSelectedObservation(null); }} type="button">{option}</button>)}</div></fieldset>
          <fieldset className="control-field control-view"><legend>VIEW</legend><div className="view-control" role="group" aria-label="Map representation"><button aria-pressed={view === "RAW"} className={view === "RAW" ? "view-active" : ""} onClick={() => setView("RAW")} type="button">RAW</button><button aria-pressed={view === "HARMONIZED"} className={view === "HARMONIZED" ? "view-active" : ""} onClick={() => setView("HARMONIZED")} type="button">HARMONIZED</button></div></fieldset>
        </section>

        <section className="filter-bar" aria-label="Observation filters">
          <label className="filter-select"><span>CONFIDENCE</span><select value={confidence} onChange={(event) => { setConfidence(event.target.value as Confidence); setSelectedObservation(null); }}><option>All</option><option>High</option><option>Nominal</option><option>Low</option></select><ChevronDown aria-hidden="true" /></label>
          <label className="filter-select"><span>TIME OF DAY</span><select value={timeOfDay} onChange={(event) => { setTimeOfDay(event.target.value as TimeOfDay); setSelectedObservation(null); }}><option>All</option><option>Day</option><option>Night</option></select><ChevronDown aria-hidden="true" /></label>
          <label className="filter-select"><span>FIRE TYPE</span><select value={fireType} onChange={(event) => { setFireType(event.target.value as FireType); setSelectedObservation(null); }}><option>All</option><option>Vegetation</option><option>Volcano</option><option>Static</option><option>Offshore</option></select><ChevronDown aria-hidden="true" /></label>
          <span className="filter-state">{filteredObservations.length} matching demo observations</span>
        </section>

        <section className="sensor-comparison panel" aria-label="Complementary sensor observations">
          <div className="sensor-compare-intro"><span className="section-kicker">COMPLEMENTARY OBSERVATIONS</span><h2>Two sensors, one clearer picture</h2></div>
          <div className="sensor-compare-item modis-compare"><span>MODIS</span><strong>~1 km</strong><small>Terra / Aqua · long historical record</small><small>FRP · confidence</small></div>
          <span className="sensor-compare-plus" aria-hidden="true">+</span>
          <div className="sensor-compare-item viirs-compare"><span>VIIRS</span><strong>~375 m</strong><small>Suomi NPP / NOAA-20 / NOAA-21</small><small>Higher spatial detail · FRP · confidence</small></div>
          <span className="sensor-compare-arrow" aria-hidden="true">→</span>
          <div className="sensor-compare-result"><span>HARMONIZED ACTIVITY</span><small>A shared signal for comparison</small></div>
        </section>

        <section className="metrics-row" aria-label="Activity summary">
          <article className="metric"><span>{view === "RAW" ? "RAW OBSERVATIONS" : "HARMONIZED ACTIVITY"} <Info aria-label="Static demo summary for the selected filters" /></span><strong>{view === "RAW" ? observationTotal.toLocaleString() : selectedDay.activity.toLocaleString()}</strong><small>{view === "RAW" ? `MODIS ${Math.round(observationTotal * 0.328).toLocaleString()} · VIIRS ${Math.round(observationTotal * 0.672).toLocaleString()}` : `Unified index · ${aoi}`}</small></article>
          <article className="metric"><span>PEAK FRP <Info aria-label="Peak fire radiative power in megawatts" /></span><strong>{peakFrp}<em> MW</em></strong><small>Selected period · {formattedDate}</small></article>
          <article className="metric"><span>SELECTED DATE <Info aria-label="Selected calendar date" /></span><strong className="metric-date">{String(selectedDate.getDate()).padStart(2, "0")} {monthNames[selectedDate.getMonth()]} <small>2025</small></strong><small>Static demo period</small></article>
          <article className="metric metric-anomaly"><span>SELECTED ANOMALY <Info aria-label="Difference from the historical seasonal baseline" /></span><strong>{selectedDay.anomaly > 0 ? "+" : ""}{selectedDay.anomaly}<em>%</em></strong><small>{isReferenceDay ? "Above seasonal baseline" : "Selected day vs baseline"}</small></article>
        </section>

        <section className="map-summary-grid">
          <article className="panel map-panel">
            <div className="panel-heading map-heading"><div><span className="section-kicker">GEOGRAPHIC DISTRIBUTION</span><h2>California active fires</h2><p>{aoi} <span>·</span> {view === "RAW" ? "Separate detections retain sensor identity." : "Unified visual demo; not a computed data product."}</p></div><div className="map-tools"><button type="button" aria-label="Map layer controls" title="Map layer controls"><Layers2 /></button><button type="button" aria-label="Center map on California" title="Center map on California"><Crosshair /></button></div></div>
            <div className="map-legend"><span><i className="legend-modis" />MODIS</span><span><i className="legend-viirs" />VIIRS</span><span><i className="legend-harmonized" />Harmonized activity</span><span><i className="legend-selected" />Selected observation</span><span className="map-count">{filteredObservations.length} SHOWN</span></div>
            <CaliforniaMap view={view} filters={filters} aoi={aoi} selectedObservation={selectedObservation} onSelect={selectObservation} />
            {selectedObservation ? <div className="observation-info"><div className="observation-info-top"><div><span className={`sensor-chip ${selectedObservation.sensor.toLowerCase()}`}>{selectedObservation.sensor}</span><span className="observation-satellite">{selectedObservation.satellite} · {selectedObservation.date}</span></div><button aria-label="Close observation details" type="button" onClick={() => setSelectedObservation(null)}><X /></button></div><div className="observation-data"><span><small>ACQUISITION DATE</small>{selectedObservation.date}</span><span><small>UTC TIME</small>{selectedObservation.time}</span><span><small>LATITUDE</small>{selectedObservation.lat}°</span><span><small>LONGITUDE</small>{selectedObservation.lon}°</span><span><small>FRP</small>{selectedObservation.frp.toLocaleString()} MW</span><span><small>CONFIDENCE</small>{selectedObservation.confidence}</span><span><small>BRIGHTNESS TEMP.</small>{selectedObservation.brightness} K</span><span><small>FIRE TYPE</small>{selectedObservation.fireType}</span><span><small>DAY / NIGHT</small>{selectedObservation.timeOfDay}</span></div></div> : <div className="map-caption"><span><i /> CLICK A MARKER TO INSPECT</span><span>STATIC OBSERVATIONS · NOT LIVE</span></div>}
          </article>
          <aside className="summary-rail">
            <article className="panel rail-period"><div className="rail-title"><div><span className="section-kicker">SELECTED PERIOD</span><h2>{formattedDate}</h2></div><CalendarDays /></div><div className="period-status"><i />{isReferenceDay ? "HIGH ACTIVITY" : selectedDay.activity > 50 ? "ELEVATED ACTIVITY" : "TYPICAL ACTIVITY"}</div><dl className="period-list"><div><dt>Observations</dt><dd>{selectedDay.observations.toLocaleString()}</dd></div><div><dt>Harmonized activity</dt><dd>{selectedDay.activity} <small>/ 100</small></dd></div><div><dt>Mean / peak FRP</dt><dd>{selectedDay.meanFrp} / {selectedDay.frp.toLocaleString()} <small>MW</small></dd></div><div><dt>Historical difference</dt><dd className="difference">{selectedDay.anomaly > 0 ? "+" : ""}{selectedDay.anomaly}%</dd></div><div><dt>Dominant sensor</dt><dd>{dominantSensor}</dd></div><div><dt>Confidence</dt><dd>{confidenceSummary}</dd></div></dl><div className="rail-note"><span>DEMO PERIOD SUMMARY</span><p>Static values illustrate how selected dates connect across map and analysis views.</p></div></article>
            <article className="panel sensor-coverage"><div className="sensor-coverage-head"><span className="section-kicker">SENSOR MIX</span><SlidersHorizontal /></div><div className="coverage-line"><div><span className="coverage-square" />MODIS</div><strong>{modisShare}%</strong></div><div className="coverage-track"><i className="coverage-modis" style={{ width: `${modisShare}%` }} /></div><div className="coverage-line"><div><span className="coverage-circle" />VIIRS</div><strong>{viirsShare}%</strong></div><div className="coverage-track"><i className="coverage-viirs" style={{ width: `${viirsShare}%` }} /></div><p>Share of currently visible observations</p></article>
            <article className="panel insight-panel"><span className="section-kicker">{Math.abs(selectedDay.anomaly) >= 20 ? "UNUSUAL ACTIVITY" : "ACTIVITY INSIGHT"}</span><strong className="insight-date">{formattedDate}</strong><b>{selectedDay.anomaly > 0 ? "+" : ""}{selectedDay.anomaly}%</b><p>{selectedDay.anomaly >= 0 ? "Above" : "Below"} historical seasonal baseline</p><div><span>Peak FRP <strong>{peakFrp} MW</strong></span><span>Observations <strong>{selectedDay.observations.toLocaleString()}</strong></span><span>Dominant sensor <strong>{dominantSensor}</strong></span><span>Confidence <strong>{confidenceSummary}</strong></span></div></article>
          </aside>
        </section>

        <section className="panel calendar-panel"><div className="panel-heading calendar-heading"><div><span className="section-kicker">DAILY OBSERVATION DENSITY</span><h2>Burning Activity — {year}</h2><p>Seasonal patterns across the selected area <span>·</span> Select a day to update the period summary</p></div><span className="calendar-unit"><Activity />{view === "RAW" ? "RAW OBSERVATIONS" : "HARMONIZED ACTIVITY"}</span></div><CalendarHeatmap selectedDate={selectedDate} filters={filters} view={view} onSelect={(date) => { setSelectedDate(date); setSelectedObservation(null); }} /><div className="calendar-foot"><span>365 DAYS · STATIC DEMO DATA</span><span>{view === "RAW" ? "MODIS + VIIRS observations" : "Unified activity index"}</span></div></section>

        <section className="analysis-section"><div className="analysis-intro"><div><span className="section-kicker">SEASONAL CONTEXT</span><h2>Patterns &amp; anomalies</h2></div><span className="analysis-demo"><span />DEMO DATA</span></div><div className="analysis-grid">
          <article className="panel chart-panel"><div className="panel-heading chart-heading"><div><span className="section-kicker">HISTORICAL COMPARISON</span><h3>Burning Activity vs Historical Seasonal Baseline</h3><p>Monthly activity index · selected period highlighted</p></div><button className="chart-menu" type="button" title="Chart information"><Info /></button></div><div className="chart-legend"><span><i className="legend-line observed-line" />{view === "RAW" ? "RAW OBSERVATIONS" : "HARMONIZED ACTIVITY"}</span><span><i className="legend-line baseline-line" />SEASONAL BASELINE</span><span><i className="legend-range" />EXPECTED RANGE</span><span><i className="legend-anomaly" />ANOMALY</span></div><SeasonalChart selectedDate={selectedDate} activity={selectedDay.activity} anomaly={selectedDay.anomaly} view={view} /><div className="anomaly-callout"><span className="anomaly-date"><MapPin />{dayLabel(selectedDate).toUpperCase()}</span><strong>{selectedDay.anomaly > 0 ? "+" : ""}{selectedDay.anomaly}%</strong><span>{selectedDay.anomaly >= 0 ? "above" : "below"} historical seasonal baseline</span></div></article>
          <article className="panel chart-panel"><div className="panel-heading chart-heading"><div><span className="section-kicker">THERMAL INTENSITY</span><h3>Fire Radiative Power Over Time</h3><p>Daily peak fire radiative power · {monthNames[selectedDate.getMonth()]} 2025 · selected date highlighted</p></div><button className="chart-menu" type="button" title="Chart information"><Info /></button></div><div className="frp-chart-label">FRP <small>(MW)</small></div><FrpChart selectedDate={selectedDate} filters={filters} /><div className="chart-footer"><span>01 {monthNames[selectedDate.getMonth()].toUpperCase()} 2025</span><span>PEAK <strong>{Math.max(...Array.from({ length: frpMonthDays }, (_, index) => dailyActivity(new Date(2025, selectedDate.getMonth(), index + 1), filters).frp)).toLocaleString()} MW</strong></span><span>{String(frpMonthDays).padStart(2, "0")} {monthNames[selectedDate.getMonth()].toUpperCase()} 2025</span></div></article>
        </div></section>

        <footer className="dashboard-footer"><span><Satellite />FIRE HARMONIZE <i /> STATIC FRONTEND PROTOTYPE</span><span>NO NASA API CONNECTION · VALUES FOR DEMONSTRATION ONLY</span></footer>
      </div>
      {methodsOpen && <div className="methods-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setMethodsOpen(false); }}><section className="methods-dialog" role="dialog" aria-modal="true" aria-labelledby="methods-title"><div className="methods-header"><div><span className="section-kicker">TRANSPARENT BY DESIGN</span><h2 id="methods-title">Methods &amp; Provenance</h2></div><button aria-label="Close methods and provenance" type="button" onClick={() => setMethodsOpen(false)}><X /></button></div><p className="methods-prototype-label">PROTOTYPE PROCESSING FRAMEWORK · NOT AN EXECUTED PIPELINE</p><div className="methods-sources"><div><span>DATA SOURCES</span><strong>NASA MODIS Active Fire</strong><small>~1 km · Terra / Aqua</small></div><div><span>DATA SOURCES</span><strong>NASA VIIRS 375m Active Fire</strong><small>375 m · Suomi NPP / NOAA-20 / NOAA-21</small></div></div><div className="methods-flow"><span>NASA Active Fire Observations</span><i>↓</i><span>Quality / confidence filtering</span><i>↓</i><span>Spatial + temporal alignment</span><i>↓</i><span>Sensor-aware normalization</span><i>↓</i><span>Harmonized activity signal</span><i>↓</i><span>Historical seasonal baseline</span><i>↓</i><span>Anomaly analysis</span></div><div className="provenance-section"><h3>Observation provenance shown in this demo</h3><dl><div><dt>Sensor</dt><dd>MODIS or VIIRS</dd></div><div><dt>Satellite / platform</dt><dd>Terra, Aqua, Suomi NPP, NOAA-20, NOAA-21</dd></div><div><dt>Spatial resolution</dt><dd>~1 km MODIS · 375 m VIIRS</dd></div><div><dt>Acquisition time</dt><dd>Static UTC timestamp in observation inspector</dd></div><div><dt>FRP and confidence</dt><dd>Illustrative demo values</dd></div><div><dt>Data source</dt><dd>NASA Active Fire product names; no live connection</dd></div><div><dt>Status</dt><dd>Static frontend prototype · no processing executed</dd></div></dl></div><p className="methods-note">The framework describes a future analysis structure only. No specific harmonization algorithm is implemented here.</p></section></div>}
    </main>
  );
}