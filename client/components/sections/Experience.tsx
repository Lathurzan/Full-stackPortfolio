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
            items.map((item) => (
              <div
                key={item._id || item.role}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row">
                  <div>
                    <h3 className="text-xl font-semibold">{item.role}</h3>
                    <p className="text-slate-400">{item.company}</p>
                  </div>
                  <p className="text-sm text-blue-400">{item.period || item.startDate}</p>
                </div>

                <p className="mt-4 text-slate-400">{item.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}