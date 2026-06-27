import { experience } from "@/data/experience";

export default function Experience() {
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
          {experience.map((item) => (
            <div
              key={item.role}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row">
                <div>
                  <h3 className="text-xl font-semibold">{item.role}</h3>
                  <p className="text-slate-400">{item.company}</p>
                </div>
                <p className="text-sm text-blue-400">{item.period}</p>
              </div>

              <p className="mt-4 text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}