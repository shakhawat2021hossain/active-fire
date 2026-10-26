"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Activity,
  CalendarDays,
  ChevronDown,
  Crosshair,
  FileText,
  Info,
  Layers2,
  MapPin,
  Satellite,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { AreaOfInterest } from "@/components/fire-map";
import { CalendarHeatmap, FrpChart, SeasonalChart } from "@/components/dashboard/dashboard-visualizations";
import ResponderBrief from "@/components/dashboard/responder-brief";
import {
  dailyActivity,
  dateKey,
  dayLabel,
  monthNames,
  observations,
  type Confidence,
  type DashboardFilters,
  type FireType,
  type Observation,
  type Sensor,
  type TimeOfDay,
} from "@/components/dashboard/dashboard-data";

const CaliforniaMap = dynamic(() => import("@/components/fire-map"), { ssr: false });

export default function DashboardPage() {
  const [view, setView] = useState<"RAW" | "HARMONIZED">("RAW");
  const [sensor, setSensor] = useState<"All" | Sensor>("All");
  const [confidence, setConfidence] = useState<Confidence>("All");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("All");
  const [fireType, setFireType] = useState<FireType>("All");
  const filters: DashboardFilters = { sensor, confidence, timeOfDay, fireType };
  const [aoi, setAoi] = useState<AreaOfInterest>("California, USA");
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 2, 18));
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [mapStyle, setMapStyle] = useState<"standard" | "light">("standard");
  const [mapRecenterKey, setMapRecenterKey] = useState(0);
  const [methodsOpen, setMethodsOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [demoState, setDemoState] = useState<"ready" | "loading" | "empty" | "unavailable">("ready");
  const briefTriggerRef = useRef<HTMLButtonElement>(null);
  const methodsTriggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!methodsOpen && !briefOpen) return;
    const dialog = document.querySelector<HTMLElement>("[role='dialog']");
    const focusable = dialog ? Array.from(dialog.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], select, [tabindex]:not([tabindex='-1'])")) : [];
    focusable[0]?.focus();
    function handleDialogKeys(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setBriefOpen(false);
        setMethodsOpen(false);
        window.requestAnimationFrame(() => (briefOpen ? briefTriggerRef.current : methodsTriggerRef.current)?.focus());
        return;
      }
      if (event.key !== "Tab" || focusable.length < 2) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleDialogKeys);
    return () => document.removeEventListener("keydown", handleDialogKeys);
  }, [briefOpen, methodsOpen]);
  const year = "2025";
  const formattedDate = dayLabel(selectedDate);
  const activeDay = dailyActivity(selectedDate, filters);
  const selectedDay = demoState === "empty" || demoState === "loading"
    ? { ...activeDay, observations: 0, activity: 0, meanFrp: 0, frp: 0, anomaly: 0 }
    : activeDay;
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
  const observationTotal = demoState === "empty" || demoState === "loading" ? 0 : Math.round(areaTotal * (sensor === "MODIS" ? 0.328 : sensor === "VIIRS" ? 0.672 : 1) * (confidence === "All" ? 1 : confidence === "High" ? 0.43 : confidence === "Nominal" ? 0.48 : 0.09) * (timeOfDay === "All" ? 1 : timeOfDay === "Day" ? 0.72 : 0.28) * (fireType === "All" ? 1 : fireType === "Vegetation" ? 0.91 : fireType === "Volcano" ? 0.035 : fireType === "Static" ? 0.035 : 0.02));
  const peakFrp = selectedDay.frp.toLocaleString();
  const dominantSensor = filteredObservations.filter((item) => item.sensor === "VIIRS").length >= filteredObservations.filter((item) => item.sensor === "MODIS").length ? "VIIRS" : "MODIS";
  const modisShare = filteredObservations.length ? Math.round(filteredObservations.filter((item) => item.sensor === "MODIS").length / filteredObservations.length * 100) : 0;
  const viirsShare = 100 - modisShare;
  const confidenceSummary = confidence === "All" ? "Mixed" : confidence;
  const frpMonthDays = new Date(2025, selectedDate.getMonth() + 1, 0).getDate();
  const demoStateLabels = {
    ready: "Prototype · Static Dataset",
    loading: "Loading active-fire observations…",
    empty: "No active-fire observations found for this period.",
    unavailable: "Data unavailable. Showing cached demonstration data.",
  };

  function selectObservation(observation: Observation) {
    setSelectedObservation(observation);
    setSelectedDate(new Date(2025, 2, 18));
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-brand"><Link href="/" className="brand-mark" aria-label="Ember Grid home"><span /></Link><Link href="/" className="brand-name">Ember Grid</Link><span className="brand-divider" /><span className="brand-subtitle">MODIS × VIIRS ACTIVE FIRE</span></div>
        <nav className="dashboard-nav" aria-label="Main navigation"><a className="nav-active" href="/dashboard">Dashboard</a><button ref={methodsTriggerRef} className="nav-methods" type="button" onClick={() => setMethodsOpen(true)}>Methods &amp; Provenance</button></nav>
        <div className="demo-status"><span className="demo-status-dot" />NASA DATA <i /> DEMO DATA</div>
      </header>

      <div className="dashboard-content">
        <section className="dashboard-intro"><div><div className="eyebrow"><span>FIRE ACTIVITY MONITOR</span><span className="eyebrow-divider" />UNITED STATES</div><h1>Active fire observations</h1><p>Explore sensor observations, harmonized activity, and seasonal context.</p></div><div className="data-stamp"><span>NASA EARTH OBSERVATION DATA</span><strong>DEMO DATA</strong><label htmlFor="demo-state">OBSERVATION STATUS</label><select id="demo-state" value={demoState} onChange={(event) => setDemoState(event.target.value as typeof demoState)}><option value="ready">Prototype · Static Dataset</option><option value="loading">Loading preview</option><option value="empty">No observations</option><option value="unavailable">Data unavailable</option></select></div></section>
        <section className="brief-launch-row"><div className="data-provenance-strip"><span>DATA &amp; PROVENANCE · NASA EARTH OBSERVATION DATA</span><p>MODIS Active Fire <span>·</span> VIIRS 375m Active Fire</p></div><button ref={briefTriggerRef} type="button" className="brief-launch" onClick={() => setBriefOpen(true)}><FileText aria-hidden="true" />Generate Responder Brief</button></section>

        <section className="control-bar" aria-label="Dashboard controls">
          <label className="control-field control-aoi"><span>AREA OF INTEREST</span><span className="control-input"><MapPin aria-hidden="true" /><select value={aoi} onChange={(event) => { setAoi(event.target.value as AreaOfInterest); setSelectedObservation(null); }} aria-label="Area of interest"><option>California, USA</option><option>Northern California</option><option>Central California</option><option>Southern California</option></select><ChevronDown className="select-chevron" aria-hidden="true" /></span></label>
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

        {/* <section className="sensor-comparison panel" aria-label="Complementary sensor observations">
          <div className="sensor-compare-intro"><span className="section-kicker">COMPLEMENTARY OBSERVATIONS</span><h2>Two sensors, one clearer picture</h2></div>
          <div className="sensor-compare-item modis-compare"><span>NASA MODIS ACTIVE FIRE</span><strong>~1 km</strong><small>Terra / Aqua · long historical record</small><small>Fire radiative power · confidence</small></div>
          <span className="sensor-compare-plus" aria-hidden="true">+</span>
          <div className="sensor-compare-item viirs-compare"><span>NASA VIIRS 375M ACTIVE FIRE</span><strong>~375 m</strong><small>Suomi NPP / NOAA-20 / NOAA-21</small><small>Higher spatial detail · fire radiative power · confidence</small></div>
          <span className="sensor-compare-arrow" aria-hidden="true">→</span>
          <div className="sensor-compare-result"><span>HARMONIZED ACTIVITY</span><small>A shared signal for comparison</small></div>
        </section> */}

        <section className="metrics-row" aria-label="Activity summary">
          <article className="metric"><span>{view === "RAW" ? "RAW OBSERVATIONS" : "HARMONIZED ACTIVITY"} <Info aria-label="Static demo summary for the selected filters" /></span><strong>{view === "RAW" ? observationTotal.toLocaleString() : selectedDay.activity.toLocaleString()}</strong><small>{view === "RAW" ? `MODIS ${Math.round(observationTotal * 0.328).toLocaleString()} · VIIRS ${Math.round(observationTotal * 0.672).toLocaleString()}` : `Unified index · ${aoi}`}</small></article>
          <article className="metric"><span>PEAK FRP <Info aria-label="Peak fire radiative power in megawatts" /></span><strong>{peakFrp}<em> MW</em></strong><small>Selected period · {formattedDate}</small></article>
          <article className="metric"><span>SELECTED DATE <Info aria-label="Selected calendar date" /></span><strong className="metric-date">{String(selectedDate.getDate()).padStart(2, "0")} {monthNames[selectedDate.getMonth()]} <small>2025</small></strong><small>Static demo period</small></article>
          <article className="metric metric-anomaly"><span>SELECTED ANOMALY <Info aria-label="Difference from the historical seasonal baseline" /></span><strong>{selectedDay.anomaly > 0 ? "+" : ""}{selectedDay.anomaly}<em>%</em></strong><small>{isReferenceDay ? "Above seasonal baseline" : "Selected day vs baseline"}</small></article>
        </section>

        <section className="map-summary-grid">
          <article className="panel map-panel">
            <div className="panel-heading map-heading"><div><span className="section-kicker">GEOGRAPHIC DISTRIBUTION</span><h2>California active fires</h2><p>{aoi} <span>·</span> {view === "RAW" ? "Separate detections retain sensor identity." : "Unified visual demo; not a computed data product."}</p></div><div className="map-tools"><button type="button" aria-label={`Switch to ${mapStyle === "standard" ? "light" : "standard"} map`} title={`Switch to ${mapStyle === "standard" ? "light" : "standard"} map`} onClick={() => setMapStyle((current) => current === "standard" ? "light" : "standard")}><Layers2 /></button><button type="button" aria-label="Center map on selected area" title="Center map on selected area" onClick={() => setMapRecenterKey((key) => key + 1)}><Crosshair /></button></div></div>
            {demoState !== "ready" && <div className={`data-state-message data-state-${demoState}`} role="status" aria-live="polite">{demoStateLabels[demoState]}</div>}
            <div className="map-legend"><span><i className="legend-modis" />MODIS · square</span><span><i className="legend-viirs" />VIIRS · circle</span><span><i className="legend-harmonized" />Harmonized activity</span><span><i className="legend-selected" />Selected observation</span><span className="map-count">{filteredObservations.length} SHOWN</span></div>
            <CaliforniaMap observations={demoState === "ready" ? filteredObservations : []} view={view} aoi={aoi} mapStyle={mapStyle} recenterKey={mapRecenterKey} selectedObservation={selectedObservation} onSelect={(observationId) => { const observation = observations.find((item) => item.id === observationId); if (observation) selectObservation(observation); }} />
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

        <footer className="dashboard-footer"><span><Satellite />Ember Grid <i /> STATIC FRONTEND PROTOTYPE</span><span>NO NASA API CONNECTION · VALUES FOR DEMONSTRATION ONLY</span></footer>
      </div>
      {methodsOpen && <div className="methods-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setMethodsOpen(false); }}><section className="methods-dialog" role="dialog" aria-modal="true" aria-labelledby="methods-title"><div className="methods-header"><div><span className="section-kicker">TRANSPARENT BY DESIGN</span><h2 id="methods-title">Methods &amp; Provenance</h2></div><button aria-label="Close methods and provenance" type="button" onClick={() => setMethodsOpen(false)}><X /></button></div><p className="methods-prototype-label">PROTOTYPE PROCESSING FRAMEWORK · NOT AN EXECUTED PIPELINE</p><div className="methods-sources"><div><span>NASA DATA SOURCE</span><strong>MODIS Active Fire</strong><small>~1 km · Terra / Aqua · long historical record</small></div><div><span>NASA DATA SOURCE</span><strong>VIIRS 375m Active Fire</strong><small>375 m · Suomi NPP / NOAA-20 / NOAA-21</small></div></div><div className="methods-flow"><div className="methods-sensor-step"><strong>MODIS</strong><span>~1 km · long historical record</span></div><div className="methods-sensor-step"><strong>VIIRS</strong><span>~375 m · higher spatial detail</span></div><i>↓</i><span>Sensor-aware harmonization</span><i>↓</i><span>Common burning-activity representation</span></div><div className="methods-detail-grid"><div><strong>Processing &amp; alignment</strong><span>A proposed workflow aligns observations across space and time before sensor-aware comparison; no processing runs in this demo.</span></div><div><strong>Confidence handling</strong><span>Source confidence is retained as context for interpreting observations, not presented as a guarantee.</span></div><div><strong>Historical baseline</strong><span>Seasonal activity is compared with a typical historical pattern; this prototype uses illustrative values.</span></div></div>
      </section>
      </div>
      }
      {briefOpen && <ResponderBrief date={formattedDate} observationsCount={selectedDay.observations} peakFrp={peakFrp} anomaly={selectedDay.anomaly} status={selectedDay.activity > 70 ? "High activity" : selectedDay.activity > 40 ? "Elevated activity" : "Typical activity"} dominantSensor={dominantSensor} confidence={confidenceSummary} aoi={aoi} observations={demoState === "ready" ? filteredObservations : []} view={view} mapStyle={mapStyle} recenterKey={mapRecenterKey} selectedObservation={selectedObservation} onSelectObservation={(observationId) => { const observation = observations.find((item) => item.id === observationId); if (observation) selectObservation(observation); }} onClose={() => setBriefOpen(false)} />}
    </main>
  );
}