"use client";

import { useEffect, useState } from "react";
import AnalyticsCard from "@/components/admin/AnalyticsCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/analytics", { credentials: "include" });
        const json = await res.json();
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
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={lineData}>
                  <CartesianGrid stroke="#111827" />
                  <XAxis dataKey="day" tick={{ fill: "#94a3b8" }} />
                  <YAxis tick={{ fill: "#94a3b8" }} />
                  <Tooltip />
                  <Legend />
                  {/* draw visitor line if present */}
                  {series.visitor && <Line type="monotone" dataKey="visitor" stroke="#60a5fa" dot={false} />}
                  {series.project_view && <Line type="monotone" dataKey="project_view" stroke="#34d399" dot={false} />}
                  {series.cv_download && <Line type="monotone" dataKey="cv_download" stroke="#f97316" dot={false} />}
                  {series.contact_click && <Line type="monotone" dataKey="contact_click" stroke="#f472b6" dot={false} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-xl font-semibold">Totals</h2>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={[totals]}>
                  <CartesianGrid stroke="#111827" />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="visitor" name="Visitors" fill="#60a5fa" />
                  <Bar dataKey="project_view" name="Project Views" fill="#34d399" />
                  <Bar dataKey="cv_download" name="CV Downloads" fill="#f97316" />
                  <Bar dataKey="contact_click" name="Contact Clicks" fill="#f472b6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}