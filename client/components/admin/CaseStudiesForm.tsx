"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { caseStudyService } from "@/services/caseStudy.service";
import { projectService } from "@/services/project.service";
import { blogService } from "@/services/blog.service";

export default function CaseStudiesForm({ initial }: { initial?: any } = {}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [overview, setOverview] = useState("");
  const [description, setDescription] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [architecture, setArchitecture] = useState("");
  const [challenges, setChallenges] = useState("");
  const [results, setResults] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [layout, setLayout] = useState<"left" | "right">("right");

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"upload" | "choose">("upload");
  const [pasteUrl, setPasteUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [existingImages, setExistingImages] = useState<Array<{ url: string; source: string; id?: string }>>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [selectedExistingUrl, setSelectedExistingUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initial) return;

    setTitle(initial.title || "");
    setSlug(initial.slug || "");
  setOverview(initial.overview || initial.description || "");
  setDescription(initial.description || initial.overview || "");
    setProblem(initial.problem || "");
    setSolution(initial.solution || "");
    setArchitecture(initial.architecture || "");
    setChallenges(initial.challenges || "");
    setResults(initial.results || "");

    setTechnologies(
      Array.isArray(initial.technologies)
        ? initial.technologies
        : Array.isArray(initial.stack)
        ? initial.stack
        : initial.technologies
        ? initial.technologies.toString().split(",").map((t: string) => t.trim()).filter(Boolean)
        : []
    );

    setGithubUrl(initial.githubUrl || "");
    setLiveDemoUrl(initial.liveDemoUrl || "");
    setImagePreview(initial.image || null);
  setLayout(initial.layout === "left" ? "left" : "right");

    return () => {
      // revoke any objectURL created previously
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  useEffect(() => {
    // cleanup object URL when component unmounts or preview changes
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    // revoke previous preview
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedFile(file);
  setSelectedExistingUrl(null);
    setImagePreview(URL.createObjectURL(file));
  };

  const openFileDialog = () => {
    setPickerMode("upload");
    setShowImagePicker(true);
    // trigger click on hidden input
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const chooseExisting = () => {
    setPickerMode("choose");
    setShowImagePicker(true);
  };

  const loadExistingImages = async () => {
    if (existingImages.length > 0) return; // already loaded
    setLoadingExisting(true);
    try {
      const [projRes, blogRes, csRes] = await Promise.all([
        projectService.getAll().catch(() => null),
        blogService.getAll().catch(() => null),
        caseStudyService.getAll().catch(() => null),
      ]);

      const norm = (img?: string | null) => {
        if (!img) return undefined;
        if (img.startsWith("/uploads")) {
          const base = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
          return base + img;
        }
        return img;
      };

      const items: Array<{ url: string; source: string; id?: string }> = [];

      const pushFrom = (list: any, source: string) => {
        if (!list) return;
        const arr = list?.data ?? list ?? [];
        for (const it of arr) {
          const url = norm(it?.image);
          const id = it?._id || it?.id;
          if (url) items.push({ url, source, id });
        }
      };

      pushFrom(projRes, "project");
      pushFrom(blogRes, "blog");
      pushFrom(csRes, "casestudy");

      // dedupe by url
      const map = new Map<string, { url: string; source: string; id?: string }>();
      for (const it of items) map.set(it.url, it);

      setExistingImages(Array.from(map.values()));
    } catch (err) {
      console.warn("Failed to load existing images", err);
    } finally {
      setLoadingExisting(false);
    }
  };

  const applyExistingUrl = (url: string) => {
    // clear any selected file
    setSelectedFile(null);
  setSelectedExistingUrl(url || null);
  setImagePreview(url || null);
    setShowImagePicker(false);
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (saving) return;
    setSaving(true);

    try {
      let imageUrl = initial?.image || null;

      // If the user picked an existing URL from gallery/paste, prefer it unless they selected a new file
      if (selectedExistingUrl && !selectedFile) {
        imageUrl = selectedExistingUrl;
      }

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl =
          uploadRes?.data?.secure_url ||
          uploadRes?.data?.url ||
          uploadRes?.data?.data?.url ||
          imageUrl;
      }

      // ensure description is populated (server expects `description` field)
      const finalDescription = description || overview || "";

      // if slug is empty, generate a safe slug from title
      const finalSlug = (slug || "").toString().trim() ||
        title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

      const payload: any = {
        title,
        slug: finalSlug,
        overview,
        description: finalDescription,
        problem,
        solution,
        architecture,
        challenges,
        results,
  technologies: technologies,
  stack: technologies,
        githubUrl,
        liveDemoUrl,
        image: imageUrl,
  layout,
      };

      const existingId = initial?.id || initial?._id;

      let res;
      if (existingId) {
        res = await caseStudyService.update(existingId, payload);
      } else {
        res = await caseStudyService.create(payload);
      }

      // success - update local state with returned data and stay on page
      if (res?.data) {
        const d = res.data;
        setTitle(d.title || title);
        setSlug(d.slug || slug);
        setOverview(d.overview || d.description || overview);
        setDescription(d.description || d.overview || description);
        setProblem(d.problem || problem);
        setSolution(d.solution || solution);
        setArchitecture(d.architecture || architecture);
        setChallenges(d.challenges || challenges);
        setResults(d.results || results);
        const newTechs = Array.isArray(d.stack) ? d.stack : Array.isArray(d.technologies) ? d.technologies : [];
        setTechnologies(newTechs);
        setImagePreview(d.image || imagePreview);
      }
      setSuccessMessage("Saved");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      // keep it simple: log + alert
      // server errors should be inspected in console
      // you can replace alert with your toast/notification system
      // eslint-disable-next-line no-console
      console.error("Failed to save case study:", error);
      alert("Failed to save case study. See console for details.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 text-sm text-slate-100";

  return (
    <form
      onSubmit={handleSave}
      className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
    >
      <label className="mb-2 block text-sm text-slate-400">Title</label>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={inputClass}
      />
      <label className="mb-2 block text-sm text-slate-400">Slug</label>

      <input
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className={inputClass}
      />
      <label className="mb-2 block text-sm text-slate-400">Overview</label>

      <textarea
        rows={4}
        placeholder="Overview"
        value={overview}
        onChange={(e) => setOverview(e.target.value)}
        className={inputClass}
      />
      <label className="mb-2 block text-sm text-slate-400">Problem</label>

      <textarea
        rows={4}
        placeholder="Problem"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
        className={inputClass}
      />
      <label className="mb-2 block text-sm text-slate-400">Solution</label>

      <textarea
        rows={4}
        placeholder="Solution"
        value={solution}
        onChange={(e) => setSolution(e.target.value)}
        className={inputClass}
      />
      <label className="mb-2 block text-sm text-slate-400">Architecture</label>

      <textarea
        rows={4}
        placeholder="Architecture"
        value={architecture}
        onChange={(e) => setArchitecture(e.target.value)}
        className={inputClass}
      />
      <label className="mb-2 block text-sm text-slate-400">Challenges</label>

      <textarea
        rows={4}
        placeholder="Challenges"
        value={challenges}
        onChange={(e) => setChallenges(e.target.value)}
        className={inputClass}
      />
      <label className="mb-2 block text-sm text-slate-400">Results</label>


      <textarea
        rows={4}
        placeholder="Results"
        value={results}
        onChange={(e) => setResults(e.target.value)}
        className={inputClass}
      />
      <label className="mb-2 block text-sm text-slate-400">Technologies</label>

      <div>
        <label className="mb-2 block text-sm text-slate-400">Technologies</label>
        <div className="flex gap-2">
          <input
            placeholder="Add technology"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            className={inputClass + " flex-1"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const val = techInput.trim();
                if (val && !technologies.includes(val)) {
                  setTechnologies([...technologies, val]);
                }
                setTechInput("");
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const val = techInput.trim();
              if (!val) return;
              if (!technologies.includes(val)) setTechnologies([...technologies, val]);
              setTechInput("");
            }}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white"
          >
            Add
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span key={tech} className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => setTechnologies(technologies.filter((t) => t !== tech))}
                className="ml-1 rounded-full bg-slate-800 px-2 py-0.5 text-xs"
                aria-label={`Remove ${tech}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
      <label className="mb-2 block text-sm text-slate-400">GitHub URL</label>

      <input
        placeholder="GitHub URL"
        value={githubUrl}
        onChange={(e) => setGithubUrl(e.target.value)}
        className={inputClass}
      />
      <label className="mb-2 block text-sm text-slate-400">Live Demo URL</label>

      <input
        placeholder="Live Demo URL"
        value={liveDemoUrl}
        onChange={(e) => setLiveDemoUrl(e.target.value)}
        className={inputClass}
      />
      <div className="mt-4">
        <label className="mb-2 block text-sm text-slate-400">Layout</label>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="radio" name="layout" value="left" checked={layout === "left"} onChange={() => setLayout("left")} />
            <span className="text-slate-200">Image left</span>
          </label>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="radio" name="layout" value="right" checked={layout === "right"} onChange={() => setLayout("right")} />
            <span className="text-slate-200">Image right</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <button type="button" onClick={openFileDialog} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
            📁 Upload New Image
          </button>

          <button type="button" onClick={chooseExisting} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
            🖼 Choose Existing Image
          </button>
        </div>

        {showImagePicker && pickerMode === "choose" && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <input value={pasteUrl} onChange={(e) => setPasteUrl(e.target.value)} placeholder="Paste image URL" className={inputClass} />
              <button type="button" onClick={() => applyExistingUrl(pasteUrl)} className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white">Apply</button>
              <button
                type="button"
                onClick={loadExistingImages}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200"
              >
                Refresh Gallery
              </button>
            </div>

            <div className="mt-3">
              {loadingExisting ? (
                <div className="text-sm text-slate-400">Loading images…</div>
              ) : existingImages.length === 0 ? (
                <div className="text-sm text-slate-400">No existing images found. Use Upload or paste a URL.</div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {existingImages.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => applyExistingUrl(img.url)}
                      className="overflow-hidden rounded-md border border-slate-700 p-0"
                      title={`Select from ${img.source}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.source} className="h-24 w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
      </div>

      {imagePreview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imagePreview}
          alt="Preview"
          className="h-64 w-full rounded-xl object-cover"
        />
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="relative inline-flex items-center gap-3 rounded-full bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {saving ? (
            <span className="flex h-5 w-5 items-center justify-center">
              <span className="animate-[spin_1s_linear_infinite] rounded-full h-4 w-4 border-t-2 border-white" />
            </span>
          ) : null}
          {saving ? "Saving..." : "Save Case Study"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/casestudies")}
          className="rounded-full border border-slate-700 px-6 py-3 text-sm text-slate-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}