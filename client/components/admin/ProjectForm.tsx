"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { projectService } from "@/services/project.service";

export default function ProjectForm({ initial }: { initial?: any } = {}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  // show techStack as comma-separated string in edit
  const [tech, setTech] = useState(Array.isArray(initial?.techStack) ? (initial?.techStack || []).join(", ") : initial?.techStack || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [status, setStatus] = useState(initial?.status || "Draft");
  const [preview, setPreview] = useState<string | null>(initial?.image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // When initial is loaded/changes (edit flow), populate local state
  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title || "");
    setSlug(initial.slug || "");
  setTech(Array.isArray(initial.techStack) ? (initial.techStack || []).join(", ") : initial.techStack || "");
    setDesc(initial.description || "");
  setStatus(initial.status || "Draft");
    setPreview(initial.image || null);
  }, [initial]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
  setSaving(true);
  const _saveStartedAt = Date.now();

    try {
      let imageUrl: string | null = null;
      if (selectedFile) {
        try {
          const form = new FormData();
          form.append("file", selectedFile);
          const res = await api.post("/upload", form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          imageUrl = res?.data?.data?.url || null;
          if (imageUrl && imageUrl.startsWith("/uploads")) {
            const base = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
            imageUrl = base + imageUrl;
          }
          if (imageUrl) setPreview(imageUrl);
        } catch (err) {
          console.warn("project image upload failed", err);
        }
      }

      // prepare payload (convert tech csv to array) - defensive conversion
      const techStackArray: string[] = Array.isArray(tech)
        ? tech
        : typeof tech === "string"
        ? tech.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

      const payload: any = {
        title,
        slug,
        techStack: techStackArray,
        description: desc,
        status,
      };
      if (imageUrl) payload.image = imageUrl;

      let resp: any = null;
      const existingId = initial?.id || initial?._id;
      if (existingId) {
        resp = await projectService.update(existingId, payload);
      } else {
        resp = await projectService.create(payload);
      }

      // accept multiple API shapes: { success: true } or returned document
      const savedOk = !!(resp && (resp.success || resp._id || resp.id || resp.data?._id || resp.data?.id));
      if (!savedOk) {
        console.warn("project save failed", resp);
      } else {
        // on create reset the form, on update keep values
        if (!existingId) {
          setTitle("");
          setSlug("");
          setTech("");
          setDesc("");
          setSelectedFile(null);
          setPreview(null);
          setStatus("Draft");
        }
      }
    } catch (err) {
      console.warn("create/update project error", err);
    } finally {
  // ensure the saving indicator shows for at least 1s so the small animation is visible
  const elapsed = Date.now() - _saveStartedAt;
  const minMs = 1000;
  const wait = Math.max(0, minMs - elapsed);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  setSaving(false);
    }
  };

  return (
    <form
      className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
      onSubmit={handleSave}
    >
      <Input label="Project Title" value={title} onChange={setTitle} />
      <Input label="Slug" value={slug} onChange={setSlug} />
      <Input label="Tech Stack" value={tech} onChange={setTech} />

      <div>
        <label className="mb-2 block text-sm text-slate-300">Status</label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3"
        >
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          {/* kept in sync with server enum */}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Description</label>
        <textarea
          rows={6}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Project description..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Project Image</label>
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
          <img src={preview} alt="project preview" className="h-56 w-full object-cover" />
        </div>
      ) : null}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="relative inline-flex items-center gap-3 rounded-full bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500"
          disabled={saving}
        >
          {saving ? (
            <span className="flex h-5 w-5 items-center justify-center">
              {/* run a single 1s spin using Tailwind arbitrary animation value */}
              <span className="rounded-full h-4 w-4 border-t-2 border-white animate-[spin_1s_linear_1]" />
            </span>
          ) : null}
          Save Project
        </button>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
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
      />
    </div>
  );
}