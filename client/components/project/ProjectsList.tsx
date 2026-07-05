"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

interface Props {
  projects: any[];
  apiUrl?: string;
}

export default function ProjectsList({ projects, apiUrl }: Props) {
  const [filter, setFilter] = useState<string>("All");
  const [selected, setSelected] = useState<any | null>(null);

  const categories = [
    "All",
    "AI/ML",
    "Generative AI",
    "Full-Stack",
    "Backend",
    "Frontend",
    "Cloud",
    "Healthcare",
    "Enterprise",
    "Open Source",
  ];

  const filtered = useMemo(() => {
    if (filter === "All") return projects;
    return projects.filter((p: any) => {
  const cat = (p.category || p.suggestedCategory || "").toString();
  const status = (p.status || "").toString();
  const title = (p.title || "").toString();

  const normalize = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const nf = normalize(filter);
  const ncat = normalize(cat);
  const nstatus = normalize(status);
  const ntitle = normalize(title);

  // match by normalized category, status or title
  return ncat.includes(nf) || nstatus.includes(nf) || ntitle.includes(nf);
    });
  }, [filter, projects]);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-3 py-1 text-sm ${filter === c ? 'bg-blue-500 text-white' : 'border border-slate-700 text-slate-300 bg-transparent'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
      {filtered.map((project: any, i: number) => {
        const img = project.image || project.thumbnail || project.cover;
        const src = img && img.startsWith('/uploads') && apiUrl ? (apiUrl.replace(/\/api\/?$/, '') + img) : img;

        return (
          <div
            key={project._id || project.slug || `project-${i}`}
            onClick={() => setSelected(project)}
            className="group cursor-pointer rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-blue-500/50"
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={`${project.title} thumbnail`} className="mb-6 h-60 w-full rounded-2xl object-cover" />
            ) : (
              <div className="mb-6 h-60 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/20" />
            )}

            <h2 className="text-2xl font-bold group-hover:text-blue-400">{project.title}</h2>

            <p className="mt-4 text-slate-400">{project.suggestedDescription}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {((project.stack ?? project.techStack ?? project.techstack ?? project.tech_stack) || []).slice(0, 6).map((tech: string, ti: number) => (
                <span key={`${tech || 'tech'}-${ti}`} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{tech}</span>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href={`/projects/${project.slug || project._id || i}`}
                className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                onClick={(e) => e.stopPropagation()}
              >
                Learn more
              </Link>
            </div>
          </div>
        );
      })}
      </div>
    </>
  );
}
