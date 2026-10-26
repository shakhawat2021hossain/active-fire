"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Activity,
  CalendarDays,
  Download,
  FileDown,
  FileText,
  MapPin,
  Printer,
  Satellite,
} from "lucide-react";
import type { AreaOfInterest, FireMapObservation } from "@/components/fire-map";
import {
  dailyActivity,
  dateKey,
  dayLabel,
  monthNames,
  observations,
  type DashboardFilters,
  type Sensor,
} from "@/components/dashboard/dashboard-data";

const CaliforniaMap = dynamic(() => import("@/components/fire-map"), { ssr: false });
const REPORT_YEAR = 2025;
const REPORT_START = `${REPORT_YEAR}-01-01`;
const REPORT_END = `${REPORT_YEAR}-12-31`;
const regions: AreaOfInterest[] = [
  "California, USA",
  "Northern California",
  "Central California",
  "Southern California",
];

type ReportDay = ReturnType<typeof dailyActivity>;

function areaScale(aoi: AreaOfInterest) {
  if (aoi === "Northern California") return 0.48;
  if (aoi === "Central California") return 0.32;
  if (aoi === "Southern California") return 0.2;
  return 1;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function csvCell(value: string | number) {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function ActivityChart({ days }: { days: ReportDay[] }) {
  const points = useMemo(() => monthNames.map((month, monthIndex) => {
    const monthlyDays = days.filter((day) => day.date.getMonth() === monthIndex);
    const count = monthlyDays.reduce((total, day) => total + day.observations, 0);
    return { month, count, frp: monthlyDays.reduce((total, day) => total + day.frp, 0) };
  }), [days]);
  const maxValue = Math.max(1, ...points.map((point) => point.count));
  const coords = points.map((point, index) => ({
    ...point,
    x: 42 + index * 49,
    y: 174 - point.count / maxValue * 130,
  }));
  const line = coords.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const area = `${line} L${coords.at(-1)?.x ?? 42},180 L${coords[0]?.x ?? 42},180 Z`;

  return (
    <svg className="report-chart-svg" viewBox="0 0 630 220" role="img" aria-label="Monthly fire observation totals for the selected date range">
      {[0, 1, 2, 3].map((step) => {
        const y = 174 - step * 43;
        return <g key={step}><line x1="42" x2="603" y1={y} y2={y} className="report-chart-grid" /><text x="34" y={y + 3} textAnchor="end" className="report-chart-axis">{Math.round(maxValue * step / 3).toLocaleString()}</text></g>;
      })}
      <path d={area} className="report-chart-area" />
      <path d={line} className="report-chart-line" />
      {coords.map((point) => <g key={point.month}><circle cx={point.x} cy={point.y} r="3.5" className="report-chart-point"><title>{`${point.month}: ${point.count.toLocaleString()} observations · ${point.frp.toLocaleString()} MW FRP`}</title></circle><text x={point.x} y="201" textAnchor="middle" className="report-chart-axis">{point.month}</text></g>)}
    </svg>
  );
}

function FrpChart({ days }: { days: ReportDay[] }) {
  const monthly = monthNames.map((month, monthIndex) => {
    const subset = days.filter((day) => day.date.getMonth() === monthIndex);
    const total = subset.reduce((sum, day) => sum + day.frp, 0);
    return { month, value: subset.length ? total / subset.length : 0 };
  });
  const maxValue = Math.max(1, ...monthly.map(({ value }) => value));

  return (
    <div className="report-bars" role="img" aria-label="Average daily fire radiative power by month">
      {monthly.map(({ month, value }) => <div className="report-bar-column" key={month} title={`${month}: ${Math.round(value).toLocaleString()} MW average daily FRP`}><span className="report-bar-value">{value ? Math.round(value).toLocaleString() : ""}</span><div className="report-bar-track"><i style={{ height: `${Math.max(value ? 3 : 0, value / maxValue * 100)}%` }} /></div><span className="report-bar-month">{month}</span></div>)}
    </div>
  );
}

export default function ReportsPage() {
  const [aoi, setAoi] = useState<AreaOfInterest>("California, USA");
  const [startDate, setStartDate] = useState(REPORT_START);
  const [endDate, setEndDate] = useState(REPORT_END);
  const [satellite, setSatellite] = useState<"All" | Sensor>("All");
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 2, 18));
  const [selectedObservation, setSelectedObservation] = useState<FireMapObservation | null>(null);

  const filters: DashboardFilters = useMemo(() => ({ sensor: satellite, confidence: "All", timeOfDay: "All", fireType: "All" }), [satellite]);
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const days = useMemo(() => {
    const count = Math.round((new Date(`${endDate}T12:00:00`).getTime() - new Date(`${startDate}T12:00:00`).getTime()) / 86400000) + 1;
    return Array.from({ length: count }, (_, index) => {
      const date = new Date(`${startDate}T12:00:00`);
      date.setDate(date.getDate() + index);
      return dailyActivity(date, filters);
    });
  }, [endDate, filters, startDate]);
  const allYearDays = useMemo(() => Array.from({ length: 365 }, (_, index) => dailyActivity(new Date(REPORT_YEAR, 0, index + 1), filters)), [filters]);
  const scale = areaScale(aoi);
  const totalObservations = Math.round(days.reduce((total, day) => total + day.observations, 0) * scale);
  const totalFrp = Math.round(days.reduce((total, day) => total + day.frp, 0) * scale);
  const activeDays = days.filter((day) => day.observations > 0).length;
  const peakDay = days.reduce((peak, day) => day.frp > peak.frp ? day : peak, days[0]);
  const selectedDay = allYearDays.find((day) => day.key === dateKey(selectedDate));
  const meanActivity = days.length ? Math.round(days.reduce((total, day) => total + day.activity, 0) / days.length) : 0;
  const modisTotal = Math.round(days.reduce((total, day) => total + dailyActivity(day.date, { ...filters, sensor: "MODIS" }).observations, 0) * scale);
  const viirsTotal = Math.round(days.reduce((total, day) => total + dailyActivity(day.date, { ...filters, sensor: "VIIRS" }).observations, 0) * scale);
  const comparisonTotal = Math.max(1, modisTotal + viirsTotal);
  const modisPercent = Math.round(modisTotal / comparisonTotal * 100);
  const reportObservations = observations.filter((item) => {
    const latitude = Number(item.lat);
    const [dayOfMonth, month] = item.date.split(" ");
    const observationDate = `${REPORT_YEAR}-${String(monthNames.indexOf(month) + 1).padStart(2, "0")}-${dayOfMonth.padStart(2, "0")}`;
    const inRegion = aoi === "Northern California" ? latitude >= 39
      : aoi === "Central California" ? latitude >= 36 && latitude < 39
        : aoi === "Southern California" ? latitude < 36 : true;
    return inRegion
      && (satellite === "All" || item.sensor === satellite)
      && observationDate >= startDate
      && observationDate <= endDate;
  });
  const generatedAt = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  const peakLabel = peakDay ? formatDate(peakDay.date) : "No days in range";

  function downloadCsv() {
    const header = ["date", "area_of_interest", "satellite_filter", "fire_observations", "harmonized_activity_index", "fire_radiative_power_mw", "anomaly_percent"];
    const rows = days.map((day) => [
      dateKey(day.date),
      aoi,
      satellite,
      Math.round(day.observations * scale),
      day.activity,
      Math.round(day.frp * scale),
      day.anomaly,
    ]);
    const contents = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([contents], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ember-grid-report-${startDate}-to-${endDate}.csv`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function setStart(value: string) {
    if (!value) return;
    setStartDate(value);
    if (value > endDate) setEndDate(value);
  }

  function setEnd(value: string) {
    if (!value) return;
    setEndDate(value);
    if (value < startDate) setStartDate(value);
  }

  return (
    <main className="dashboard-shell reports-shell">
      <header className="dashboard-header report-header">
        <div className="dashboard-brand"><Link href="/" className="brand-mark" aria-label="Ember Grid home"><span /></Link><Link href="/" className="brand-name">Ember Grid</Link><span className="brand-divider" /><span className="brand-subtitle">MODIS × VIIRS ACTIVE FIRE</span></div>
        <nav className="dashboard-nav" aria-label="Main navigation"><Link href="/dashboard">Dashboard</Link><Link className="nav-active" aria-current="page" href="/dashboard/reports">Reports</Link></nav>
        <div className="demo-status"><span className="demo-status-dot" />NASA DATA <i /> DEMO DATA</div>
      </header>

      <div className="dashboard-content reports-content">
        <section className="dashboard-intro report-intro">
          <div><div className="eyebrow"><span>HARMONIZATION OF MODIS AND VIIRS HOT SPOTS</span><span className="eyebrow-divider" />REPORTS</div><h1>Fire activity report</h1><p>Explore seasonal fire activity and compare complementary satellite observations.</p></div>
          <div className="report-actions"><button type="button" onClick={downloadCsv}><Download aria-hidden="true" />Download CSV</button><button type="button" onClick={() => window.print()}><Printer aria-hidden="true" />Print / Save PDF</button></div>
        </section>

        <section className="report-filter-panel" aria-label="Report filters">
          <label className="filter-select"><span>AREA OF INTEREST</span><select value={aoi} onChange={(event) => { setAoi(event.target.value as AreaOfInterest); setSelectedObservation(null); }}>{regions.map((region) => <option key={region}>{region}</option>)}</select><MapPin aria-hidden="true" /></label>
          <label className="filter-select"><span>START DATE</span><input required type="date" min={REPORT_START} max={REPORT_END} value={startDate} onChange={(event) => setStart(event.target.value)} /></label>
          <label className="filter-select"><span>END DATE</span><input required type="date" min={startDate} max={REPORT_END} value={endDate} onChange={(event) => setEnd(event.target.value)} /></label>
          <fieldset className="report-satellite"><legend>SATELLITE</legend><div className="segmented-control" role="group" aria-label="Satellite filter">{(["All", "MODIS", "VIIRS"] as const).map((option) => <button aria-pressed={satellite === option} className={satellite === option ? "segment-active" : ""} key={option} onClick={() => { setSatellite(option); setSelectedObservation(null); }} type="button">{option}</button>)}</div></fieldset>
        </section>

        <div className="report-data-note" role="note"><Activity aria-hidden="true" /> Demonstration only: all counts, charts, and mapped fire detections use illustrative static data, not live NASA observations.</div>

        <section className="report-metrics" aria-label="Report summary statistics">
          <article className="report-metric"><span><Activity />FIRE OBSERVATIONS</span><strong>{totalObservations.toLocaleString()}</strong><small>{aoi} · selected period</small></article>
          <article className="report-metric"><span><CalendarDays />ACTIVE DAYS</span><strong>{activeDays.toLocaleString()}<em> / {days.length}</em></strong><small>Days with modeled detections</small></article>
          <article className="report-metric"><span><Satellite />TOTAL FRP</span><strong>{totalFrp.toLocaleString()}<em> MW</em></strong><small>Accumulated fire radiative power</small></article>
          <article className="report-metric"><span><Activity />MEAN ACTIVITY INDEX</span><strong>{meanActivity}<em> / 100</em></strong><small>Peak FRP day: {peakLabel}</small></article>
        </section>

        <section className="report-primary-grid">
          <article className="panel report-panel report-calendar-panel">
            <div className="panel-heading"><div><span className="section-kicker">DAILY ACTIVITY</span><h2>Fire activity calendar</h2><p>Intensity reflects the modeled harmonized activity index · select a day to inspect it</p></div><span className="report-calendar-year">{REPORT_YEAR}</span></div>
            <div className="report-month-labels" aria-hidden="true">{monthNames.map((month) => <span key={month}>{month}</span>)}</div>
            <div className="report-calendar-grid" role="group" aria-label="Fire activity calendar for 2025">
              {Array.from({ length: new Date(REPORT_YEAR, 0, 1).getDay() }, (_, index) => <span key={`pad-${index}`} aria-hidden="true" />)}
              {allYearDays.map((day) => {
                const inRange = day.key >= startDate && day.key <= endDate;
                const intensity = day.activity === 0 ? 0 : Math.min(5, Math.max(1, Math.ceil(day.activity / 20)));
                return <button key={day.key} type="button" disabled={!inRange} aria-pressed={dateKey(selectedDate) === day.key} aria-label={`${dayLabel(day.date)}: ${day.observations} modeled observations, activity index ${day.activity}${inRange ? "" : ", outside selected date range"}`} title={`${dayLabel(day.date)} · ${day.observations.toLocaleString()} observations · activity index ${day.activity}`} className={`calendar-day intensity-${intensity}${inRange ? "" : " report-day-outside"}${dateKey(selectedDate) === day.key ? " is-selected" : ""}`} onClick={() => setSelectedDate(day.date)} />;
              })}
            </div>
            <div className="calendar-legend"><span>Low</span>{[1, 2, 3, 4, 5].map((level) => <i className={`intensity-${level}`} key={level} />)}<span>High</span></div>
            <p className="report-selection-note" aria-live="polite">Selected calendar day: <strong>{formatDate(selectedDate)}</strong>{selectedDate < start || selectedDate > end ? " · outside selected date range" : selectedDay ? ` · ${selectedDay.observations.toLocaleString()} observations · activity ${selectedDay.activity}/100 · ${selectedDay.frp.toLocaleString()} MW FRP` : ""}</p>
          </article>

          <article className="panel report-panel report-comparison">
            <div className="panel-heading"><div><span className="section-kicker">SENSOR COMPARISON</span><h2>MODIS vs. VIIRS</h2><p>Modeled observation totals for the selected date range</p></div></div>
            <div className="comparison-stat"><div><span className="comparison-dot modis-dot" />MODIS <small>~1 km</small></div><strong>{modisTotal.toLocaleString()}</strong><div className="comparison-track"><i style={{ width: `${modisTotal / comparisonTotal * 100}%` }} /></div></div>
            <div className="comparison-stat"><div><span className="comparison-dot viirs-dot" />VIIRS <small>375 m</small></div><strong>{viirsTotal.toLocaleString()}</strong><div className="comparison-track viirs-track"><i style={{ width: `${viirsTotal / comparisonTotal * 100}%` }} /></div></div>
            <div className="comparison-takeaway"><span>COMPLEMENTARY COVERAGE</span><p>MODIS contributes {modisPercent}% and VIIRS {100 - modisPercent}% of the illustrative sensor totals. Different pixel sizes and overpass times mean detections are not one-to-one matches.</p></div>
          </article>
        </section>

        <section className="report-chart-section">
          <div className="analysis-intro"><div><span className="section-kicker">HISTORICAL CONTEXT</span><h2>Activity over time</h2></div><span className="analysis-demo"><span /> STATIC DEMO · 2025</span></div>
          <div className="analysis-grid">
            <article className="panel chart-panel report-panel"><div className="chart-heading"><span className="section-kicker">MONTHLY TREND</span><h3>Fire observations by month</h3><p>Daily observations aggregated across each month</p></div><ActivityChart days={days} /><div className="chart-footer"><span>AREA · {aoi.toUpperCase()}</span><strong>{satellite === "All" ? "MODIS + VIIRS" : satellite}</strong></div></article>
            <article className="panel chart-panel report-panel"><div className="chart-heading"><span className="section-kicker">FIRE INTENSITY</span><h3>Average daily fire radiative power</h3><p>Monthly FRP average · megawatts</p></div><FrpChart days={days} /><div className="chart-footer"><span>DATE RANGE · {startDate} — {endDate}</span><strong>MW / DAY</strong></div></article>
          </div>
        </section>

        <section className="report-map-grid">
          <article className="panel report-panel report-map-panel">
            <div className="panel-heading"><div><span className="section-kicker">GEOGRAPHIC DISTRIBUTION</span><h2>Fire detections across California</h2><p>{aoi} · {satellite === "All" ? "MODIS and VIIRS" : satellite} · static sample</p></div><span className="report-map-count">{reportObservations.length} SHOWN</span></div>
            <div className="map-legend"><span><i className="legend-modis" />MODIS · square</span><span><i className="legend-viirs" />VIIRS · circle</span></div>
            <CaliforniaMap observations={reportObservations} view="RAW" aoi={aoi} mapStyle="light" recenterKey={0} selectedObservation={selectedObservation} onSelect={(id) => setSelectedObservation(reportObservations.find((observation) => observation.id === id) ?? null)} />
            <p className="report-map-caption">Markers are a small illustrative sample centered on March 18, 2025—not geospatial output from the report totals.</p>
          </article>
          <aside className="panel report-panel report-insights">
            <span className="section-kicker">KEY INSIGHTS</span><h2>At a glance</h2>
            <div className="insight-item"><span>01</span><p><strong>{peakLabel}</strong> is the highest FRP day in the selected range, at {peakDay?.frp.toLocaleString() ?? 0} MW before area scaling.</p></div>
            <div className="insight-item"><span>02</span><p><strong>{activeDays} of {days.length} days</strong> show modeled fire observations for this selection.</p></div>
            <div className="insight-item"><span>03</span><p><strong>{satellite === "All" ? "Sensor totals differ by design." : `${satellite} filter active.`}</strong> Spatial resolution and overpass timing influence what each sensor detects.</p></div>
            <div className="insight-caveat">Insights summarize the prototype’s deterministic mock dataset; they should not be used for operational decisions.</div>
          </aside>
        </section>

        <section className="panel report-panel report-preview" id="report-preview">
          <div className="report-preview-heading"><div><span className="section-kicker">GENERATED DOCUMENT</span><h2>Report preview</h2><p>Harmonization of MODIS and VIIRS Hot Spots</p></div><div className="report-actions report-preview-actions"><button type="button" onClick={downloadCsv}><FileDown aria-hidden="true" />CSV data</button><button type="button" onClick={() => window.print()}><Printer aria-hidden="true" />Print / Save PDF</button></div></div>
          <div className="report-metadata">
            <div><span>AREA OF INTEREST</span><strong>{aoi}</strong></div><div><span>DATE RANGE</span><strong>{formatDate(start)} — {formatDate(end)}</strong></div><div><span>SATELLITE FILTER</span><strong>{satellite === "All" ? "MODIS + VIIRS" : satellite}</strong></div><div><span>GENERATED</span><strong>{generatedAt}</strong></div>
          </div>
          <div className="report-document-grid">
            <section><h3>Methodology</h3><p>Daily activity values are generated from a deterministic seasonal demonstration model. The selected satellite filter scales modeled observations; area-of-interest totals apply an illustrative regional factor. The comparison panel evaluates the two sensor filters separately. The map reuses a small set of static sample detections.</p></section>
            <section><h3>Limitations</h3><p>This prototype is not connected to NASA FIRMS or another live data service. Mock counts, FRP, anomalies, sensor shares, and map locations are not validated measurements. The example does not implement spatial/temporal pixel matching, uncertainty propagation, or a scientifically calibrated harmonization algorithm.</p></section>
          </div>
          <p className="report-document-footnote">Data status: illustrative static demonstration · Not for operational use</p>
        </section>

        <footer className="dashboard-footer"><span><FileText /> NASA EARTH OBSERVATION DATA · STATIC DEMONSTRATION REPORT</span><span>NO LIVE DATA CONNECTION · NOT FOR OPERATIONAL USE</span></footer>
      </div>
    </main>
  );
}
