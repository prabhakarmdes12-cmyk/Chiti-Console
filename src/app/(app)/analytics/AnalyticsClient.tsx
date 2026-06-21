"use client";

import { useState, useMemo, useCallback } from "react";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiButton from "@/components/ui/ChitiButton";
import FadeIn from "@/components/motion/FadeIn";
import MonthlyRevenueChart from "@/components/charts/MonthlyRevenueChart";
import SourcePieChart from "@/components/charts/SourcePieChart";
import { Download, Save, Trash2, ChevronDown, RotateCcw, FileText, Printer } from "lucide-react";

interface MonthlyData { month: string; revenue: number; orders: number }
interface SourceData { name: string; value: number; color: string }
interface GASource { source: string; sessions: number; pageViews: number }

interface AnalyticsClientProps {
  monthlyData: MonthlyData[];
  sourceData: SourceData[];
  revenue: number;
  orderCount: number;
  customerCount: number;
  avgOrder: number;
  gaSources: GASource[];
  orders: { createdAt: string; totalAmount: number; source: string }[];
}

type DatePreset = "7d" | "30d" | "90d" | "12m" | "all" | "custom";
interface SavedReport { id: string; name: string; preset: DatePreset; customStart?: string; customEnd?: string; createdAt: number }

const PRESETS: { label: string; value: DatePreset }[] = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "12 months", value: "12m" },
  { label: "All time", value: "all" },
];

function filterByPreset<T extends { createdAt: string }>(data: T[], preset: DatePreset, customStart?: string, customEnd?: string): T[] {
  if (preset === "all") return data;
  const now = Date.now();
  const ranges: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "12m": 365 };
  const ms = preset === "custom" && customStart && customEnd
    ? { start: new Date(customStart).getTime(), end: new Date(customEnd).getTime() + 86400000 }
    : { start: now - (ranges[preset] || 30) * 86400000, end: now };
  return data.filter((d) => {
    const t = new Date(d.createdAt).getTime();
    return t >= ms.start && t <= ms.end;
  });
}

function buildMonthlyMap(orders: { createdAt: string; totalAmount: number }[]): MonthlyData[] {
  const map: Record<string, MonthlyData> = {};
  for (const order of orders) {
    const d = new Date(order.createdAt);
    const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    if (!map[key]) map[key] = { month: key, revenue: 0, orders: 0 };
    map[key].revenue += Number(order.totalAmount);
    map[key].orders += 1;
  }
  return Object.values(map);
}

function buildSourceMap(orders: { source: string }[]): SourceData[] {
  const colors: Record<string, string> = { WHATSAPP: "#22c55e", MANUAL: "#f59e0b", WEB_CHECKOUT: "#6366f1", API: "#3b82f6" };
  const map: Record<string, number> = {};
  for (const order of orders) map[order.source] = (map[order.source] || 0) + 1;
  return Object.entries(map).map(([name, value]) => ({ name, value, color: colors[name] || "#888" }));
}

function toCSV(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  a.click(); URL.revokeObjectURL(url);
}

function loadSavedReports(): SavedReport[] {
  try { return JSON.parse(localStorage.getItem("chiti_saved_reports") || "[]"); } catch { return []; }
}

export default function AnalyticsClient({ monthlyData, sourceData, revenue, orderCount, customerCount, avgOrder, gaSources, orders }: AnalyticsClientProps) {
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [savedReports, setSavedReports] = useState<SavedReport[]>(loadSavedReports);
  const [showSaved, setShowSaved] = useState(false);
  const [reportName, setReportName] = useState("");

  const reset = useCallback(() => { setCustomStart(""); setCustomEnd(""); setPreset("30d"); }, []);

  const filteredOrders = useMemo(() => filterByPreset(orders, preset, customStart, customEnd), [orders, preset, customStart, customEnd]);
  const filteredMonthly = useMemo(() => buildMonthlyMap(filteredOrders), [filteredOrders]);
  const filteredSources = useMemo(() => buildSourceMap(filteredOrders), [filteredOrders]);

  const filteredRevenue = useMemo(() => filteredOrders.reduce((s, o) => s + Number(o.totalAmount), 0), [filteredOrders]);
  const filteredCount = filteredOrders.length;
  const filteredAvg = filteredCount > 0 ? filteredRevenue / filteredCount : 0;

  function handleSave() {
    const name = prompt("Report name:")?.trim();
    if (!name) return;
    const report: SavedReport = { id: crypto.randomUUID(), name, preset, customStart, customEnd, createdAt: Date.now() };
    const updated = [...savedReports, report];
    localStorage.setItem("chiti_saved_reports", JSON.stringify(updated));
    setSavedReports(updated);
  }

  function handleLoad(report: SavedReport) {
    setPreset(report.preset);
    setCustomStart(report.customStart || "");
    setCustomEnd(report.customEnd || "");
    setShowSaved(false);
  }

  function handleDelete(id: string) {
    const updated = savedReports.filter((r) => r.id !== id);
    localStorage.setItem("chiti_saved_reports", JSON.stringify(updated));
    setSavedReports(updated);
  }

  function exportRevenueCSV() {
    const csv = toCSV(["Month", "Revenue"], filteredMonthly.map((m) => [m.month, m.revenue]));
    downloadCSV(`revenue-${preset}.csv`, csv);
  }

  function exportSourcesCSV() {
    const total = filteredSources.reduce((s, d) => s + d.value, 0);
    const csv = toCSV(["Source", "Orders", "Percentage"], filteredSources.map((d) => [d.name, d.value, total > 0 ? ((d.value / total) * 100).toFixed(1) + "%" : "0%"]));
    downloadCSV(`sources-${preset}.csv`, csv);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => { setPreset(p.value); setCustomStart(""); setCustomEnd(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                preset === p.value && !customStart
                  ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/30"
                  : "bg-surface-2 text-text-muted border border-white/10 hover:border-white/20"
              }`}
            >
              {p.label}
            </button>
          ))}
          <div className="flex items-center gap-1 ml-1">
            <input type="date" value={customStart} onChange={(e) => { setPreset("custom"); setCustomStart(e.target.value); }} className="w-32 px-2 py-1.5 rounded-lg bg-surface-2 border border-white/10 text-text-main text-xs" />
            <span className="text-text-muted text-xs">-</span>
            <input type="date" value={customEnd} onChange={(e) => { setPreset("custom"); setCustomEnd(e.target.value); }} className="w-32 px-2 py-1.5 rounded-lg bg-surface-2 border border-white/10 text-text-main text-xs" />
          </div>
          {(preset !== "30d" || customStart) && (
            <button onClick={reset} className="p-1.5 rounded-lg text-text-muted hover:text-text-main transition-colors"><RotateCcw className="w-4 h-4" /></button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ChitiButton variant="secondary" size="sm" icon={<Save className="w-4 h-4" />} onClick={handleSave}>Save</ChitiButton>
          <div className="relative">
            <ChitiButton variant="secondary" size="sm" icon={<ChevronDown className="w-4 h-4" />} onClick={() => setShowSaved(!showSaved)}>Saved</ChitiButton>
            {showSaved && (
              <div className="absolute right-0 top-10 w-64 bg-surface-1 border border-white/10 rounded-xl p-3 shadow-2xl z-20 max-h-60 overflow-y-auto">
                {savedReports.length === 0 && <p className="text-xs text-text-muted text-center py-4">No saved reports</p>}
                {savedReports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <button onClick={() => handleLoad(r)} className="text-xs text-text-main hover:text-brand-primary text-left flex-1">
                      <p className="font-medium">{r.name}</p>
                      <p className="text-text-muted text-[10px]">{r.preset}{r.customStart ? ` (${r.customStart} - ${r.customEnd})` : ""}</p>
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="text-text-muted hover:text-error p-1"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <ChitiButton variant="secondary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>Print</ChitiButton>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `₹${filteredRevenue.toLocaleString("en-IN")}`, vs: `vs ₹${revenue.toLocaleString("en-IN")} all time` },
          { label: "Orders", value: filteredCount.toLocaleString(), vs: `vs ${orderCount.toLocaleString()} all time` },
          { label: "Customers", value: customerCount.toLocaleString(), vs: "all time total" },
          { label: "Avg. Order Value", value: `₹${filteredAvg.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, vs: `vs ₹${avgOrder.toLocaleString("en-IN", { maximumFractionDigits: 0 })} all time` },
        ].map((metric, i) => (
          <FadeIn key={metric.label} direction="up" delay={i * 0.05}>
            <ChitiCard glass hover>
              <p className="text-xs text-text-muted mb-1">{metric.label}</p>
              <p className="text-xl font-display font-bold text-text-main">{metric.value}</p>
              <p className="text-xs text-text-muted mt-1">{metric.vs}</p>
            </ChitiCard>
          </FadeIn>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FadeIn direction="up" delay={0.1}>
          <ChitiCard glass hover>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-text-muted">Monthly Revenue</h2>
              <button onClick={exportRevenueCSV} className="text-text-muted hover:text-brand-primary transition-colors p-1">
                <Download className="w-4 h-4" />
              </button>
            </div>
            <MonthlyRevenueChart data={filteredMonthly} />
          </ChitiCard>
        </FadeIn>
        <FadeIn direction="up" delay={0.15}>
          <ChitiCard glass hover>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-text-muted">Order Sources</h2>
              <button onClick={exportSourcesCSV} className="text-text-muted hover:text-brand-primary transition-colors p-1">
                <Download className="w-4 h-4" />
              </button>
            </div>
            <SourcePieChart data={filteredSources} />
          </ChitiCard>
        </FadeIn>
      </div>

      {gaSources.length > 0 && (
        <FadeIn direction="up" delay={0.2}>
          <ChitiCard glass hover>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-text-muted">Traffic Sources (GA4)</h2>
              <button
                onClick={() => {
                  const csv = toCSV(["Source", "Sessions", "Page Views"], gaSources.map((s) => [s.source, s.sessions, s.pageViews]));
                  downloadCSV("ga-sources.csv", csv);
                }}
                className="text-text-muted hover:text-brand-primary transition-colors p-1"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {gaSources.slice(0, 6).map((src) => (
                <div key={src.source} className="bg-surface-2 rounded-lg p-3">
                  <p className="text-xs text-text-muted mb-1">{src.source}</p>
                  <p className="text-lg font-display font-bold text-text-main">{src.sessions}</p>
                  <p className="text-xs text-text-muted">{src.pageViews} page views</p>
                </div>
              ))}
            </div>
          </ChitiCard>
        </FadeIn>
      )}

      <FadeIn direction="up" delay={0.25}>
        <ChitiCard glass hover>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-text-muted">Detailed Orders</h2>
            <button
              onClick={() => {
                const csv = toCSV(["Date", "Amount", "Source"], filteredOrders.map((o) => [new Date(o.createdAt).toLocaleDateString("en-IN"), o.totalAmount, o.source]));
                downloadCSV(`orders-${preset}.csv`, csv);
              }}
              className="text-text-muted hover:text-brand-primary transition-colors p-1"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10 text-text-muted">
                <th className="text-left p-2 font-medium">Date</th>
                <th className="text-left p-2 font-medium">Amount</th>
                <th className="text-left p-2 font-medium">Source</th>
              </tr></thead>
              <tbody>
                {filteredOrders.length === 0 && (
                  <tr><td colSpan={3} className="p-8 text-center text-text-muted text-sm">No orders in this period</td></tr>
                )}
                {filteredOrders.slice(-50).reverse().map((o, i) => (
                  <tr key={i} className="border-b border-white/5"><td className="p-2 text-text-main">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="p-2 text-text-main">₹{Number(o.totalAmount).toLocaleString("en-IN")}</td>
                    <td className="p-2 text-text-muted">{o.source}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChitiCard>
      </FadeIn>
    </div>
  );
}
