"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

export default function VisitorsChart({ data = [], series = {} }: { data?: any[]; series?: any }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="#111827" />
        <XAxis dataKey="day" tick={{ fill: "#94a3b8" }} />
        <YAxis tick={{ fill: "#94a3b8" }} />
        <Tooltip />
        <Legend />
        {series.visitor && <Line type="monotone" dataKey="visitor" stroke="#60a5fa" dot={false} />}
        {series.project_view && <Line type="monotone" dataKey="project_view" stroke="#34d399" dot={false} />}
        {series.cv_download && <Line type="monotone" dataKey="cv_download" stroke="#f97316" dot={false} />}
        {series.contact_click && <Line type="monotone" dataKey="contact_click" stroke="#f472b6" dot={false} />}
      </LineChart>
    </ResponsiveContainer>
  );
}
