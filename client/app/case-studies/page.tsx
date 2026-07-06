import Link from "next/link";

type CaseStudy = {
  _id?: string;
  slug?: string;
  title: string;
  description?: string;
  stack?: string[];
  image?: string;
  githubUrl?: string;
  liveDemoUrl?: string;
};

export default async function CaseStudiesPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

  let items: CaseStudy[] = [];
    try {
    const res = await fetch(`${apiBase}/casestudies`, { next: { revalidate: 60 } });
    const json = await res.json();
    // sort client-side by title to ensure stable ordering across requests
    items = (json?.data ?? []).sort((a: CaseStudy, b: CaseStudy) => a.title.localeCompare(b.title));
  } catch (err) {
    // swallow and render empty list
    items = [];
  }

  // debug: print titles so you can observe order on each request/refresh
  // eslint-disable-next-line no-console
  console.log(items.map((item) => item.title));

  return (
    <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">Case Studies</p>

        <h1 className="text-4xl font-bold md:text-6xl">Deep technical breakdowns</h1>

        <p className="mt-5 max-w-2xl text-slate-400">
          Architecture, backend design, AI integration, database decisions, testing, and deployment details from my strongest projects.
        </p>

        <div className="mt-16 flex flex-col gap-12">
          {items.map((cs, idx) => {
            const key = cs.slug || cs._id;
            const href = `/case-studies/${cs.slug || cs._id}`;
            const reverse = idx % 2 !== 0;
            return (
              <div key={key} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 transition hover:border-blue-500">
                <div
                  className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 ${
                    reverse ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  {/* Content */}
                  <div className="space-y-5">
                    <Link href={href} className="text-2xl font-bold text-white hover:underline">
                      {cs.title}
                    </Link>

                    <p className="text-slate-400">{cs.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {(cs.stack || []).map((tech) => (
                        <span key={tech} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{tech}</span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      {cs.githubUrl ? (
                        <a href={cs.githubUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
                          GitHub
                        </a>
                      ) : null}

                      {cs.liveDemoUrl ? (
                        <a href={cs.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500">
                          Live Demo
                        </a>
                      ) : null}
                      <Link href={href} className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500">
                        Learn more
                      </Link>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="overflow-hidden rounded-2xl">
                    <Link href={href}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cs.image || "/images/placeholder.png"}
                        alt={cs.title}
                        className="h-72 w-full rounded-2xl object-cover transition duration-500 hover:scale-105"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}