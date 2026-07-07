"use client";

import { useEffect, useState } from "react";
import { skillService } from "@/services/skill.service";

export default function AdminSkillsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newItems, setNewItems] = useState<Record<number, string>>({});

  const addGroup = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await skillService.create({ category: newCategory.trim(), items: [] });
      const created = res?.data ?? res;
      if (created) {
        setGroups((s) => [...s, created]);
        setNewCategory("");
      }
    } catch (err) {
      console.error(err);
      // fallback to local add
      setGroups((s) => [...s, { category: newCategory.trim(), items: [] }]);
      setNewCategory("");
    }
  };

  const addItem = (groupIndex: number) => {
    const val = (newItems[groupIndex] || "").trim();
    if (!val) return;
    setGroups((s) => {
      const copy = [...s];
      // avoid duplicates
      if (!Array.isArray(copy[groupIndex].items)) copy[groupIndex].items = [];
      if (copy[groupIndex].items.includes(val)) return copy;
      copy[groupIndex].items = [...copy[groupIndex].items, val];
      return copy;
    });
    setNewItems((m) => {
      const copy = { ...m };
      delete copy[groupIndex];
      return copy;
    });
  };

  const saveGroup = async (gIdx: number) => {
    const g = groups[gIdx];
    if (!g) return;
    const payload = { category: g.category, items: Array.isArray(g.items) ? g.items : [] };
    try {
      const id = (g._id || g.id) ?? null;
      if (id) {
        await skillService.update(id, payload);
      } else {
        const res = await skillService.create(payload);
        const created = res?.data ?? res;
        if (created) {
          // replace the local group with the created result (to pick up _id)
          setGroups((s) => s.map((item, i) => (i === gIdx ? created : item)));
        }
      }
    } catch (err) {
      console.error("Failed to save group", err);
    }
  };

  const removeGroup = (gIdx: number) => {
    if (!confirm("Delete this category and all its items? This cannot be undone.")) return;
  const id = (groups[gIdx] && (groups[gIdx]._id || groups[gIdx].id)) ?? null;
  if (id) {
      skillService.delete(id).then((res) => {
        const ok = res?.success ?? !!res;
        if (ok) setGroups((s) => s.filter((_, i) => i !== gIdx));
      }).catch(() => {
        setGroups((s) => s.filter((_, i) => i !== gIdx));
      });
    } else {
      setGroups((s) => s.filter((_, i) => i !== gIdx));
    }
  };

  const removeItem = (gIdx: number, idx: number) => {
    setGroups((s) => {
      const copy = [...s];
      copy[gIdx].items = copy[gIdx].items.filter((_: any, i: number) => i !== idx);
      // persist update if this group has id
      const id = (copy[gIdx] && (copy[gIdx]._id || copy[gIdx].id)) ?? null;
      if (id) skillService.update(id, { items: copy[gIdx].items }).catch(() => {});
      return copy;
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await skillService.getAll();
        const data = res?.data ?? res ?? [];
        if (!mounted) return;
        if (Array.isArray(data)) {
          // normalize items to arrays to avoid runtime errors
          const normalized = data.map((g: any) => ({ ...(g || {}), items: Array.isArray(g?.items) ? g.items : [] }));
          setGroups(normalized);
        }
      } catch (err) {
        // keep default skills
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Skills (Admin)</h1>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {groups.map((g, gi) => (
          <div key={g._id || g.id || g.category || gi} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">{g.category}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => saveGroup(gi)} className="text-sm rounded-full bg-emerald-600 px-3 py-1 text-emerald-100 hover:bg-emerald-500">Save</button>
                <button onClick={() => removeGroup(gi)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
              </div>
            </div>
            <ul className="mb-3 flex flex-wrap gap-2">
              {(g.items || []).map((it: any, i: number) => (
                <li key={(g._id || g.id || g.category || gi) + "-" + it + "-" + i} className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-sm">
                  {it}
                  <button onClick={() => removeItem(gi, i)} className="text-xs text-red-400">x</button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <input
                value={newItems[gi] || ""}
                onChange={(e) => setNewItems((m) => ({ ...m, [gi]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(gi);
                  }
                }}
                placeholder="New item"
                className="flex-1 rounded-xl border border-slate-700 bg-[#0B0F19] px-3 py-2 text-sm"
              />
              <button onClick={() => addItem(gi)} className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white">Add</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="mb-3 font-semibold">Add new category</h3>
        <div className="flex items-center gap-2">
          <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Category name" className="flex-1 rounded-xl border border-slate-700 bg-[#0B0F19] px-3 py-2 text-sm" />
          <button onClick={addGroup} className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white">Add Category</button>
        </div>
      </div>
    </div>
  );
}
