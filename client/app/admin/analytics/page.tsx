"use client";

import { useEffect, useState } from "react";
import AnalyticsCard from "@/components/admin/AnalyticsCard";
import ClientOnlyChart from "@/components/admin/ClientOnlyChart";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/analytics", { credentials: "include" });
        const text = await res.text();
        let json: any = null;
        try {
          json = text ? JSON.parse(text) : null;
        } catch (parseErr) {
          console.warn("Failed to parse analytics response as JSON", parseErr, text.slice(0, 200));
        }
        if (!mounted) return;
        if (json && json.data) setData(json.data);
      } catch (err) {
        console.warn("Failed to load analytics", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // prepare chart data
  const days = data?.days || [];
  const series = data?.series || {};
  const totals = data?.totals || {};

  const lineData = days.map((d: string, i: number) => {
    const point: any = { day: d };
    Object.keys(series).forEach((k) => {
      point[k] = series[k][i] || 0;
    });
    return point;
  });

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Analytics</h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <AnalyticsCard title="Total Visitors" value={(totals.visitor || 0).toString()} />
        <AnalyticsCard title="Project Views" value={(totals.project_view || 0).toString()} />
        <AnalyticsCard title="CV Downloads" value={(totals.cv_download || 0).toString()} />
        <AnalyticsCard title="Contact Clicks" value={(totals.contact_click || 0).toString()} />
      </div>

      {loading && <div className="p-6">Loading analytics...</div>}

      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-xl font-semibold">Visitors (last 30 days)</h2>
            <ClientOnlyChart chartType="VisitorsChart" height={280} data={lineData} series={series} />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-xl font-semibold">Totals</h2>
            <ClientOnlyChart chartType="TotalsChart" height={280} totals={totals} />
          </div>
        </div>
      )}
    </div>
  );
}