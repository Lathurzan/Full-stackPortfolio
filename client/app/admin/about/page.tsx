"use client";

import React, { useEffect, useState } from "react";
import { fetchAbout, updateAbout } from "../../../services/about.service";

export default function AdminAboutPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchAbout();
        if (!mounted) return;
        if (res.data) {
          setTitle(res.data.title || "");
          setBody(res.data.body || "");
    if (res.data.image) setPreview(res.data.image);
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      let imageUrl: string | undefined = undefined;
      if (selectedFile) {
        const fd = new FormData();
        fd.append("file", selectedFile);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        const upj = await up.json();
        imageUrl = upj?.data?.url || upj?.url || upj?.data?.secure_url || upj?.secure_url;
      }

      const res = await updateAbout({ title: title || undefined, body, image: imageUrl });
      setMessage(res.message || "Saved");
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setSelectedFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  return (
    <section className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-2xl font-bold">About (Admin)</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Body</label>
            <textarea
              className="w-full rounded-md border px-3 py-2"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <input type="file" accept="image/*" onChange={onFileChange} />
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" className="mt-3 max-h-48 rounded-md object-cover" />
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              className="rounded bg-blue-600 px-4 py-2 text-white"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>

            {message && <p className="text-sm text-slate-400">{message}</p>}
          </div>
        </form>
      </div>
    </section>
  );
}
