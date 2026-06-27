import Link from "next/link";
import { projects } from "@/data/projects";

export default function ProjectsPage() {
  return (
    <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
            Projects
          </p>

          <h1 className="text-4xl font-bold md:text-6xl">
            Full-stack & AI projects
          </h1>

          <p className="mt-5 max-w-2xl text-slate-400">
            Production-ready applications focused on backend systems,
            AI integrations, scalable architecture, and real-world
            software engineering.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-blue-500/50"
            >
              <div className="mb-6 h-60 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/20" />

              <h2 className="text-2xl font-bold group-hover:text-blue-400">
                {project.title}
              </h2>

              <p className="mt-4 text-slate-400">
                {project.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
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