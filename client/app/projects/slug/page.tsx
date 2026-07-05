import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface Props {
  params: { slug: string };
}

export default async function ProjectDetailsPage({ params }: Props) {
  const res = await fetch(`${API_URL}/projects/${params.slug}`);
  const project = res.ok ? (await res.json())?.data : null;

  if (!project) return notFound();

  return (
    <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">Project Details</p>

          <h1 className="text-4xl font-bold md:text-6xl">{project.title}</h1>

          <p className="mt-6 text-lg text-slate-400">{project.description}</p>
        </div>

        {/* hero image */}
        {(() => {
          const getImageUrl = (img?: string | null) => {
            if (!img) return undefined;
            if (img.startsWith('/uploads')) {
              const base = (API_URL || '').replace(/\/api\/?$/, '');
              return base + img;
            }
            return img;
          };

          const img = getImageUrl(project.image || project.cover || project.thumbnail);
          return img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={`${project.title} hero`} className="mb-12 h-[400px] w-full rounded-3xl object-cover" />
          ) : (
            <div className="mb-12 h-[400px] rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-600/20 to-violet-600/20" />
          );
        })()}

        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-5 text-2xl font-bold">Overview</h2>

            <p className="leading-8 text-slate-400">
              This project was developed to demonstrate scalable full-stack engineering, backend architecture,
              authentication systems, API integrations, and AI-powered functionality in a production-style environment.
            </p>
          </div>

          <div>
            <h2 className="mb-5 text-2xl font-bold">Tech Stack</h2>

            <div className="flex flex-wrap gap-3">
                {(project.stack || []).map((tech: string, i: number) => (
                  <span key={`${tech || 'tech'}-${i}`} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">{tech}</span>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="mb-6 text-3xl font-bold">Architecture & Features</h2>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
            <ul className="space-y-4 text-slate-400">
              <li>• REST API architecture</li>
              <li>• JWT authentication system</li>
              <li>• AI integration workflows</li>
              <li>• Database schema & optimization</li>
              <li>• Responsive frontend design</li>
              <li>• Production deployment configuration</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}