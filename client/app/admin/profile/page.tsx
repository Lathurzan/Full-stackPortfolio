"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { fetchAbout, updateAbout } from "@/services/about.service";
import { api } from "@/services/api";

export default function AdminProfilePage() {
  const [preview, setPreview] = useState<string | null>(
    "/images/profile/profile.svg"
  );

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("Lathurzan Subatharan");
  const [role, setRole] = useState(
    "AI/ML-Focused Full-Stack Software Engineer"
  );
  const [desc, setDesc] = useState(
    "I build production-ready full-stack applications using React, Next.js, Node.js, FastAPI, MongoDB, PostgreSQL, and AI integrations."
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
    setSelectedFile(file);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSave = async () => {
    setSaving(true);

    // show spinner for at least 1s
    const delay = new Promise((res) => setTimeout(res, 1000));

    // attempt upload if a file is selected
    let imageUrl = null;
    if (selectedFile) {
      try {
        const form = new FormData();
        form.append("file", selectedFile);

        const res = await api.post("/upload", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = res?.data?.data?.url || null;

        // normalize uploaded url: if server returned a relative path, prefix API base
        if (imageUrl && imageUrl.startsWith("/uploads")) {
          const base = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
          imageUrl = base + imageUrl;
        }

        // update preview immediately so user sees uploaded image
        if (imageUrl) setPreview(imageUrl);
      } catch (err) {
        // upload failed or backend not running; keep preview as-is
        console.warn("upload failed", err);
      }
    }

    // save about info using about service (graceful if backend missing)
    try {
      const payload = { title: name, body: desc } as any;
      if (imageUrl) payload.image = imageUrl;
      const resp = await updateAbout(payload);
      if (!resp || !resp.success) {
        console.warn("updateAbout did not succeed", resp);
      }
    } catch (err) {
      console.warn("updateAbout failed", err);
    }

    await delay;
    // refetch after save to pick up persisted data
    try {
      const res = await fetchAbout();
      if (res?.data) {
        setName(res.data.title || name);
        setDesc(res.data.body || desc);
        if (res.data.image) {
          // normalize image URL: if backend returned a relative uploads path, prefix API base
          const img: string = res.data.image;
          if (img.startsWith("/uploads")) {
            const base = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
            setPreview(base + img);
          } else {
            setPreview(img);
          }
        }
      }
    } catch (err) {
      // ignore
    }

    setSaving(false);
  };

  // fetch existing about on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchAbout();
        if (!mounted) return;
        if (res.data) {
          setName(res.data.title || "Lathurzan Subatharan");
          setDesc(res.data.body || desc);
          if (res.data.image) {
            const img: string = res.data.image;
            if (img.startsWith("/uploads")) {
              const base = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
              setPreview(base + img);
            } else {
              setPreview(img);
            }
          }
        }
      } catch (err) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Profile Settings</h1>

      <div className="grid gap-8 lg:grid-cols-2">
          <form className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6" onSubmit={(e)=>e.preventDefault()}>
          <Input label="Full Name" defaultValue={name} onChange={(v)=>setName(v)} />

          <Input label="Role" defaultValue={role} onChange={(v)=>setRole(v)} />

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Hero Description
            </label>
            <textarea
              rows={5}
              value={desc}
              onChange={(e)=>setDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 text-slate-300"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="relative inline-flex items-center gap-3 rounded-full bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500"
            disabled={saving}
          >
            {saving ? (
              <span className="flex h-5 w-5 items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
              </span>
            ) : null}
            Save Profile
          </button>
        </form>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-6 text-xl font-semibold">Preview</h2>

          <div className="overflow-hidden rounded-2xl border border-slate-800">
          {preview?.startsWith("blob:") || preview?.startsWith("http") || preview?.startsWith("https") ? (
              // Use native img for blob previews and external URLs (Cloudinary) to avoid
              // Next/Image server-side optimizer fetching remote resources which can fail
              // in some dev setups and return 400. Local static images still use Next/Image.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Profile preview"
                className="h-[500px] w-full object-cover"
              />
            ) : (
              <Image
                src={preview || "/images/profile/profile.svg"}
                alt="Profile preview"
                width={500}
                height={600}
                className="h-[500px] w-full object-cover"
                loading="eager"
              />
            )}
          </div>

          <div className="mt-6">
      <h3 className="text-2xl font-bold">{name}</h3>
      <p className="mt-2 text-slate-400">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  defaultValue,
  onChange,
}: {
  label: string;
  defaultValue: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      <input
        value={defaultValue}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 text-white outline-none focus:border-blue-500"
      />
    </div>
  );
}