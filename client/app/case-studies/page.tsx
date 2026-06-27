import Link from "next/link";
import { caseStudies } from "@/data/caseStudies";

export default function CaseStudiesPage() {
  return (
    <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Case Studies
        </p>

        <h1 className="text-4xl font-bold md:text-6xl">
          Deep technical breakdowns
        </h1>

        <p className="mt-5 max-w-2xl text-slate-400">
          Architecture, backend design, AI integration, database decisions,
          testing, and deployment details from my strongest projects.
        </p>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {caseStudies.map((cs) => (
            <Link
              key={cs.slug}
              href={`/case-studies/${cs.slug}`}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 transition hover:border-blue-500/60"
            >
              <h2 className="text-2xl font-bold text-white">{cs.title}</h2>

              <p className="mt-4 text-slate-400">{cs.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {cs.stack.map((tech) => (
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