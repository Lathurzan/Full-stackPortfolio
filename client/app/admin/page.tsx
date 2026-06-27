"use client";

import { useEffect, useState } from "react";
import AnalyticsCard from "@/components/admin/AnalyticsCard";
import DashboardChart from "@/components/admin/DashboardChart";
import { projectService } from "@/services/project.service";
import { blogService } from "@/services/blog.service";
import { messageService } from "@/services/message.service";
import { analyticsService } from "@/services/analytics.service";

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({ projects: 0, blogs: 0, messages: 0, visitors: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [projects, blogs, messages, analytics] = await Promise.all([
          projectService.getAll(),
          blogService.getAll(),
          messageService.list(),
          analyticsService.getStats(),
        ]);

        if (!mounted) return;

        const projCount = (projects?.data || projects || []).length || 0;
        const blogCount = (blogs?.data || blogs || []).length || 0;
        const msgCount = (messages || []).length || 0;
  const visitorTotal = analytics?.totals?.visitor || 0;

  setCounts({ projects: projCount, blogs: blogCount, messages: msgCount, visitors: visitorTotal });

  // build chart data from analytics days & series (analyticsService returns response.data)
  const days = analytics?.days || [];
  const series = analytics?.series || {};
        const d = days.map((day: string, i: number) => {
          const point: any = { day };
          Object.keys(series).forEach((k) => {
            point[k] = series[k][i] || 0;
          });
          return point;
        });
        setChartData(d);
      } catch (err) {
        console.warn("dashboard load failed", err);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Dashboard Overview</h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard title="Projects" value={counts.projects.toString()} />
        <AnalyticsCard title="Blogs" value={counts.blogs.toString()} />
        <AnalyticsCard title="Messages" value={counts.messages.toString()} />
        <AnalyticsCard title="Visitors" value={counts.visitors.toString()} />
      </div>

      <div className="mt-10">
        <DashboardChart data={chartData} xKey="day" lines={[{ key: "visitor", color: "#3b82f6" }]} />
      </div>

      <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Admin Notes</h2>
        <p className="text-slate-400">
          Manage projects, blogs, contact messages, and portfolio analytics from this dashboard.
        </p>
      </div>
    </div>
  );
}