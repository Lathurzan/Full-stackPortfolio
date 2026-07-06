import { notFound } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Props {
  // params may be a Promise in some Next versions so accept either
  params: { slug: string } | Promise<{ slug: string }>;
}

function normalizeSlug(s?: string) {
  return String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getTechStack(project: any): string[] {
  const raw = project?.stack ?? project?.techStack ?? project?.techstack ?? project?.tech_stack ?? [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string") return raw.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function getImageUrl(img?: string | null) {
  if (!img) return undefined;
  if (img.startsWith("/uploads")) {
    const base = (API_URL || "").replace(/\/api\/?$/, "");
    return base + img;
  }
  return img;
}

export const revalidate = 60;

export default async function ProjectDetailsPage({ params }: Props) {
  const { slug } = (await params) as { slug: string };

  let project: any = null;
  try {
    // direct lookup (by slug or id)
    const directRes = await fetch(`${API_URL}/projects/${slug}`, { next: { revalidate: 60 } });
    project = directRes.ok ? (await directRes.json())?.data : null;

    if (!project) {
      // fetch list and attempt tolerant matching
      const listRes = await fetch(`${API_URL}/projects`, { next: { revalidate: 60 } });
      const list = listRes.ok ? (await listRes.json())?.data || [] : [];

      const target = normalizeSlug(slug);

      project = list.find((p: any) => {
        const pSlug = normalizeSlug(p?.slug);
        const pTitle = normalizeSlug(p?.title);
        const id = String(p?._id || "");

        return (
          pSlug === target ||
          pTitle === target ||
          id === slug ||
          normalizeSlug(p?.slug || p?.title) === target
        );
      }) || null;
    }
  } catch (err) {
    // Backend may be unreachable during build; show not-found client-side rather than crashing prerender
    console.warn("ProjectDetailsPage: fetch failed during render", err);
    project = null;
  }

  if (!project) {
    return (
      <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold">Project not found</h1>
          <p className="mt-4 text-slate-400">We couldn't find a project with the URL <strong>{slug}</strong>.</p>
          <p className="mt-4 text-slate-400">If you believe this is an error, check that the backend is running and the slug exists.</p>
          <div className="mt-6">
            <a href="/projects" className="text-blue-400 underline">Back to projects</a>
          </div>
        </div>
      </section>
    );
  }

  const techs = getTechStack(project);
  const img = getImageUrl(project.image || project.cover || project.thumbnail);

  return (
    <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-start gap-4">
          <Link
            href="/projects"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-white/3 p-2 text-slate-200 hover:bg-white/6 transition"
            aria-label="Back to projects"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">Project Details</p>

            <h1 className="text-4xl font-bold md:text-6xl">{project.title}</h1>

            {project.suggestedCategory ? (
              <p className="mt-2 text-sm text-blue-300">{project.suggestedCategory}</p>
            ) : null}

            <p className="mt-4 text-lg text-slate-400">{project.suggestedDescription}</p>

            <div className="mt-4 flex items-center gap-3">
              {project.githubUrl || project.gitLink ? (
                <a className="rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700" href={project.githubUrl || project.gitLink} target="_blank" rel="noreferrer">GitHub</a>
              ) : null}
              {project.liveUrl || project.liveLink ? (
                <a className="rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700" href={project.liveUrl || project.liveLink} target="_blank" rel="noreferrer">Live</a>
              ) : null}
            </div>
          </div>
        </div>

        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={`${project.title} hero`} className="mb-8 h-[420px] w-full rounded-3xl object-cover" />
        ) : (
          <div className="mb-8 h-[420px] rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-600/20 to-violet-600/20" />
        )}

        {/* Overview below the image */}
        <div className="mt-8">
          <h2 className="mb-5 text-2xl font-bold">Overview</h2>
          <p className="leading-8 text-slate-400">{project.description}</p>
        </div>

        {/* Key Features */}
        {Array.isArray(project.keyFeatures) && project.keyFeatures.length > 0 ? (
          <div className="mt-8">
            <h3 className="mb-3 text-xl font-semibold">Key Features</h3>
            <ul className="list-inside list-disc text-slate-300">
              {project.keyFeatures.map((kf: string, i: number) => (
                <li key={i}>{kf}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Highlights (if any) */}
        {project.highlights ? (
          <div className="mt-8">
            <h3 className="mb-3 text-xl font-semibold">Highlights</h3>
            <div className="prose max-w-none text-slate-300">
              <div dangerouslySetInnerHTML={{ __html: Array.isArray(project.highlights) ? project.highlights.join('<br/>') : String(project.highlights) }} />
            </div>
          </div>
        ) : null}

        {/* Tech Stack at the bottom */}
        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="mb-4 text-lg font-semibold">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {techs.length ? techs.map((t, i) => (
              <span key={`${t}-${i}`} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{t}</span>
            )) : <span className="text-slate-400">No tech listed</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
