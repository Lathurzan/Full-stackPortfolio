"use client";

import React, { useEffect, useState } from "react";
import { messageService } from "@/services/message.service";

export default function MessageTable({ initial = [] }: { initial?: Array<any> }) {
  const [messages, setMessages] = useState(initial);

  // keep internal state synced when the parent `initial` prop changes
  useEffect(() => {
    setMessages(initial || []);
  }, [initial]);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    setDeletingIds((s) => [...s, id]);
    try {
      await messageService.delete(id);
      setMessages((m) => m.filter((x) => x._id !== id && x.id !== id));
    } catch (err) {
      console.warn("failed to delete message", err);
      alert("Failed to delete message");
    } finally {
      setDeletingIds((s) => s.filter((x) => x !== id));
    }
  };

  if (!messages || messages.length === 0) {
    return <div className="text-slate-400">No messages yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto divide-y divide-slate-700">
        <thead>
          <tr className="text-left text-sm text-slate-400">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Message</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {messages.map((m) => (
            <tr key={m._id || m.id} className="align-top">
              <td className="px-4 py-3">
                <div className="font-medium text-slate-100">{m.name}</div>
              </td>
              <td className="px-4 py-3 text-sm text-blue-400">{m.email}</td>
              <td className="px-4 py-3 text-slate-300">{m.message}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleDelete(m._id || m.id)}
                  disabled={deletingIds.includes(m._id || m.id)}
                  className="rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
                >
                  {deletingIds.includes(m._id || m.id) ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
