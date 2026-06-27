"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { caseStudyService } from "@/services/caseStudy.service";
import { api } from "@/services/api";

export default function AdminCaseStudiesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this case study? This action cannot be undone.")) return;
    setDeletingIds((s) => [...s, id]);
    try {
      const res = await caseStudyService.delete(id);
      // service returns either { success, message } or null
      const ok = res?.success ?? !!res;
      if (ok) {
        setItems((prev) => prev.filter((it) => (it?._id || it?.id) !== id));
      } else {
        console.warn("Failed to delete case study", res);
        alert("Failed to delete case study");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete case study");
    } finally {
      setDeletingIds((s) => s.filter((x) => x !== id));
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // reuse projectService for case studies data until a dedicated service exists
        const res = await caseStudyService.getAll();
        if (!mounted) return;
        // caseStudyService returns either the axios response.data wrapper or the raw data
        const data = res?.data ?? res ?? [];
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch case studies", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Case Studies</h1>

        <Link
          href="/admin/casestudies/create"
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Add Case Study
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        {loading ? (
          <div className="p-6 text-slate-400">Loading case studies…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-slate-400">No case studies yet.</div>
        ) : (
          items.map((item) => {
            const id = item?._id || item?.id;
            if (!id) return null;
            const rawImage: string | undefined = item?.image;
            const getImageUrl = (img?: string | null) => {
              if (!img) return undefined;
              if (img.startsWith("/uploads")) {
                const base = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
                return base + img;
              }
              return img;
            };

            const imageUrl = getImageUrl(rawImage);

            return (
              <div key={id} className="flex items-center justify-between border-b border-slate-800 px-6 py-5 last:border-b-0">
                <div className="flex items-center gap-4">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt={`${item.title} thumbnail`} className="h-16 w-24 rounded-md object-cover" />
                  ) : (
                    <div className="h-16 w-24 rounded-md bg-slate-800" />
                  )}

                  <div>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="text-sm text-slate-400">{item.slug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link href={`/admin/casestudies/edit/${id}`} className="text-sm text-blue-400 hover:text-blue-300">
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(id)}
                    disabled={deletingIds.includes(id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    {deletingIds.includes(id) ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
