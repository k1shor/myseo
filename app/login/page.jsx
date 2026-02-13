"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";
import { setAuthSession } from "../../lib/auth";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", form);
      setAuthSession({ token: data.token, user: data.user });
      toast.success("Welcome back ✨");
      window.location.href = "/profile";
    } catch (e) {
      toast.error(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const showGoogle = (process.env.NEXT_PUBLIC_GOOGLE_OAUTH_BUTTON || "false") === "true";

  return (
    <PageShell title="Login" kicker="ACCESS">
      <div className="max-w-md">
        <form onSubmit={submit} className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
          <Field label="Email" value={form.email} onChange={(v)=>setForm(s=>({...s,email:v}))} />
          <div className="mt-4" />
          <Field label="Password" type="password" value={form.password} onChange={(v)=>setForm(s=>({...s,password:v}))} />

          <button disabled={loading} className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-soft hover:opacity-90 transition disabled:opacity-60">
            {loading ? "Signing in…" : "Login"}
          </button>

          {showGoogle && (
            <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/google`}
               className="mt-3 block w-full rounded-2xl bg-white/70 px-5 py-3 text-center text-sm font-medium text-slate-800 shadow-glass hover:bg-white/85 transition">
              Continue with Google
            </a>
          )}

          <div className="mt-4 text-sm text-slate-600">
            No account? <Link className="font-medium text-slate-900 underline" href="/register">Register</Link>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

function Field({ label, type="text", value, onChange }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <input
        type={type}
        required
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm shadow-glass outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10"
      />
    </label>
  );
}
