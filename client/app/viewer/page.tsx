import React from "react";
import ViewerClientWrapper from "@/components/ViewerClientWrapper";

interface Props {
  searchParams?: any;
}

export default async function ViewerPage({ searchParams }: Props) {
  // searchParams may be a Promise in some Next versions — handle both sync and async
  const params = typeof (searchParams as any)?.then === "function" ? await searchParams : searchParams;
  const rawUrl = params?.url;
  const url = rawUrl ? decodeURIComponent(rawUrl) : null;

  if (!url) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 text-white">
        <h1 className="text-xl font-semibold">No URL provided</h1>
        <p className="mt-2 text-slate-300">Please provide a resume URL as ?url=...</p>
      </div>
    );
  }

  return <ViewerClientWrapper url={url} />;
}