"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { projectService } from "@/services/project.service";

export default function EditProjectPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadProject() {
      if (!id) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const res = await projectService.getById(id);
        if (!mounted) return;
        // projectService.getById returns response.data which is { success, data }
        if (res?.data) {
          setProject(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProject();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Edit Project</h1>
      <ProjectForm initial={project || undefined} />
    </div>
  );
}