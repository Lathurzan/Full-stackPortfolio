import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies as staticCaseStudies } from "@/data/caseStudies";

type CaseStudy = {
  _id?: string;
  slug?: string;
  title: string;
  description?: string;
  stack?: string[];
  problem?: string;
  architecture?: string;
  backend?: string;
  aiIntegration?: string;
  databaseDesign?: string;
  challenges?: string;
  deployment?: string;
};

function normalize(s: string) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function fetchCaseStudy(slugOrId: string): Promise<CaseStudy | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const slugNorm = normalize(slugOrId);

  // If the param looks like a Mongo ObjectId, try direct lookup first —
  // this handles records with empty slug values that are linked by _id.
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
  if (isObjectId) {
    try {
      const res = await fetch(`${apiBase}/casestudies/${slugOrId}`, { next: { revalidate: 60 } });
      if (res.ok) {
        const json = await res.json();
        // api may return { success, data } or the raw object
        if (json?.data) return json.data as CaseStudy;
        if (json?._id) return json as CaseStudy;
      }
    } catch (err) {
      // ignore and continue to list/static fallback
    }
  }

  // Try server list endpoint and match tolerant
  try {
    const res = await fetch(`${apiBase}/casestudies`, { next: { revalidate: 60 } });
    const json = await res.json().catch((e) => {
      console.error("fetchCaseStudy: failed to parse list json", e);
      return null;
    });
    console.log("fetchCaseStudy: list fetch", { ok: res.ok, status: res.status, url: `${apiBase}/casestudies`, slugOrId, slugNorm, jsonPreview: Array.isArray(json?.data) ? json.data.slice(0,3).map((x:any)=>({ _id: x._id, slug: x.slug, title: x.title })) : null });
    if (res.ok && json) {
      const items: CaseStudy[] = json?.data ?? [];
      const found = items.find((i) => {
        const idStr = String((i as any)._id ?? "");
        const titleSlug = normalize((i as any).title ?? "");
        return (
          normalize((i as any).slug ?? "") === slugNorm ||
          idStr === slugOrId ||
          idStr.startsWith(slugOrId) ||
          titleSlug === slugNorm
        );
      });
      console.log("fetchCaseStudy: list matching result", { found: !!found, foundId: found?._id, foundSlug: found?.slug });
      if (found) return found;
    }
  } catch (err) {
    // backend unreachable — will fall back to static data below
  }

  // Try direct id lookup as a fallback (covers non-ObjectId ids or when list matching failed)
  try {
    const res = await fetch(`${apiBase}/api/casestudies/${slugOrId}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      if (json?.data) return json.data as CaseStudy;
      if (json?._id) return json as CaseStudy;
    }
  } catch (err) {
    // ignore
  }

  // Fallback to static local data bundled with the client when backend isn't available
  const foundLocal = (staticCaseStudies as any[]).find((i) => normalize(i.slug ?? "") === slugNorm || String(i._id) === slugOrId);
  if (foundLocal) return foundLocal as CaseStudy;

  return null;
}

export default async function CaseStudyDetailsPage({ params }: { params: any }) {
  // In Next 16 the params may be a Promise; unwrap before use
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const cs = await fetchCaseStudy(slug ?? "");

  if (!cs) {
    return (
      <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center gap-4">
            <Link href="/case-studies" className="rounded-full bg-white/6 p-2">
              ←
            </Link>
            <p className="mb-0 text-sm font-semibold uppercase tracking-widest text-blue-400">Case Study</p>
          </div>

          <h1 className="text-3xl font-bold">Case study not found</h1>
          <p className="mt-4 text-slate-400">We couldn't find this case study. It may be unpublished, removed, or the backend API is unavailable. Try refreshing or check the admin panel.</p>

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm text-slate-400">Requested: <code className="bg-slate-800 px-2 py-1 rounded">{slug}</code></p>
            <p className="mt-3 text-sm text-slate-400">You can return to the list to see available case studies.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/case-studies" className="rounded-full bg-white/6 p-2">
            ←
          </Link>
          <p className="mb-0 text-sm font-semibold uppercase tracking-widest text-blue-400">Case Study</p>
        </div>

        <h1 className="text-4xl font-bold md:text-6xl">{cs.title}</h1>

        <p className="mt-6 text-lg leading-8 text-slate-400">{cs.description}</p>

        <div className="mt-12 h-[380px] rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-600/20 to-violet-600/20" />

        <div className="mt-16 space-y-12">
          {cs.problem && <CaseBlock title="Problem Statement" text={cs.problem} />}
          {cs.architecture && <CaseBlock title="Architecture" text={cs.architecture} />}
          {cs.backend && <CaseBlock title="Backend Design" text={cs.backend} />}
          {cs.aiIntegration && <CaseBlock title="AI Integration" text={cs.aiIntegration} />}
          {cs.databaseDesign && <CaseBlock title="Database Design" text={cs.databaseDesign} />}
          {cs.challenges && <CaseBlock title="Challenges" text={cs.challenges} />}
          {cs.deployment && <CaseBlock title="Deployment" text={cs.deployment} />}
          {!cs.problem && !cs.architecture && !cs.backend && !cs.aiIntegration && !cs.databaseDesign && !cs.challenges && !cs.deployment && (
            <CaseBlock title="Overview" text={cs.description || ""} />
          )}
        </div>
      </div>
    </section>
  );
}

function CaseBlock({ title, text }: { title: string; text?: string }) {
  if (!text) return null;
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
      <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>
      <p className="leading-8 text-slate-400">{text}</p>
    </div>
  );
}
