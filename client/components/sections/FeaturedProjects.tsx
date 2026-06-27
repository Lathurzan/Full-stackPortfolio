import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { projects } from "@/data/projects";

export default function FeaturedProjects() {
  const featured = projects.filter((project) => project.featured);

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Featured Projects
            </p>
            <h2 className="text-3xl font-bold md:text-5xl">
              Real-world full-stack systems
            </h2>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            View all projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {featured.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-blue-500/60"
            >
              <div className="mb-6 h-52 rounded-xl border border-slate-800 bg-gradient-to-br from-blue-600/20 to-violet-600/20" />

              <h3 className="text-2xl font-semibold group-hover:text-blue-400">
                {project.title}
              </h3>

              <p className="mt-3 text-slate-400">{project.description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}