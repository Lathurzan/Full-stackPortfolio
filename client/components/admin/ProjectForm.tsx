"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { projectService } from "@/services/project.service";

export default function ProjectForm({ initial }: { initial?: any } = {}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  // tech tags input (replace CSV input with add/remove chips)
  const [techTags, setTechTags] = useState<string[]>(
    Array.isArray(initial?.techStack)
      ? initial?.techStack
      : typeof initial?.techStack === "string"
      ? (initial.techStack || "").split(",").map((s: string) => s.trim()).filter(Boolean)
      : []
  );
  const [techInput, setTechInput] = useState("");
  const [categories, setCategories] = useState<string[]>(
    Array.isArray(initial?.category)
      ? initial.category
      : typeof initial?.category === "string"
      ? (initial.category || "").split(",").map((s: string) => s.trim()).filter(Boolean)
      : []
  );
  const [categoryInput, setCategoryInput] = useState("");
  const [startDate, setStartDate] = useState(initial?.startDate || "");
  const [endDate, setEndDate] = useState(initial?.endDate || "");
  const [keyFeatures, setKeyFeatures] = useState(Array.isArray(initial?.keyFeatures) ? (initial?.keyFeatures || []).join(", ") : initial?.keyFeatures || "");
  const [highlights, setHighlights] = useState(initial?.highlights || "");
  const [gitLink, setGitLink] = useState(initial?.githubUrl || initial?.gitLink || "");
  const [liveLink, setLiveLink] = useState(initial?.liveUrl || initial?.liveLink || "");
  const [suggestedCategory, setSuggestedCategory] = useState(initial?.suggestedCategory || "");
  const [suggestedDescription, setSuggestedDescription] = useState(initial?.suggestedDescription || "");
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
  setTechTags(
    Array.isArray(initial.techStack)
      ? initial.techStack
      : typeof initial.techStack === "string"
      ? (initial.techStack || "").split(",").map((s: string) => s.trim()).filter(Boolean)
      : []
  );
  setTechInput("");
  setCategories(
    Array.isArray(initial?.category)
      ? initial.category
      : typeof initial?.category === "string"
      ? (initial.category || "").split(",").map((s: string) => s.trim()).filter(Boolean)
      : []
  );
  setCategoryInput("");
  setStartDate(initial?.startDate || "");
  setEndDate(initial?.endDate || "");
  setKeyFeatures(Array.isArray(initial?.keyFeatures) ? (initial?.keyFeatures || []).join(", ") : initial?.keyFeatures || "");
  setHighlights(initial?.highlights || "");
  setGitLink(initial?.githubUrl || initial?.gitLink || "");
  setLiveLink(initial?.liveUrl || initial?.liveLink || "");
  setSuggestedCategory(initial?.suggestedCategory || "");
  setSuggestedDescription(initial?.suggestedDescription || "");
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

      // prepare payload - use tag array if present
      const techStackArray: string[] = Array.isArray(techTags) && techTags.length > 0
        ? techTags.filter(Boolean)
        : [];

      // key features CSV -> array
      const keyFeaturesArray: string[] = Array.isArray(keyFeatures)
        ? keyFeatures
        : typeof keyFeatures === "string"
        ? keyFeatures.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

  const payload: any = {
    title,
    slug,
    techStack: techStackArray,
  category: categories,
  startDate: startDate || undefined,
  endDate: endDate || undefined,
  keyFeatures: keyFeaturesArray,
  highlights,
        description: desc,
        status,
  githubUrl: gitLink,
  liveUrl: liveLink,
  suggestedCategory: suggestedCategory || undefined,
  suggestedDescription: suggestedDescription || undefined,
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
          setTechTags([]);
          setTechInput("");
          setDesc("");
          setSelectedFile(null);
          setPreview(null);
          setStatus("Draft");
          // reset added fields
          setCategories([]);
          setCategoryInput("");
          setStartDate("");
          setEndDate("");
          setKeyFeatures("");
          setHighlights("");
          setGitLink("");
          setLiveLink("");
          setSuggestedCategory("");
          setSuggestedDescription("");
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
      <div>
        <label className="mb-2 block text-sm text-slate-300">Tech Stack</label>
        <div className="flex items-center gap-2">
          <input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const v = techInput.trim();
                if (v) {
                  setTechTags((s) => Array.from(new Set([...s, v])));
                  setTechInput("");
                }
              }
            }}
            placeholder="Add technology and press Enter or click Add"
            className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => {
              const v = techInput.trim();
              if (!v) return;
              setTechTags((s) => Array.from(new Set([...s, v])));
              setTechInput("");
            }}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Add
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {techTags.map((t, i) => (
            <span key={`${t}-${i}`} className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/40 px-3 py-1 text-xs text-slate-200">
              <span>{t}</span>
              <button
                type="button"
                onClick={() => setTechTags((s) => s.filter((x) => x !== t))}
                className="ml-1 text-slate-400 hover:text-white"
                aria-label={`Remove ${t}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Categories</label>
        <div className="flex items-center gap-2">
          <input
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const v = categoryInput.trim();
                if (v) {
                  setCategories((s) => Array.from(new Set([...s, v])));
                  setCategoryInput("");
                }
              }
            }}
            placeholder="Add category and press Enter or click Add"
            className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => {
              const v = categoryInput.trim();
              if (!v) return;
              setCategories((s) => Array.from(new Set([...s, v])));
              setCategoryInput("");
            }}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Add
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c, i) => (
            <span key={`${c}-${i}`} className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/40 px-3 py-1 text-xs text-slate-200">
              <span>{c}</span>
              <button
                type="button"
                onClick={() => setCategories((s) => s.filter((x) => x !== c))}
                className="ml-1 text-slate-400 hover:text-white"
                aria-label={`Remove ${c}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <Input label="Key Features (comma separated)" value={keyFeatures} onChange={setKeyFeatures} />

      <div>
        <label className="mb-2 block text-sm text-slate-300">Highlights</label>
        <textarea
          rows={3}
          value={highlights}
          onChange={(e) => setHighlights(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Short highlights or summary"
        />
      </div>

      <Input label="Git repository URL" value={gitLink} onChange={setGitLink} />
      <Input label="Live site URL" value={liveLink} onChange={setLiveLink} />

      <Input label="Suggested Category" value={suggestedCategory} onChange={setSuggestedCategory} />
      <div>
        <label className="mb-2 block text-sm text-slate-300">Suggested Description</label>
        <textarea
          rows={3}
          value={suggestedDescription}
          onChange={(e) => setSuggestedDescription(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Optional suggested description"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Status</label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3"
        >
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Featured">Featured</option>
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