import { ArrowRight, CalendarDays, Satellite, SlidersHorizontal, Timer, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-lowest text-ink selection:bg-orange-soft selection:text-orange-deep">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line/50 bg-surface-lowest/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-6 lg:px-10">
          <a className="group flex items-center gap-2 text-heading font-semibold" href="#overview">
            <span className="size-2 rounded-full bg-orange transition-transform duration-200 group-hover:scale-125" />
            Fire Harmonize
          </a>
          <Button
            render={<a href="/dashboard" />}
            className="h-9 rounded-sm bg-orange px-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-white shadow-sm hover:bg-orange-deep"
          >
            Dashboard <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </header>

      <main id="overview" className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center my-10 px-4 pb-8 pt-20 md:px-6 lg:px-10 lg:py-10">
        <div className="grid w-full grid-cols-1 items-stretch gap-5 lg:grid-cols-12 lg:gap-6">
          <section className="flex flex-col gap-5 lg:col-span-7">
            <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-lg bg-white p-5 shadow-sm md:p-7 lg:p-10">
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-orange-soft/60 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-orange-deep">
                    <span className="size-1.5 animate-pulse rounded-full bg-orange" />
                    NASA Space Apps Challenge 2026
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">EO-SENS-HARMONIC // 01</span>
                </div>
                <h1 className="mt-2 max-w-xl text-[30px] font-semibold leading-[1.15] tracking-[-0.025em] text-ink md:text-[40px] md:leading-[1.2]">
                  A Clearer Picture of Earth&apos;s Burning Activity
                </h1>
                <p className="mt-2 max-w-xl text-[15px] leading-7 text-ink-muted md:text-base">
                  A prototype for comparing MODIS&apos;s long historical record with VIIRS&apos;s finer spatial detail. Explore static sample observations, a harmonized activity view, and seasonal context.
                </p>
              </div>
              <div className="relative z-10 mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line/70 pt-5">
                <Button
                  render={<a href="/dashboard" />}
                  className="h-10 gap-2 rounded-sm bg-orange px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-deep"
                >
                  Explore Fire Activity <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-1" />
                </Button>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.04em] text-ink-muted">
                  <span className="flex items-center gap-1.5"><Satellite className="size-4 text-orange" />TERRA · AQUA · S-NPP · NOAA-20</span>
                  <span className="hidden items-center gap-1.5 sm:flex"><Waypoints className="size-4 text-amber" />24-YR TIME-SERIES</span>
                </div>
              </div>
              <svg aria-hidden="true" className="pointer-events-none absolute -bottom-12 -right-12 size-64 text-orange-soft/40" fill="none" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="40" stroke="currentColor" strokeDasharray="2 4" strokeWidth="1.2" />
                <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="100" cy="100" r="100" stroke="currentColor" strokeDasharray="4 6" strokeWidth="1.2" />
                <circle cx="100" cy="100" r="130" stroke="currentColor" strokeWidth="1.2" />
                <path d="M100 0v200M0 100h200" stroke="currentColor" strokeWidth=".8" />
              </svg>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <SensorCard
                regime="Sensor Regime A"
                title="MODIS Baseline"
                badge="Long record"
                resolution="1,000m"
                resolutionLabel="Pixel Resolution"
                period="2000 – Present"
                satellite="TERRA / AQUA"
                accent="amber"
                barWidth="100%"
              />
              <SensorCard
                regime="Sensor Regime B"
                title="VIIRS Detail"
                badge="Finer detail"
                resolution="375m"
                resolutionLabel="I-Band Spatial"
                period="2012 – Present"
                satellite="S-NPP / JPSS"
                accent="orange"
                barWidth="37.5%"
              />
            </div>
          </section>

          <section className="flex min-h-[540px] flex-col rounded-lg bg-white p-4 shadow-sm md:p-5 lg:col-span-5">
            <div className="flex items-center justify-between gap-3 pb-3">
              <div className="flex min-w-0 flex-col">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">Static concept preview</span>
                <h2 className="text-base font-semibold text-ink">Complementary fire observations</h2>
              </div>
              <span className="size-2.5 shrink-0 rounded-full bg-orange ring-4 ring-orange-soft/60" />
            </div>
            <div className="telemetry-scene relative my-1 flex min-h-[390px] flex-1 items-center justify-center overflow-hidden rounded-md bg-surface-low md:min-h-[440px]">
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(17,28,45,.12),transparent_45%),url('https://lh3.googleusercontent.com/aida-public/AB6AXuBl8YSs2ZEjLwiNsJ91YZTqfiGLKr5zsJaoYSMwm-Ou_7NLgswnc33mwAtGUKebZaXadOlUPKMUY7b02iVEfMaAdfWZwqns-UL3H3fTvg_CqETnveFzulkKXYwAA66-6Rkhyk2O-m5ohHa0n7NH9X0XbdxehZnAdWgHei8I2t0s_aCs6d4_ZzwhW9XNllRl_THRY4eBzxAq1R_vlmftCi8-D1HeDBEBl-nA2CMRhooQQ2UCgpLAFsoikg')] bg-cover bg-center transition-transform duration-500 ease-out hover:scale-[1.02]" role="img" aria-label="Satellite visualization of global fire activity" />
              <div className="absolute left-3 top-3 rounded bg-white/90 px-2 py-1 shadow-sm backdrop-blur-sm">
                <span className="font-mono text-[10px] text-ink">GRID [0.01° × 0.01°]</span>
              </div>
              <div className="absolute right-3 top-3 rounded bg-white/90 px-2 py-1 shadow-sm backdrop-blur-sm">
                <span className="font-mono text-[10px] font-medium text-orange-deep">STATIC DEMO</span>
              </div>
              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded bg-white/95 p-2.5 shadow-sm backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-ink">
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-amber" />MODIS 1KM</span>
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-red" />VIIRS 375M</span>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-ink-muted">SCHEMATIC VIEW</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
              <p className="max-w-xs text-xs leading-5 text-ink-muted">Illustrative preview only; no live NASA data or processing is connected.</p>
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-orange-deep"><SlidersHorizontal className="size-3.5" />Prototype</span>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full border-t border-line/60 bg-white py-4">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-2 px-4 md:flex-row md:px-6 lg:px-10">
          <p className="text-center font-mono text-[10px] text-ink-muted md:text-left">Fire Harmonize · static frontend prototype</p>
          <p className="font-mono text-[10px] text-ink-muted">NO LIVE DATA CONNECTION · DEMONSTRATION ONLY</p>
        </div>
      </footer>
    </div>
  );
}

type SensorCardProps = {
  regime: string;
  title: string;
  badge: string;
  resolution: string;
  resolutionLabel: string;
  period: string;
  satellite: string;
  accent: "amber" | "orange";
  barWidth: string;
};

function SensorCard({ regime, title, badge, resolution, resolutionLabel, period, satellite, accent, barWidth }: SensorCardProps) {
  const isAmber = accent === "amber";

  return (
    <article className="flex flex-col justify-between rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`font-mono text-[10px] uppercase tracking-[0.08em] ${isAmber ? "text-amber-deep" : "text-orange-deep"}`}>{regime}</span>
          <h2 className="mt-0.5 text-lg font-semibold text-ink">{title}</h2>
        </div>
        <span className={`rounded px-1.5 py-1 font-mono text-[9px] font-medium uppercase ${isAmber ? "bg-amber-soft text-amber-deep" : "bg-orange-soft text-orange-deep"}`}>{badge}</span>
      </div>
      <div className="my-4">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className={`text-[32px] font-semibold leading-tight tracking-tight ${isAmber ? "text-amber-deep" : "text-orange"}`}>{resolution}</span>
          <span className="font-mono text-[9px] uppercase text-ink-muted">{resolutionLabel}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-high">
          <div className={`h-full rounded-full ${isAmber ? "bg-amber" : "bg-orange"}`} style={{ width: barWidth }} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-line/60 pt-3 font-mono text-[10px] text-ink-muted">
        <span className="flex items-center gap-1.5"><CalendarDays className={`size-3.5 ${isAmber ? "text-amber" : "text-orange"}`} />{period}</span>
        <span className="flex items-center gap-1.5"><Timer className="size-3.5" />{satellite}</span>
      </div>
    </article>
  );
}
