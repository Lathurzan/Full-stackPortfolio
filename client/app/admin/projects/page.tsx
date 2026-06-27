"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { projectService } from "@/services/project.service";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const statusColors: Record<string, string> = {
    Draft: "bg-yellow-500/20 text-yellow-400",
    Published: "bg-green-500/20 text-green-400",
    Archived: "bg-red-500/20 text-red-400",
    Featured: "bg-blue-500/20 text-blue-400",
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await projectService.getAll();
        if (!mounted) return;
        // service returns { success: true, data: projects }
        if (res?.data) setProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
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
        <h1 className="text-3xl font-bold">Projects</h1>

        <Link
          href="/admin/projects/create"
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Add Project
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        {loading ? (
          <div className="p-6 text-slate-400">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="p-6 text-slate-400">No projects yet.</div>
        ) : (
          projects.map((project) => {
            const pid = project?._id || project?.id;
            if (!pid) return null; // avoid rendering items without a valid id

            async function handleDelete(id: string) {
              if (!confirm("Delete this project?")) return;
              setDeletingIds((s) => [...s, id]);
              try {
                const res = await projectService.delete(id);
                // service returns { success: true, data }
                if (res?.success) {
                  setProjects((prev) => prev.filter((p) => (p._id || p.id) !== id));
                } else {
                  console.warn("project delete failed:", res);
                }
              } catch (err) {
                console.error("project delete error:", err);
              } finally {
                setDeletingIds((s) => s.filter((x) => x !== id));
              }
            }

            const isDeleting = deletingIds.includes(pid);

            return (
              <div
                key={pid}
                className="flex items-center justify-between border-b border-slate-800 px-6 py-5 last:border-b-0"
              >
                <div>
                  <h2 className="font-semibold">{project.title}</h2>
                  <p className="text-sm text-slate-400">
                    <span className={`rounded-full px-3 py-1 text-xs ${statusColors[project.status] || "bg-slate-800 text-slate-300"}`}>
                      {project.status}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link href={`/admin/projects/edit/${pid}`} className="text-sm text-blue-400 hover:text-blue-300">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(pid)}
                    disabled={isDeleting}
                    className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
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