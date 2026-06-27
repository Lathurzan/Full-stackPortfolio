"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, Sparkles } from "lucide-react";
import { fetchProfile } from "@/services/profile.service";
import { s } from "framer-motion/client";

function ProfileHeaderRole() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchProfile();
        if (!mounted) return;
        const profile = res?.data || res;
        const header = profile?.headerRole || profile?.header_role || null;
        setText(header);
      } catch (err) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return <>{text || "AI/ML-Focused Full-Stack Software Engineer"}</>;
}

function ProfileHero() {
  const [body, setBody] = useState<string | null>(null);
  const [subDescription, setSubDescription] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchProfile();
        if (!mounted) return;
        const profile = res?.data || res;
        setBody(profile?.body || null);
        setSubDescription(profile?.subDescription || null);
      } catch (err) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
        {body ? (
          body
        ) : (
          <>
            Building scalable <span className="gradient-text">AI-powered</span> web applications.
          </>
        )}
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
        {subDescription || (
          <>
            I build production-ready full-stack applications using React,
            Next.js, Node.js, FastAPI, MongoDB, PostgreSQL, and AI integrations.
          </>
        )}
      </p>
    </>
  );
}

function ProfileFocus() {
  const [roleText, setRoleText] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchProfile();
        if (!mounted) return;
        const profile = res?.data || res;
        const r = profile?.role || profile?.role || null;
        setRoleText(r);
      } catch (err) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return <>{roleText || "Full-Stack, Backend & AI Systems"}</>;
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-28 md:px-12 lg:px-24">
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-slate-300">
            <Sparkles className="h-4 w-4 text-blue-400" />
            {/** render saved headerRole if present, otherwise fallback text */}
            <ProfileHeaderRole />
          </div>

          <ProfileHero />

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-500"
            >
              View Projects <ArrowRight className="h-4 w-4" />
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
                  candidates.push(
                    `http://localhost:5001/api/resume`,
                   
                  )
                  candidates.push(`/api/resume`)

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
                      foundUrl = r.url || url
                      break
                    } catch (err) {
                      // try next
                    }
                  }

                  if (!body && !foundUrl) {
                    window.alert("No resume endpoint found (404).")
                    return
                  }

                  let candidate: string | undefined = undefined
                  if (body) {
                    const payload = body?.data ?? body
                    if (Array.isArray(payload?.resumes) && payload.resumes.length) candidate = payload.resumes[0]
                    else if (typeof payload?.resume === "string" && payload.resume) candidate = payload.resume
                    else if (typeof payload?.url === "string" && payload.url) candidate = payload.url
                    else if (typeof body?.resume === "string" && body.resume) candidate = body.resume
                  }

                  if (!candidate && foundUrl) candidate = foundUrl
                  if (!candidate) {
                    window.alert("No resume URL found in API response.")
                    return
                  }

                  let finalUrl = candidate.trim()
                  if (!/^https?:\/\//i.test(finalUrl)) {
                    const origin = apiEnv || window.location.origin
                    if (finalUrl.startsWith("/")) finalUrl = `${origin}${finalUrl}`
                    else finalUrl = `${origin}/uploads/${finalUrl}`
                  }

                  // Try to fetch the file as a blob and force download. If CORS blocks it, fallback to opening the viewer.
                  try {
                    const r = await fetch(finalUrl, { cache: "no-store" })
                    if (!r.ok) throw new Error("Download failed")
                    const blob = await r.blob()
                    const href = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    const filename = (finalUrl.split("/").pop() || "resume.pdf").split("?")[0]
                    a.href = href
                    a.download = filename
                    document.body.appendChild(a)
                    a.click()
                    a.remove()
                    URL.revokeObjectURL(href)
                    return
                  } catch (err) {
                    // fallback: open viewer so user can download from there
                    const viewerUrl = `/viewer?url=${encodeURIComponent(finalUrl)}`
                    window.open(viewerUrl, "_blank")
                    return
                  }
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.error(err)
                  window.alert("Unable to download resume")
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 px-6 py-3 font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Download CV <Download className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto w-full max-w-md lg:max-w-lg"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-500/30 to-violet-500/30 blur-2xl" />

          <div className="relative rounded-[2rem] border border-slate-800 bg-slate-900/70 p-4 shadow-2xl">
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-800">
              <Image
                src="/images/profile/profile.svg"
                alt="Lathurzan Subatharan"
                width={520}
                height={620}
                className="h-[520px] w-full object-cover"
                loading="eager"
                priority
              />
            </div>

            <div className="absolute -bottom-6 left-6 right-6 rounded-2xl border border-slate-800 bg-[#0B0F19]/90 p-5 backdrop-blur-xl">
              <p className="text-sm text-slate-400">Currently focused on</p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                <ProfileFocus />
              </h3>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}