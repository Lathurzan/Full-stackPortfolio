import { caseStudies } from "@/data/caseStudies";
import { notFound } from "next/navigation";

interface Props {
  params: {
    slug: string;
  };
}

export default function CaseStudyDetailsPage({ params }: Props) {
  const cs = caseStudies.find((p) => p.slug === params.slug);

  if (!cs) return notFound();

  return (
    <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Case Study
        </p>

          <h1 className="text-4xl font-bold md:text-6xl">{cs.title}</h1>

        <p className="mt-6 text-lg leading-8 text-slate-400">{cs.description}</p>

        <div className="mt-12 h-[380px] rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-600/20 to-violet-600/20" />

        <div className="mt-16 space-y-12">
          {cs.hasCaseStudy ? (
            <>
              <CaseBlock title="Problem Statement" text={cs.problem} />
              <CaseBlock title="Architecture" text={cs.architecture} />
              <CaseBlock title="Backend Design" text={cs.backend} />
              <CaseBlock title="AI Integration" text={cs.aiIntegration} />
              <CaseBlock title="Database Design" text={cs.databaseDesign} />
              <CaseBlock title="Challenges" text={cs.challenges} />
              <CaseBlock title="Deployment" text={cs.deployment} />
            </>
          ) : (
            <CaseBlock title="Overview" text={cs.description} />
          )}
        </div>
      </div>
    </section>
  );
}

function CaseBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
      <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>
      <p className="leading-8 text-slate-400">{text}</p>
    </div>
  );
}