"use client";

import React, { useEffect, useState } from "react";
import {
  uploadResume,
  getResume,
  deleteResume,
} from "../../../services/resume.services";

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadResume = async () => {
    try {
      const url = await getResume();
      setResumeUrl(url);
    } catch {
      setResumeUrl(null);
    }
  };

  useEffect(() => {
    loadResume();
  }, []);

  const apiEnv = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
  const apiBase = apiEnv.replace(/\/$/, "");
  const proxySrc = apiBase.endsWith("/api") ? `${apiBase}/resume/proxy` : `${apiBase}/api/resume/proxy`;


  const handleUpload = async () => {
    if (!file) {
      setError("Please select PDF file");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await uploadResume(file);

      await loadResume();

      setFile(null);

    } catch (err:any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async () => {
    try {

      setLoading(true);

      await deleteResume();

      setResumeUrl(null);

    } catch(err:any){

      setError(err.message || "Delete failed");

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-5">
        Resume Management
      </h1>


      <input
        type="file"
        accept="application/pdf"
        onChange={(e)=>
          setFile(e.target.files?.[0] || null)
        }
      />


      <div className="mt-4 flex gap-3">

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>


        <button
          onClick={handleDelete}
          disabled={loading}
          className="border px-4 py-2 rounded"
        >
          Delete
        </button>

      </div>


      {error && (
        <p className="text-red-500 mt-3">
          {error}
        </p>
      )}



      {resumeUrl && (

        <div className="mt-8">

          <p className="mb-3">Current Resume</p>

          <div className="mb-2">
            <a
              href={resumeUrl || proxySrc}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline text-blue-600"
            >
              Open in new tab
            </a>
          </div>

          <iframe
            src={proxySrc}
            className="w-full h-[700px] border"
            title="Resume"
          />

        </div>

      )}

    </div>
  );
}