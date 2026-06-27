"use client";

import React, { useEffect, useState } from "react";
import { fetchAbout } from "@/services/about.service";

export default function AboutPage() {
  const [about, setAbout] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchAbout();
        if (!mounted) return;
        setAbout(res.data || null);
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  const title = about?.title || "About Me";
  const body = about?.body || "";
  const image = about?.image || null;

  return (
    <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-2 items-start">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">{title}</p>

            <h1 className="text-4xl font-bold md:text-6xl">{title}</h1>
          </div>

          <div className="space-y-6 text-lg leading-8 text-slate-400">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="about" className="mb-4 max-h-80 w-full rounded-lg object-cover" />
            )}

            <div dangerouslySetInnerHTML={{ __html: body }} />
          </div>
        </div>
      </div>
    </section>
  );
}