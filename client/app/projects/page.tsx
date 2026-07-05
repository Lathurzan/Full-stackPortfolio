import ProjectsList from "../../components/project/ProjectsList";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default async function ProjectsPage() {
  const res = await fetch(`${API_URL}/projects`);
  const projects = (res.ok && (await res.json())?.data) || [];

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