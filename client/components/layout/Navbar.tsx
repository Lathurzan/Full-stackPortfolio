"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import React, { useState } from "react";

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.744.083-.729.083-.729 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.775.418-1.305.76-1.604-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.98-.399 3-.405 1.02.006 2.043.139 3 .405 2.29-1.553 3.297-1.23 3.297-1.23.655 1.653.243 2.874.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.624-5.475 5.92.43.372.815 1.102.815 2.222 0 1.606-.015 2.903-.015 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 24h5V8H0v16zM8 8h4.8v2.16h.07c.67-1.26 2.3-2.58 4.73-2.58C22.6 7.58 24 10 24 14.1V24h-5v-8.4c0-2 0-4.56-2.77-4.56-2.77 0-3.2 2.16-3.2 4.4V24H8V8z" />
    </svg>
  );
}

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Case Studies", href: "/case-studies" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Lathurzan<span className="text-blue-500">.</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="https://github.com/Lathurzan" target="_blank" aria-label="GitHub">
            <GitHubIcon className="h-5 w-5 text-slate-300 hover:text-white" />
          </Link>

          <Link
            href="https://linkedin.com/in/lathurzan-subatharan"
            target="_blank"
            aria-label="LinkedIn"
          >
            <LinkedInIcon className="h-5 w-5 text-slate-300 hover:text-white" />
          </Link>

          <button
            onClick={async (e) => {
              e.preventDefault()
              try {
                const apiEnv = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")
                const candidates: string[] = []
                if (apiEnv) {
                  candidates.push(`${apiEnv}/resume`)
                  if (!/\/api(\/|$)/.test(apiEnv)) candidates.push(`${apiEnv}/api/resume`)
                }
                // common local dev fallbacks (backend often runs on 5001 or 5000)
                candidates.push(
                  `http://localhost:5001/api/resume`,
                )
                // try common relative endpoints last (these hit Next.js if no backend)
                candidates.push(`/resume`)

                let body: any = null
                let foundUrl: string | null = null
                for (const url of candidates) {
                  try {
                    const r = await fetch(url, { cache: "no-store" })
                    if (!r.ok) continue
                    const ct = r.headers.get("content-type") || ""
                    if (ct.includes("application/json")) {
                      body = await r.json()
                      break
                    }
                    // if it's not JSON, assume it's a direct file/blob; use response.url if available
                    foundUrl = r.url || url
                    break
                  } catch (e) {
                    // try next
                  }
                }

                if (!body && !foundUrl) {
                  window.alert("No resume endpoint found (404).")
                  return
                }

                let candidate: string | undefined = undefined
                if (body) {
                  // project responses are wrapped: { success, message, data }
                  const payload = body?.data ?? body
                  if (Array.isArray(payload?.resumes) && payload.resumes.length) candidate = payload.resumes[0]
                  else if (typeof payload?.resume === "string" && payload.resume) candidate = payload.resume
                  else if (typeof payload?.url === "string" && payload.url) candidate = payload.url
                  // backward-compat: some endpoints may return { resume } at top-level
                  else if (typeof body?.resume === "string" && body.resume) candidate = body.resume
                }

                // if endpoint returned a file URL directly (non-JSON) use that
                if (!candidate && foundUrl) candidate = foundUrl

                if (!candidate) {
                  window.alert("No resume URL found in API response.")
                  return
                }

                // normalize candidate to absolute URL
                let finalUrl = candidate.trim()
                if (!/^https?:\/\//i.test(finalUrl)) {
                  const origin = apiEnv || window.location.origin
                  if (finalUrl.startsWith("/")) finalUrl = `${origin}${finalUrl}`
                  else finalUrl = `${origin}/uploads/${finalUrl}`
                }

                // open a viewer route in the Next app which embeds the resume for inline viewing
                const viewerUrl = `/viewer?url=${encodeURIComponent(finalUrl)}`
                window.open(viewerUrl, "_blank")
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err)
                window.alert("Unable to open resume")
              }
            }}
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Resume
          </button>
        </div>

        <button className="md:hidden">
          <Menu className="h-6 w-6" />
        </button>
      </nav>
    </header>
  );
}