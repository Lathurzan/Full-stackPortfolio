"use client";

import { useEffect, useRef, useState } from "react";

type Work = {
  _id?: string;
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  bullets?: string[];
  location?: string;
  companyWebsite?: string;
  employmentType?: string;
  technologies?: string[];
};

export default function AdminWorkExperiancePage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const empty: Work = { company: "", role: "", startDate: "", endDate: "", description: "", bullets: [] };
  // ensure empty arrays for new fields
  empty.technologies = [];
  const [draft, setDraft] = useState<Work>(empty);
  const companyRef = useRef<HTMLInputElement | null>(null);
  const [newBullet, setNewBullet] = useState("");
  const [newTech, setNewTech] = useState("");

  const API_URL = (process.env.NEXT_PUBLIC_API_URL as string) || "";
  const apiBase = `${API_URL}/work-experiences`;

  const load = async () => {
    setLoading(true);
    try {
  const res = await fetch(apiBase);
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { console.warn("Failed to parse work-experiences response:", e, text.slice(0,200)); }
  const arr = Array.isArray(data) ? data : data?.data ?? [];
  const normalized = arr.map((w: any) => ({
    ...(w || {}),
    bullets: Array.isArray(w?.bullets) ? w.bullets : [],
    technologies: Array.isArray(w?.technologies) ? w.technologies : [],
    location: w?.location ?? "",
    companyWebsite: w?.companyWebsite ?? "",
    employmentType: w?.employmentType ?? "",
  }));
  setWorks(normalized);
    } catch (err) {
  console.error("Failed to load work experiences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startCreate = () => {
    setDraft(empty);
    setEditingIdx(null);
  };

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setDraft({ ...(works[idx] || empty) });
    // focus the company input so the user sees the form is in edit mode
    setTimeout(() => {
      companyRef.current?.focus();
      companyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const save = async () => {
    const payload = { ...draft };
    try {
      if (editingIdx === null) {
        // create
        // client-side validation
        if (!(payload.company && payload.company.toString().trim()) || !(payload.role && payload.role.toString().trim())) {
          alert("Company and Role are required");
          return;
        }

        const res = await fetch(apiBase, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const text = await res.text();
        let data: any = null; try { data = text ? JSON.parse(text) : null; } catch (e) { console.warn("Failed to parse create response:", e, text.slice(0,200)); }

        if (!res.ok) {
          const msg = data?.message || `Server returned ${res.status}`;
          throw new Error(msg);
        }

        if (data?.success === false) {
          throw new Error(data?.message || "Create failed");
        }

        const created = data?.data ?? null;
        if (!created) throw new Error("Create response missing created document");
        setWorks((s) => [...s, created as Work]);
        setDraft(empty);
      } else {
        const id = works[editingIdx]._id || (works[editingIdx] as any).id;
        if (id) {
          // validation
          if (!(payload.company && payload.company.toString().trim()) || !(payload.role && payload.role.toString().trim())) {
            alert("Company and Role are required");
            return;
          }

          const res = await fetch(`${apiBase}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
          const text = await res.text();
          let data: any = null; try { data = text ? JSON.parse(text) : null; } catch (e) { console.warn("Failed to parse update response:", e, text.slice(0,200)); }

          if (!res.ok) {
            const msg = data?.message || `Server returned ${res.status}`;
            throw new Error(msg);
          }

          if (data?.success === false) throw new Error(data?.message || "Update failed");

          const updated = data?.data ?? null;
          if (!updated) throw new Error("Update response missing updated document");
          setWorks((s) => s.map((w, i) => (i === editingIdx ? updated : w)));
          setEditingIdx(null);
          setDraft(empty);
        } else {
          // If item has no id, create a new document and replace the slot
          const res = await fetch(apiBase, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
          const text = await res.text();
          let data: any = null; try { data = text ? JSON.parse(text) : null; } catch (e) { console.warn("Failed to parse replacement create response:", e, text.slice(0,200)); }
          const created = data?.data ?? null;
          if (!created) throw new Error("Failed to create replacement work experience");
          setWorks((s) => s.map((w, i) => (i === editingIdx ? created : w)));
          setEditingIdx(null);
          setDraft(empty);
        }
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const remove = async (idx: number) => {
    if (!confirm("Delete this work experience?")) return;
    const id = works[idx]._id || (works[idx] as any).id;
    if (id) {
      try {
  const res = await fetch(`${apiBase}/${id}`, { method: "DELETE" });
  const text = await res.text();
  let data: any = null; try { data = text ? JSON.parse(text) : null; } catch (e) { console.warn("Failed to parse delete response:", e, text.slice(0,200)); }
  const ok = data?.success ?? res.ok;
  if (ok) setWorks((s) => s.filter((_, i) => i !== idx));
  else console.error("Failed to delete work experience");
      } catch (err) {
        console.error("Delete failed:", err);
      }
    } else {
      // item had no id, remove locally
      setWorks((s) => s.filter((_, i) => i !== idx));
    }
  };

  const addBullet = () => {
    const val = (newBullet || "").trim();
    if (!val) return;
    setDraft((d) => ({ ...d, bullets: [...(d.bullets || []), val] }));
    setNewBullet("");
  };

  const removeBullet = (i: number) => {
    setDraft((d) => ({ ...d, bullets: (d.bullets || []).filter((_, idx) => idx !== i) }));
  };

  const addTech = () => {
    const val = (newTech || "").trim();
    if (!val) return;
    setDraft((d) => ({ ...d, technologies: [...(d.technologies || []), val] }));
    setNewTech("");
  };

  const removeTech = (i: number) => {
    setDraft((d) => ({ ...d, technologies: (d.technologies || []).filter((_, idx) => idx !== i) }));
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Work Experience (Admin)</h1>
        <div>
          <button onClick={startCreate} className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white">New</button>
        </div>
      </div>

      <div className="space-y-6">
        {loading && <div className="text-sm text-slate-400">Loading...</div>}

        {works.map((w, i) => (
          <div key={w._id || (w as any).id || w.company + i} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{w.role} @ {w.company}</div>
                <div className="text-sm text-slate-400">{w.startDate || ""} — {w.endDate || "Present"}</div>
                {(w.location || w.employmentType || w.companyWebsite) ? (
                  <div className="mt-1 text-sm text-slate-400">
                    {w.location ? <span className="mr-2">{w.location}</span> : null}
                    {w.employmentType ? <span className="mr-2">{w.employmentType}</span> : null}
                    {w.companyWebsite ? (
                      <a href={w.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Website</a>
                    ) : null}
                  </div>
                ) : null}
              </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => startEdit(i)} className="text-sm text-blue-400">Edit</button>
                    <button type="button" onClick={() => remove(i)} className="text-sm text-red-400">Delete</button>
                  </div>
            </div>
            {w.description ? <p className="mt-3 text-sm text-slate-300">{w.description}</p> : null}
            {(w.bullets || []).length > 0 && (
              <ul className="mt-3 list-disc pl-5 text-sm text-slate-300">
                {(w.bullets || []).map((b, bi) => <li key={(w._id || (w as any).id || i) + "-b-" + bi}>{b}</li>)}
              </ul>
            )}
          </div>
        ))}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="mb-3 font-semibold">{editingIdx === null ? "Create new work" : "Edit work"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <input ref={companyRef} value={draft.company} onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))} placeholder="Company" className="rounded-xl border border-slate-700 bg-[#0B0F19] px-3 py-2 text-sm" />
            <input value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))} placeholder="Role" className="rounded-xl border border-slate-700 bg-[#0B0F19] px-3 py-2 text-sm" />
              <input value={draft.location} onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))} placeholder="Location" className="rounded-xl border border-slate-700 bg-[#0B0F19] px-3 py-2 text-sm" />
              <input value={draft.companyWebsite} onChange={(e) => setDraft((d) => ({ ...d, companyWebsite: e.target.value }))} placeholder="Company website" className="rounded-xl border border-slate-700 bg-[#0B0F19] px-3 py-2 text-sm" />
              <input value={draft.startDate} onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))} placeholder="Start date" className="rounded-xl border border-slate-700 bg-[#0B0F19] px-3 py-2 text-sm" />
              <input value={draft.endDate} onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))} placeholder="End date" className="rounded-xl border border-slate-700 bg-[#0B0F19] px-3 py-2 text-sm" />
              <input value={draft.employmentType} onChange={(e) => setDraft((d) => ({ ...d, employmentType: e.target.value }))} placeholder="Employment type (e.g. Full-time)" className="col-span-2 rounded-xl border border-slate-700 bg-[#0B0F19] px-3 py-2 text-sm" />
              <textarea value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Short description" className="col-span-2 min-h-[80px] rounded-xl border border-slate-700 bg-[#0B0F19] px-3 py-2 text-sm" />
          </div>

          <div className="mt-3">
            <div className="mb-2 flex items-center gap-2">
              <input value={newBullet} onChange={(e) => setNewBullet(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBullet(); } }} placeholder="Add bullet and press Enter" className="flex-1 rounded-xl border border-slate-700 bg-[#0B0F19] px-3 py-2 text-sm" />
              <button onClick={addBullet} className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(draft.bullets || []).map((b, i) => (
                <span key={`d-${i}`} className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-sm">
                  {b}
                  <button onClick={() => removeBullet(i)} className="text-xs text-red-400">x</button>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-400 mb-2">Technologies used</label>
            <div className="mb-2 flex items-center gap-2">
              <input value={newTech} onChange={(e) => setNewTech(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }} placeholder="Add technology and press Enter" className="flex-1 rounded-xl border border-slate-700 bg-[#0B0F19] px-3 py-2 text-sm" />
              <button onClick={addTech} className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(draft.technologies || []).map((t, i) => (
                <span key={`tech-${i}`} className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-sm">
                  {t}
                  <button onClick={() => removeTech(i)} className="text-xs text-red-400">x</button>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button onClick={save} className="rounded-full bg-green-600 px-4 py-2 text-sm text-white">Save</button>
            <button onClick={() => { setDraft(empty); setEditingIdx(null); }} className="rounded-full bg-slate-700 px-4 py-2 text-sm text-white">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
