"use client";

import React from "react";
import { BarChart, Bar, Tooltip, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts";

export default function TotalsChart({ totals = {} }: { totals?: any }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
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
  );
}
