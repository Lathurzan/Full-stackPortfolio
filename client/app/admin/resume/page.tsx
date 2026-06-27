"use client"

import React, { useEffect, useState } from "react"
import { uploadResume, getResume, deleteResume } from "../../../services/resume.services"
import ViewerClient from "@/components/ViewerClient"

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const f = e.target.files?.[0] ?? null
    setFile(f)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Select a file first")
      return
    }

    const fd = new FormData()
    fd.append("file", file)

      try {
        setUploading(true)
        const resumeUrl = await uploadResume(file)

        // re-fetch persisted resume from server to ensure DB saved value
        const persisted = await getResume()
        const backendApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
        const backendOrigin = backendApi.replace(/\/api\/?$/, "")
        let candidate = persisted || resumeUrl
        const normalized = normalizeUrl(candidate, backendOrigin)
        if (normalized) setUploadedUrl(normalized)
    } catch (err: any) {
      setError(err?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  // Fetch persisted resume on mount
  useEffect(() => {
    let mounted = true
    const fetchResume = async () => {
      try {
        const resumeUrl = await getResume()
        const backendApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
        const backendOrigin = backendApi.replace(/\/api\/?$/, "")
        const normalized = normalizeUrl(resumeUrl, backendOrigin)
        if (mounted && normalized) setUploadedUrl(normalized)
      } catch (e) {
        // ignore - not critical
      }
    }

    fetchResume()
    return () => {
      mounted = false
    }
  }, [])

  // helper: normalize candidate URL or filename into absolute URL or null
  function normalizeUrl(candidate: unknown, backendOrigin: string) {
    if (!candidate || typeof candidate !== "string") return null
    let s = candidate.trim()
    if (!s || s.toLowerCase() === "resume") return null
    // already absolute
    if (/^https?:\/\//i.test(s)) return s
    // cloudinary raw upload pattern - treat as absolute if it contains that
    if (s.includes("res.cloudinary.com")) return s
    // starts with slash -> prefix host
    if (s.startsWith("/")) return `${backendOrigin}${s}`
    // bare filename -> assume uploads folder
    return `${backendOrigin}/uploads/${s}`
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Upload Resume</h1>

      <div className="space-y-4 max-w-xl">
        <label className="block">
          <span className="sr-only">Choose resume</span>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-slate-900 text-white rounded disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button
            onClick={async () => {
              setError(null)
              try {
                setUploading(true)
                await deleteResume()
                setUploadedUrl(null)
                setFile(null)
              } catch (e: any) {
                setError(e?.message || "Delete failed")
              } finally {
                setUploading(false)
              }
            }}
            className="px-3 py-2 border rounded"
          >
            Delete
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {uploadedUrl && (
          <div className="mt-4 bg-slate-800 p-4 rounded">
            <p className="text-sm text-slate-300">Uploaded file</p>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1 text-white underline"
            >
              Open uploaded file
            </a>

            {/* preview for Cloudinary raw/pdf or image */}
            {uploadedUrl.includes("/raw/upload/") ? (
              // Cloudinary raw uploads may not expose .pdf extension; use Google Docs viewer for reliable PDF rendering
              <iframe
                src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
                  uploadedUrl
                )}`}
                className="w-full h-[600px] mt-4 bg-white"
                title="Resume preview"
              />
            ) : (
              <img src={uploadedUrl} alt="resume" className="w-full mt-4" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
