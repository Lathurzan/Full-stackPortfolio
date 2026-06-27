"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CaseStudiesForm from "@/components/admin/CaseStudiesForm";
import { caseStudyService } from "@/services/caseStudy.service";

export default function EditCaseStudyByIdPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) {
        if (mounted) setLoading(false);
        return;
      }
      try {
  const res = await caseStudyService.getById(id);
        if (!mounted) return;
        if (res?.data) setItem(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Edit Case Study</h1>
      <CaseStudiesForm initial={item || undefined} />
    </div>
  );
}
