"use client";

import React, { useEffect } from "react";

interface Props {
  project: any;
  apiUrl?: string;
  onClose: () => void;
}

export default function ProjectModal({ project, apiUrl, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const getImageUrl = (img?: string | null) => {
    if (!img) return undefined;
    if (img.startsWith("/uploads")) {
      const base = (apiUrl || "").replace(/\/api\/?$/, "");
      return base + img;
    }
    return img;
  };

  const techs: string[] = (() => {
    const raw = project.stack ?? project.techStack ?? project.techstack ?? project.tech_stack ?? [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === "string") return raw.split(",").map((s: string) => s.trim()).filter(Boolean);
    return [];
  })();

  const img = getImageUrl(project.image || project.thumbnail || project.cover);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 rounded-2xl bg-slate-900/95 p-6 shadow-xl"
        style={{
          width: "210mm",
          height: "297mm",
          maxWidth: "calc(100vw - 2rem)",
          maxHeight: "calc(100vh - 2rem)",
          overflow: "auto",
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-slate-700 bg-slate-800/50 p-2 text-slate-300 hover:bg-slate-800"
          aria-label="Close project"
        >
          ✕
        </button>

        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">{project.suggestedCategory || project.category || "Project"}</p>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="mt-3 text-slate-400">{project.suggestedDescription || project.description}</p>
        </div>

        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={`${project.title} hero`} className="mb-6 h-64 w-full rounded-lg object-cover" />
        ) : (
          <div className="mb-6 h-64 rounded-lg border border-slate-800 bg-gradient-to-br from-blue-600/20 to-violet-600/20" />
        )}

        <div className="mb-6">
          <h2 className="mb-3 text-xl font-semibold">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {techs.map((t, i) => (
              <span key={`${t}-${i}`} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{t}</span>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {project.githubUrl || project.gitLink ? (
            <a className="rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700" href={project.githubUrl || project.gitLink} target="_blank" rel="noreferrer">GitHub</a>
          ) : null}

          {project.liveUrl || project.liveLink ? (
            <a className="rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700" href={project.liveUrl || project.liveLink} target="_blank" rel="noreferrer">Live</a>
          ) : null}

          <a className="ml-auto rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300" href={`/projects/${project.slug || project._id}`} target="_blank" rel="noreferrer">Open full page</a>
        </div>

        <div className="mt-8">
          <h3 className="mb-3 text-lg font-semibold">Key Features</h3>
          <div className="prose max-w-none text-slate-300">
            {project.highlights ? (
              <div dangerouslySetInnerHTML={{ __html: Array.isArray(project.highlights) ? project.highlights.join('<br/>') : String(project.highlights) }} />
            ) : (
              <p className="text-slate-400">No additional highlights provided.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
