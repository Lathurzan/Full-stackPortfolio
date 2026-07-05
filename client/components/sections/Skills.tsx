
export default async function Skills() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  let skillGroups: Array<{ category: string; items: string[] }> = [];
  try {
    const res = await fetch(`${API_URL}/skills`);
    skillGroups = (res.ok && (await res.json())?.data) || [];
  } catch (e) {
    skillGroups = [];
  }

  const groups = skillGroups; // use only DB data

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Skills
        </p>

        <h2 className="mb-12 text-3xl font-bold md:text-5xl">
          Technologies I work with
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.length === 0 ? (
            <div className="col-span-full text-center text-slate-500">No skills found in database.</div>
          ) : (
            groups.map((group) => {
              return (
                <div
                  key={group.category}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
                >
                  <h3 className="mb-5 text-xl font-semibold">{group.category}</h3>

                  <div className="flex flex-wrap gap-2">
                    {group.items.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
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