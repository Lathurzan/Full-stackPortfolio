export default async function Experience() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  let items: Array<any> = [];
  try {
    const res = await fetch(`${API_URL}/work-experiences`);
    items = (res.ok && (await res.json())?.data) || [];
  } catch (e) {
    items = [];
  }

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Experience
        </p>

        <h2 className="mb-12 text-3xl font-bold md:text-5xl">
          Work and education
        </h2>

        <div className="space-y-6">
          {items.length === 0 ? (
            <div className="text-center text-slate-500">No experience items found.</div>
          ) : (
            items.map((item) => {
              const start = item.startDate || item.period || "";
              const end = item.endDate || (item.current ? "Present" : "");
              const range = start && end ? `${start} — ${end}` : start || end || "";

              return (
                <div key={item._id || item.role} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <div className="flex flex-col justify-between gap-3 md:flex-row">
                    <div>
                      <h3 className="text-xl font-semibold">{item.role}</h3>
                      <div className="flex items-center gap-3">
                        <p className="text-slate-400">{item.company}</p>
                        {item.companyWebsite ? (
                          <a href={item.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
                            Website
                          </a>
                        ) : null}
                      </div>
                      {Array.isArray(item.technologies) && item.technologies.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.technologies.map((t: string, i: number) => (
                            <span key={`tech-${i}`} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <p className="text-sm text-blue-400">{range}</p>
                  </div>

                  {item.description ? <p className="mt-4 text-slate-400">{item.description}</p> : null}

                  {Array.isArray(item.bullets) && item.bullets.length > 0 && (
                    <ul className="mt-4 list-disc pl-5 text-sm text-slate-300">
                      {item.bullets.map((b: string, bi: number) => (
                        <li key={`b-${bi}`}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}