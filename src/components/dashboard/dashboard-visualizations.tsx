import { useMemo } from "react";
import { dailyActivity, dateKey, dayLabel, dayOfYear, monthNames, type DashboardFilters } from "@/components/dashboard/dashboard-data";

type DashboardView = "RAW" | "HARMONIZED";

export function CalendarHeatmap({ selectedDate, onSelect, filters, view }: { selectedDate: Date; onSelect: (date: Date) => void; filters: DashboardFilters; view: DashboardView }) {
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

export function SeasonalChart({ selectedDate, activity, anomaly, view }: { selectedDate: Date; activity: number; anomaly: number; view: DashboardView }) {
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

export function FrpChart({ selectedDate, filters }: { selectedDate: Date; filters: DashboardFilters }) {
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