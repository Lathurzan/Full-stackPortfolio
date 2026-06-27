"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BlogForm from "@/components/admin/BlogForm";
import { blogService } from "@/services/blog.service";

export default function EditBlogPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [initial, setInitial] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const res: any = await blogService.getById(id);
        const payload = res?.data || res;
        if (!mounted) return;
        setInitial(payload || null);
      } catch (err) {
        console.warn("failed to fetch blog for edit", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Edit Blog</h1>
      {loading && <div className="p-6">Loading...</div>}
      {!loading && <BlogForm initial={initial} />}
    </div>
  );
}
