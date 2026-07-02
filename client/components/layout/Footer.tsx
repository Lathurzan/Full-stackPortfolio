"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { fetchLinks } from "@/services/links.service";

export default function Footer() {
  const [links, setLinks] = useState<Record<string, string>>({});
  const [customLinks, setCustomLinks] = useState<Array<{ name: string; url: string; icon?: string }>>([]);
  const [title, setTitle] = useState<string>("Lathurzan");
  const [headerRole, setHeaderRole] = useState<string>("Software Engineer | Machine Learning Developer");
  const [subDescription, setSubDescription] = useState<string>(
    "I enjoy building scalable web applications, machine learning models and AI-powered solutions."
  );
  const [email, setEmail] = useState<string>("lathulathurzan@gmail.com");
  

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchLinks?.();
        const data = res?.data || res || null;
        if (!mounted) return;
        if (data && typeof data === "object") {
          const incomingLinks = (data as any)?.data?.links ?? (data as any)?.links ?? {};
          setLinks(incomingLinks || {});
          const incomingTitle = (data as any)?.data?.title ?? (data as any)?.title ?? undefined;
          if (incomingTitle) setTitle(String(incomingTitle));
          const incomingHeaderRole = (data as any)?.data?.headerRole ?? (data as any)?.headerRole ?? undefined;
          if (incomingHeaderRole) setHeaderRole(String(incomingHeaderRole));
          const incomingSub = (data as any)?.data?.subDescription ?? (data as any)?.subDescription ?? undefined;
          if (incomingSub) setSubDescription(String(incomingSub));
          const incomingEmail = (data as any)?.data?.email ?? (data as any)?.email ?? undefined;
          if (incomingEmail) setEmail(String(incomingEmail));
          const maybeCustom = (data as any)?.data?.customLinks ?? (data as any)?.customLinks ?? (data as any)?.custom;
          if (Array.isArray(maybeCustom)) setCustomLinks(maybeCustom);
        }
      } catch (err) {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Note: rendering plain text links instead of icon images per design request

  return (
    <footer className="border-t border-slate-800 bg-[#0B0F19] px-6 py-12">
      <div className="mx-auto max-w-7xl">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 md:gap-x-12">
          {/* Left: name and intro */}
          <div>
            <h3 className="text-2xl font-semibold">{title}</h3>
            <div className="mt-1 text-sm text-slate-300">{headerRole}</div>
            <p className="mt-4 text-sm text-slate-400 max-w-sm">
              {subDescription}
            </p>
          </div>

          {/* Middle: Explore + Professional */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-medium text-slate-200">Explore</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/about" className="text-slate-400 hover:text-white">About</Link>
                </li>
                <li>
                  <Link href="/projects" className="text-slate-400 hover:text-white">Projects</Link>
                </li>
                <li>
                  <Link href="/experience" className="text-slate-400 hover:text-white">Experience</Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-400 hover:text-white">Contact</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-200">Professional</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {links.github ? (
                  <li>
                    <a href={links.github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                      GitHub
                    </a>
                  </li>
                ) : null}

                {links.linkedin ? (
                  <li>
                    <a href={links.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                      LinkedIn
                    </a>
                  </li>
                ) : null}

                {links.kaggle ? (
                  <li>
                    <a href={links.kaggle} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                      Kaggle
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>

          {/* Right: Let's Connect + Tech */}
          <div>
            <h4 className="text-sm font-medium text-slate-200">Let's Connect</h4>
            <ul className="mt-4 space-y-3 text-sm">
              {email ? (
                <li>
                  <a href={`mailto:${email}`} className="text-slate-400 hover:text-white">
                    Email
                  </a>
                </li>
              ) : null}

              {links.instagram ? (
                <li>
                  <a href={links.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                    Instagram
                  </a>
                </li>
              ) : null}
              {links.youtube ? (
                <li>
                  <a href={links.youtube} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                    YouTube
                  </a>
                </li>
              ) : null}
             </ul>
          </div>
        </div>

  <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-400 text-center">© 2026 All rights reserved.</div>

      </div>
    </footer>
  );
}