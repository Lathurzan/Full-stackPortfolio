export default async function About() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  let about: any = null;
  try {
    const res = await fetch(`${API_URL}/about`);
    about = (res.ok && (await res.json())?.data) || null;
  } catch (e) {
    // ignore network errors and fall back to defaults
    about = null;
  }

  const title = about?.title || "Full-stack engineer with AI and backend focus.";
  const body = about?.body || null;

  return (
    <section className="section-padding">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
            About Me
          </p>
          <h2 className="text-3xl font-bold md:text-5xl">{title}</h2>

        </div>

        <div className="space-y-5 text-slate-400">
          {body ? (
            // if profile.body exists, render it as-is (may contain newlines)
            body.split('\n').map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))
          ) : (
            <>
              <p>
                I am a Software Engineering student at Cardiff Metropolitan
                University with experience building full-stack applications,
                backend APIs, AI-powered systems, and production deployments.
              </p>
              <p>
                My strongest areas are React, TypeScript, Node.js, FastAPI,
                Spring Boot, MongoDB, PostgreSQL, REST APIs, authentication,
                payments, and AI integration.
              </p>
            </>
          )}

        </div>
      </div>
    </section>
  );
}