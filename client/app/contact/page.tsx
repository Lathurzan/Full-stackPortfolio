"use client";

import { useState } from "react";
import { messageService } from "../../services/message.service";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!name || !email || !message) {
      setFeedback("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      await messageService.create({ name, email, message });
      setFeedback("Message sent — thank you!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setFeedback(err?.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-14">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
            Contact
          </p>

          <h1 className="text-4xl font-bold md:text-6xl">
            Let’s work together
          </h1>

          <p className="mt-5 max-w-2xl text-slate-400">
            Open to graduate software engineering, full-stack,
            backend, and AI-focused developer opportunities.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
          {feedback && <div className="mb-4 text-sm text-slate-200">{feedback}</div>}

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Your name"
              className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Email
            </label>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="your@email.com"
              className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Message
            </label>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Write your message..."
              className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-500"
          >
            {loading ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}