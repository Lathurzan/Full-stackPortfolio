"use client";

import { useEffect, useState } from "react";
import { messageService } from "../../../services/message.service";
import MessageTable from "@/components/admin/MessageTable";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Array<{ name: string; email: string; message: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await messageService.list();
        if (mounted) setMessages(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => { mounted = false };
  }, []);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Messages</h1>

      {loading && <p className="text-slate-400">Loading messages…</p>}
      {error && <p className="text-red-400">{error}</p>}

      <div className="space-y-5">
        <MessageTable initial={messages} />
      </div>
    </div>
  );
}