"use client";
import { useState } from "react";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";
import { setAuthSession } from "../../lib/auth";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!token) return toast.error("Please verify reCAPTCHA");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", { ...form, recaptchaToken: token });
      setAuthSession({ token: data.token, user: data.user });
      toast.success("Account created ✨");
      window.location.href = "/profile";
    } catch (e) {
      toast.error(e?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  return (
    <PageShell title="Register" kicker="START">
      <div className="max-w-md">
        <form onSubmit={submit} className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
          <Field label="Full name" value={form.name} onChange={(v)=>setForm(s=>({...s,name:v}))} />
          <div className="mt-4" />
          <Field label="Email" value={form.email} onChange={(v)=>setForm(s=>({...s,email:v}))} />
          <div className="mt-4" />
          <Field label="Phone" value={form.phone} onChange={(v)=>setForm(s=>({...s,phone:v}))} />
          <div className="mt-4" />
          <Field label="Password" type="password" value={form.password} onChange={(v)=>setForm(s=>({...s,password:v}))} />

          <div className="mt-5">
            {siteKey ? (
              <ReCAPTCHA sitekey={siteKey} onChange={(v)=>setToken(v || "")} />
            ) : (
              <div className="text-sm text-rose-700">
                Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY in frontend/.env.local
              </div>
            )}
          </div>

          <button disabled={loading} className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-soft hover:opacity-90 transition disabled:opacity-60">
            {loading ? "Creating…" : "Create account"}
          </button>

          <div className="mt-4 text-sm text-slate-600">
            Already have an account? <Link className="font-medium text-slate-900 underline" href="/login">Login</Link>
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
