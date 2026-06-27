"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { blogService } from "@/services/blog.service";

export default function BlogForm({ initial }: { initial?: any } = {}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("Draft");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // populate from initial when provided
  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title || "");
    setSlug(initial.slug || "");
    setExcerpt(initial.excerpt || "");
    setContent(initial.content || "");
    setTags(Array.isArray(initial.tags) ? initial.tags.join(",") : initial.tags || "");
    setStatus(initial.status || "Draft");
    if (initial.image) setPreview(initial.image);
  }, [initial]);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("slug", slug);
      form.append("excerpt", excerpt);
      form.append("content", content);
      form.append("status", status);
      if (tags) form.append("tags", tags);
      if (selectedFile) form.append("file", selectedFile);

      let res: any = null;
      const isEdit = !!initial?._id;
      if (isEdit) {
        res = await blogService.update(initial._id, form);
      } else {
        res = await blogService.create(form);
      }

      // server returns { success, message, data }
      if (res && (res.success || res.data)) {
        router.push("/admin/blogs");
      } else {
        console.warn("Blog save response", res);
        alert("Failed to save blog");
      }
    } catch (err) {
      console.error("create blog failed", err);
      alert("Error creating blog");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <Input label="Blog Title" value={title} onChange={(v) => setTitle(v)} placeholder="Building Scalable MERN Apps" />
      <Input label="Slug" value={slug} onChange={(v) => setSlug(v)} placeholder="building-scalable-mern-apps" />

      <div>
        <label className="mb-2 block text-sm text-slate-300">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Write blog content..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Short excerpt"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Tags (comma separated)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 outline-none focus:border-blue-500"
          placeholder="react,nodejs,architecture"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 text-slate-300"
        />
      </div>

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <img src={preview} alt="preview" className="h-56 w-full object-cover" />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Blog"}
      </button>
    </form>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 outline-none focus:border-blue-500"
        placeholder={placeholder}
      />
    </div>
  );
}