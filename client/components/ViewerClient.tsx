"use client"

import React, { useEffect, useState } from "react";

interface Props {
  url: string;
}

export default function ViewerClient({ url }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [isImage, setIsImage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    let objectUrl: string | null = null;

    async function tryLoad() {
      setLoading(true);
      setError(null);

      // Avoid attempting to fetch Google Drive / Docs viewer endpoints using fetch
      // which will hit Google APIs requiring OAuth credentials. Detect common
      // Drive/Docs URLs and skip blob fetch — just render direct embed link.
      const isGoogleDrive = /drive\.google\.com|docs\.google\.com|googleusercontent\.com/.test(url);
      if (isGoogleDrive) {
        setError("The file is hosted on Google Drive and requires authentication; open original to view.");
        setLoading(false);
        return;
      }

      try {
        const r = await fetch(url, { cache: "no-store", mode: "cors" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);

        const ct = (r.headers.get("content-type") || "").toLowerCase();

        const blob = await r.blob();

        if (!mounted) return;

        // detect pdf or image
        if (ct.includes("pdf") || url.toLowerCase().endsWith(".pdf") || blob.type === "application/pdf") {
          objectUrl = URL.createObjectURL(blob);
          setIsPdf(true);
          setBlobUrl(objectUrl);
          setLoading(false);
          return;
        }

        if (ct.startsWith("image/") || blob.type.startsWith("image/")) {
          objectUrl = URL.createObjectURL(blob);
          setIsImage(true);
          setBlobUrl(objectUrl);
          setLoading(false);
          return;
        }

        // fallback to object URL for other types
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setLoading(false);
      } catch (err: any) {
        // likely CORS or network; fallback to direct embedding
        if (mounted) {
          setError(err?.message || "Failed to fetch resource; falling back to direct embed");
          setLoading(false);
        }
      }
    }

    tryLoad();

    return () => {
      mounted = false;
      if (objectUrl) {
        try { URL.revokeObjectURL(objectUrl); } catch (e) { /* ignore */ }
      }
    };
  }, [url]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Resume Preview</h1>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm underline hover:text-blue-400">
            Open Original
          </a>
        </div>

        <div className="rounded-lg bg-white overflow-hidden">
          {loading ? (
            <div className="p-6 text-slate-700">Loading preview…</div>
          ) : blobUrl ? (
            isPdf ? (
              <iframe src={blobUrl} title="Resume Preview" className="h-[90vh] w-full" />
            ) : isImage ? (
              <img src={blobUrl} alt="Resume" className="mx-auto max-h-[90vh] w-auto object-contain" />
            ) : (
              <iframe src={blobUrl} title="Resume Preview" className="h-[90vh] w-full" />
            )
          ) : (
            // blob fetch failed (likely CORS) - try direct iframe embed which may still work
            <iframe src={url} title="Resume Preview" className="h-[90vh] w-full" />
          )}

          {error && (
            <div className="p-4 text-sm text-red-600">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
