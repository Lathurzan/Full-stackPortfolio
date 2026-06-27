"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../../services/auth.service";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login(email, password);
      // expected shape: { token, user }
      if (res && res.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_token", res.token);
        }
        // navigate to admin area
        router.push("/admin");
      } else {
        setError("Unexpected response from server");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#0B0F19] px-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <h1 className="mb-2 text-3xl font-bold">Admin Login</h1>
        <p className="mb-8 text-slate-400">Sign in to manage your portfolio.</p>

        {error && <div className="mb-4 rounded border border-red-600 bg-red-900/40 px-4 py-2 text-sm text-red-200">{error}</div>}

        <div className="mb-5">
          <label className="mb-2 block text-sm text-slate-300">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 outline-none focus:border-blue-500"
            placeholder="admin@email.com"
            autoComplete="email"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm text-slate-300">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full rounded-xl border border-slate-700 bg-[#0B0F19] px-4 py-3 outline-none focus:border-blue-500"
            placeholder="********"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-full bg-blue-600 py-3 font-medium text-white hover:bg-blue-500 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>
    </section>
  );
}