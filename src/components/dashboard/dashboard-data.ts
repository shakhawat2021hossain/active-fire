export type Sensor = "MODIS" | "VIIRS";
export type Confidence = "All" | "High" | "Nominal" | "Low";
export type TimeOfDay = "All" | "Day" | "Night";
export type FireType = "All" | "Vegetation" | "Volcano" | "Static" | "Offshore";
export type DashboardFilters = {
  sensor: "All" | Sensor;
  confidence: Confidence;
  timeOfDay: TimeOfDay;
  fireType: FireType;
};

export type Observation = {
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

export const observations: Observation[] = observationRecords.map((observation, index) => ({
  ...observation,
  confidenceLevel: observation.confidence.startsWith("High") ? "High" : observation.confidence === "Low" ? "Low" : "Nominal",
  timeOfDay: [1, 5, 9, 13, 16].includes(index) ? "Night" : "Day",
  fireTypeCategory: observation.fireType === "Vegetation fire" ? "Vegetation" : observation.fireType as Exclude<FireType, "All">,
}));

export const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const dayOfYear = (date: Date) => Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);

export const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function dailyActivity(date: Date, filters?: DashboardFilters) {
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

export function dayLabel(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")} ${monthNames[date.getMonth()].toUpperCase()} ${date.getFullYear()}`;
}