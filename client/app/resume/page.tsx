"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getResume } from "../../services/resume.services";

export default function ResumePage() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [noResume, setNoResume] = useState(false);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const proxySrc = apiBase.endsWith("/api")
    ? `${apiBase}/resume/proxy`
    : `${apiBase}/api/resume/proxy`;

  useEffect(() => {
    getResume()
      .then((url) => {
        if (url) {
          setOriginalUrl(url);
        } else {
          setNoResume(true);
        }
      })
      .catch(() => setNoResume(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#0B0F19] text-white">
      {/* Header bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-[#0B0F19]/90 px-6 py-3 backdrop-blur">
        <Link
          href="/"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back
        </Link>

        <h1 className="text-sm font-semibold tracking-wide text-slate-200">
          Resume
        </h1>

        {originalUrl && (
          <button
            onClick={async () => {
              try {
                const r = await fetch(`${proxySrc}?dl=1`);
                if (!r.ok) throw new Error("Download failed");
                const blob = await r.blob();
                const href = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = href;
                a.download = "resume.pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(href);
              } catch {
                window.alert("Unable to download resume. Please try again.");
              }
            }}
            className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500"
          >
            Download ↗
          </button>
        )}

        {!originalUrl && <span className="w-20" />}
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        {loading && (
          <div className="flex h-[80vh] items-center justify-center text-slate-400">
            Loading resume…
          </div>
        )}

        {!loading && noResume && (
          <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-slate-400">
            <p className="text-lg">No resume uploaded yet.</p>
            <Link
              href="/"
              className="text-sm text-blue-400 underline hover:text-blue-300"
            >
              Go back home
            </Link>
          </div>
        )}

        {!loading && !noResume && (
          <iframe
            src={proxySrc}
            title="Resume"
            className="h-[85vh] w-full rounded-lg border border-slate-700 bg-white"
          />
        )}
      </div>
    </main>
  );
}
