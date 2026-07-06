import ProjectsList from "../../components/project/ProjectsList";

export const revalidate = 60;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default async function ProjectsPage() {
  let projects: any[] = [];
  try {
    const res = await fetch(`${API_URL}/projects`, { next: { revalidate: 60 } });
    const all = (res.ok && (await res.json())?.data) || [];
    // exclude draft projects from the public listing
    projects = Array.isArray(all) ? all.filter((p: any) => (p?.status || "Published") !== "Draft") : [];
  } catch (err) {
    // Backend unavailable at build-time — render an empty list and let client fill later if needed
    console.warn("ProjectsPage: failed to fetch projects during render", err);
    projects = [];
  }

  return (
    <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">Projects</p>

          <h1 className="text-4xl font-bold md:text-6xl">Full-stack & AI projects</h1>

          <p className="mt-5 max-w-2xl text-slate-400">
            Production-ready applications focused on backend systems,
            AI integrations, scalable architecture, and real-world
            software engineering.
          </p>
        </div>

        {/* client-side interactive list (opens modal) */}
        <ProjectsList projects={projects} apiUrl={API_URL} />
      </div>
    </section>
  );
}