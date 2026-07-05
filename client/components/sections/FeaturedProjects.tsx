import Link from "next/link";
import LearnMoreLink from "../ui/LearnMoreLink";

import { ArrowRight, ExternalLink } from "lucide-react";

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.744.083-.729.083-.729 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.775.418-1.305.76-1.604-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.98-.399 3-.405 1.02.006 2.043.139 3 .405 2.29-1.553 3.297-1.23 3.297-1.23.655 1.653.243 2.874.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.624-5.475 5.92.43.372.815 1.102.815 2.222 0 1.606-.015 2.903-.015 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default async function FeaturedProjects() {
  let featured: any[] = [];

  try {
    const res = await fetch(`${API_URL}/projects`, { next: { revalidate: 60 } });

    if (res.ok) {
      const body = await res.json().catch(() => null);
      const all = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];

      const normalized = all.map((p: any) => {
        const stack = Array.isArray(p.stack)
          ? p.stack
          : Array.isArray(p.techStack)
          ? p.techStack
          : Array.isArray(p.techstack)
          ? p.techstack
          : Array.isArray(p.tech_stack)
          ? p.tech_stack
          : [];

        const isFeatured = Boolean(
          p && (p.featured || (typeof p.status === "string" && p.status.toLowerCase() === "featured"))
        );

        return { ...p, stack, featured: isFeatured };
      });

      featured = normalized.filter((p: any) => p.featured);
    } else {
      console.warn("FeaturedProjects: fetch failed", res.status, res.statusText);
    }
  } catch (err) {
    // keep featured as empty array on error
    // eslint-disable-next-line no-console
    console.error("FeaturedProjects: fetch error", err);
  }

  const getImageUrl = (img?: any) => {
    if (!img || typeof img !== "string") return undefined;
    if (img.startsWith("/uploads")) {
      const base = (API_URL || "").replace(/\/api\/?$/, "");
      return base + img;
    }
    return img;
  };

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">Featured Projects</p>
            <h2 className="text-3xl font-bold md:text-5xl">Real-world full-stack systems</h2>
          </div>

          <Link href="/projects" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
            View all projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {featured.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-400">No featured projects yet.</div>
          ) : (
            featured.map((project: any, idx: number) => {
              const img = getImageUrl(project.image || project.thumbnail || project.cover);

              return (
                <div key={(project._id || project.slug || "fp-") + idx} className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-blue-500/60">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={(project.title || "") + " thumbnail"} className="mb-6 h-52 w-full rounded-xl object-cover" />
                  ) : (
                    <div className="mb-6 h-52 rounded-xl border border-slate-800 bg-gradient-to-br from-blue-600/20 to-violet-600/20" />
                  )}

                  <h3 className="text-2xl font-semibold group-hover:text-blue-400">
                    <Link href={`/projects/${project.slug || project._id || idx}`} className="inline-block">
                      {project.title}
                    </Link>
                  </h3>

                  {project.suggestedCategory && <p className="mt-3 text-sm font-medium text-blue-300">{project.suggestedCategory}</p>}
                  {project.suggestedDescription && <p className="mt-1 text-sm text-slate-400">{project.suggestedDescription}</p>}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {(project.stack || []).map((tech: string, ti: number) => (
                      <span key={(tech || "tech") + ti} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    {project.githubUrl || project.gitLink ? (
                      <a
                        href={project.githubUrl || project.gitLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${project.title} on GitHub`}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-blue-500 hover:bg-slate-800 transition"
                      >
                        <GitHubIcon className="h-4 w-4 text-slate-200" />
                        <span className="font-medium">GitHub</span>
                      </a>
                    ) : null}

                    {project.liveUrl || project.liveLink ? (
                      <a
                        href={project.liveUrl || project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open live demo for ${project.title}`}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-blue-500 hover:to-indigo-500"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Live Demo</span>
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    <LearnMoreLink href={`/projects/${project.slug || project._id || idx}`} className="">
                      Learn more
                    </LearnMoreLink>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}