"use client";

import dynamic from "next/dynamic";
import React from "react";

function LoadingBox({ height = 300 }: { height?: number }) {
  return <div style={{ width: "100%", height, minHeight: height }} />;
}

// Statically listed dynamic imports so the bundler can analyze them
const VisitorsChart = dynamic(() => import("./VisitorsChart"), {
  ssr: false,
  loading: () => <LoadingBox />,
});

const TotalsChart = dynamic(() => import("./TotalsChart"), {
  ssr: false,
  loading: () => <LoadingBox />,
});

const CHART_MAP: Record<string, any> = {
  VisitorsChart,
  TotalsChart,
};

export default function ClientOnlyChart({ chartType, height = 300, ...props }: { chartType: string; height?: number; [k: string]: any }) {
  const Component = CHART_MAP[chartType];
  if (!Component) return <LoadingBox height={height} />;

  return (
    <div style={{ width: "100%", height }}>
      <Component {...props} />
    </div>
  );
}
