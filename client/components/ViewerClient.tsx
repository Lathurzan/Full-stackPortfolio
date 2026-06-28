"use client"

import React from "react"

interface Props {
  url: string
}


function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(url)
}

export default function ViewerClient({ url }: Props) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Resume Preview</h1>
            <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline hover:text-blue-400"
          >
            Open Original
          </a>
        </div>

        <div className="rounded-lg bg-white overflow-hidden">
          {isImageUrl(url) ? (
            <img
              src={url}
              alt="Resume"
              className="mx-auto max-h-[90vh] w-auto object-contain"
            />
          ) : (
            // ✅ Always use proxy URL — never hit Cloudinary directly
          <iframe
  src={url}
  title="Resume Preview"
  className="h-[90vh] w-full"
/>
          )}
        </div>
      </div>
    </div>
  )
}