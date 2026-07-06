"use client";

import dynamic from "next/dynamic";
import React from "react";

export default function ClientOnlyChart({ importPath, height = 300 }: { importPath: string; height?: number }) {
  const Chart = dynamic(() => import(/* @vite-ignore */ importPath).then((mod) => mod.default), {
    ssr: false,
    loading: () => <div style={{ width: "100%", height }} />,
  });

  return (
    <div style={{ width: "100%", height }}>
      <Chart />
    </div>
  );
}
