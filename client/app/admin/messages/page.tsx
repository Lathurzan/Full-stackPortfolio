"use client";

import { useEffect, useRef, useState } from "react";
import { messageService } from "../../../services/message.service";
import MessageTable from "@/components/admin/MessageTable";

type Message = { _id: string; name: string; email: string; message: string };

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await messageService.list();
      // only set state when component is still mounted
      if (mountedRef.current) setMessages(data as Message[]);
    } catch (err: any) {
      // build a richer error message for debugging
      const status = err?.response?.status;
      const url = err?.config?.url;
      const serverMsg = err?.response?.data?.message || err?.response?.data || null;
      const message = serverMsg ? `${serverMsg} (status: ${status})` : (err?.message || "Failed to load messages");
      if (mountedRef.current) setError(`${message} — ${url || "unknown url"}`);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    const prev = mountedRef.current = true;
    load();
    return () => { mountedRef.current = false };
  }, []);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Messages</h1>

      {loading && <p className="text-slate-400">Loading messages…</p>}
      {error && (
        <div className="space-y-2">
          <p className="text-red-400">{error}</p>
          <div>
            <button onClick={load} className="rounded bg-slate-700 px-3 py-1 text-sm">Retry</button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <MessageTable initial={messages} />
      </div>
    </div>
  );
}