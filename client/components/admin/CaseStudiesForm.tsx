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
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [architecture, setArchitecture] = useState("");
  const [challenges, setChallenges] = useState("");
  const [results, setResults] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");

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

  useEffect(() => {
    if (!initial) return;

    setTitle(initial.title || "");
    setSlug(initial.slug || "");
    setOverview(initial.overview || "");
    setProblem(initial.problem || "");
    setSolution(initial.solution || "");
    setArchitecture(initial.architecture || "");
    setChallenges(initial.challenges || "");
    setResults(initial.results || "");

    setTechnologies(
      Array.isArray(initial.technologies)
        ? initial.technologies.join(", ")
        : initial.technologies || ""
    );

    setGithubUrl(initial.githubUrl || "");
    setLiveDemoUrl(initial.liveDemoUrl || "");
    setImagePreview(initial.image || null);

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

      const payload: any = {
        title,
        slug,
        overview,
        problem,
        solution,
        architecture,
        challenges,
        results,
        technologies: Array.isArray(technologies)
          ? technologies
          : (technologies || "")
              .toString()
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
        githubUrl,
        liveDemoUrl,
        image: imageUrl,
      };

      const existingId = initial?.id || initial?._id;

      let res;
      if (existingId) {
        res = await caseStudyService.update(existingId, payload);
      } else {
        res = await caseStudyService.create(payload);
      }

      // success - navigate back to admin list (or refresh)
      router.push("/admin/casestudies");
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
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={inputClass}
      />

      <input
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className={inputClass}
      />

      <textarea
        rows={4}
        placeholder="Overview"
        value={overview}
        onChange={(e) => setOverview(e.target.value)}
        className={inputClass}
      />

      <textarea
        rows={4}
        placeholder="Problem"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
        className={inputClass}
      />

      <textarea
        rows={4}
        placeholder="Solution"
        value={solution}
        onChange={(e) => setSolution(e.target.value)}
        className={inputClass}
      />

      <textarea
        rows={4}
        placeholder="Architecture"
        value={architecture}
        onChange={(e) => setArchitecture(e.target.value)}
        className={inputClass}
      />

      <textarea
        rows={4}
        placeholder="Challenges"
        value={challenges}
        onChange={(e) => setChallenges(e.target.value)}
        className={inputClass}
      />

      <textarea
        rows={4}
        placeholder="Results"
        value={results}
        onChange={(e) => setResults(e.target.value)}
        className={inputClass}
      />

      <input
        placeholder="Technologies (comma separated)"
        value={technologies}
        onChange={(e) => setTechnologies(e.target.value)}
        className={inputClass}
      />

      <input
        placeholder="GitHub URL"
        value={githubUrl}
        onChange={(e) => setGithubUrl(e.target.value)}
        className={inputClass}
      />

      <input
        placeholder="Live Demo URL"
        value={liveDemoUrl}
        onChange={(e) => setLiveDemoUrl(e.target.value)}
        className={inputClass}
      />

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