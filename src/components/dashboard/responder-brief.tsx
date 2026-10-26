"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ClipboardCopy, Printer, X } from "lucide-react";
import type { AreaOfInterest, FireMapObservation } from "@/components/fire-map";

const CaliforniaMap = dynamic(() => import("@/components/fire-map"), { ssr: false });

type ResponderBriefProps = {
  date: string;
  observationsCount: number;
  peakFrp: string;
  anomaly: number;
  status: string;
  dominantSensor: string;
  confidence: string;
  aoi: AreaOfInterest;
  observations: FireMapObservation[];
  view: "RAW" | "HARMONIZED";
  mapStyle: "standard" | "light";
  recenterKey: number;
  selectedObservation: FireMapObservation | null;
  onSelectObservation: (observationId: string) => void;
  onClose: () => void;
};

export default function ResponderBrief({
  date,
  observationsCount,
  peakFrp,
  anomaly,
  status,
  dominantSensor,
  confidence,
  aoi,
  observations,
  view,
  mapStyle,
  recenterKey,
  selectedObservation,
  onSelectObservation,
  onClose,
}: ResponderBriefProps) {
  const [shareStatus, setShareStatus] = useState("");

  async function shareBrief() {
    const summary = `Fire Harmonize responder brief | ${aoi} | ${date} | ${observationsCount.toLocaleString()} observations | Peak FRP ${peakFrp} MW | ${anomaly > 0 ? "+" : ""}${anomaly}% vs seasonal baseline | ${status} | DEMO DATA`;
    try {
      await navigator.clipboard.writeText(summary);
      setShareStatus("Brief summary copied.");
    } catch {
      setShareStatus(summary);
    }
  }

  return (
    <div className="methods-backdrop brief-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="methods-dialog brief-dialog" role="dialog" aria-modal="true" aria-labelledby="brief-title">
        <div className="methods-header">
          <div><span className="section-kicker">FIELD SUMMARY · DEMONSTRATION</span><h2 id="brief-title">Responder Brief</h2></div>
          <button aria-label="Close responder brief" type="button" onClick={onClose}><X /></button>
        </div>
        <p className="brief-location">{aoi} <span>·</span> {date}</p>
        <div className="brief-map" aria-label={`Map of ${aoi} with filtered fire observations`}>
          <CaliforniaMap observations={observations} view={view} aoi={aoi} mapStyle={mapStyle} recenterKey={recenterKey} zoomOffset={-1} selectedObservation={selectedObservation} onSelect={onSelectObservation} />
        </div>
        <dl className="brief-metrics">
          <div><dt>Burning activity</dt><dd>{status}</dd></div>
          <div><dt>Observation count</dt><dd>{observationsCount.toLocaleString()}</dd></div>
          <div><dt>Peak FRP</dt><dd>{peakFrp} MW</dd></div>
          <div><dt>Historical baseline</dt><dd>{anomaly > 0 ? "+" : ""}{anomaly}% vs seasonal baseline</dd></div>
          <div><dt>Anomaly status</dt><dd>{Math.abs(anomaly) >= 20 ? "Unusual activity" : "Within typical range"}</dd></div>
          <div><dt>Dominant sensor</dt><dd>{dominantSensor}</dd></div>
          <div><dt>Confidence</dt><dd>{confidence}</dd></div>
        </dl>
        <div className="brief-attribution"><strong>NASA Earth Observation Data</strong><span>MODIS Active Fire · VIIRS 375m Active Fire</span><small>Product names identify intended sources; this brief uses illustrative static values, not live NASA data.</small></div>
        <div className="brief-actions">
          <button type="button" onClick={() => window.print()}><Printer />Export PDF</button>
          <button type="button" onClick={shareBrief}><ClipboardCopy />Share</button>
        </div>
        <p className="brief-prototype">Prototype · Static Dataset{shareStatus && <span role="status">{shareStatus}</span>}</p>
      </section>
    </div>
  );
}