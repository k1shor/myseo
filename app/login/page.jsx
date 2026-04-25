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
      const { data } = await api.post("/api/auth/login", {
        ...form,
      });

      setAuthSession({ token: data.token, user: data.user });
      toast.success("Welcome back ✨");
      window.location.href = "/profile";
    } catch (e) {
      toast.error(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const showGoogle =
    (process.env.NEXT_PUBLIC_GOOGLE_OAUTH_BUTTON || "false") === "true";

  return (
    <PageShell title="Login" kicker="ACCESS">
      <div className="grid items-start gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* Left: Sticky Form */}
        <div className="h-fit max-w-md self-start lg:sticky lg:top-24">
          <form
            onSubmit={submit}
            className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl"
          >
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => setForm((s) => ({ ...s, email: v }))}
            />

            <div className="mt-4" />

            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => setForm((s) => ({ ...s, password: v }))}
            />

            <button
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-soft transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Login"}
            </button>

            {showGoogle && (
              <a
                href={`${
                  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
                }/api/auth/google`}
                className="mt-3 block w-full rounded-2xl bg-white/70 px-5 py-3 text-center text-sm font-medium text-slate-800 shadow-glass transition hover:bg-white/85"
              >
                <span className="flex items-center justify-center gap-2">
                  <GoogleIcon />
                  Continue with Google
                </span>
              </a>
            )}

            <div className="mt-4 text-sm text-slate-600">
              No account?{" "}
              <Link
                className="font-medium text-slate-900 underline"
                href="/register"
              >
                Register
              </Link>
            </div>
          </form>
        </div>

        {/* Right: Visual Panel aligned with ACCESS */}
        <div className="hidden self-start lg:block lg:-mt-24">
          <div className="relative h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden rounded-3xl border border-white/50 bg-white/40 px-8 pb-8 pt-3 shadow-soft backdrop-blur-xl">
            {/* Background blobs */}
            <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-violet-300/25 blur-3xl animate-float" />
            <div className="pointer-events-none absolute right-0 top-28 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl animate-float-slow" />
            <div className="pointer-events-none absolute bottom-10 left-28 h-60 w-60 rounded-full bg-pink-300/20 blur-3xl animate-float" />

            <div className="relative z-10 flex flex-col">
              <div className="inline-flex self-start rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
                Welcome back
              </div>

              <div className="mt-4 max-w-lg">
                <h3 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900">
                  Your dashboard is ready and waiting for you.
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Sign in to access your profile, review messages, and track
                  your SEO performance — all in one elegant space.
                </p>
              </div>

              {/* Middle Section: Info Cards */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[2rem] border border-white/70 bg-gradient-to-br from-white/70 to-white/35 p-6 shadow-glass">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-2xl bg-slate-900 p-3 text-white shadow-lg">
                      <SparkIcon />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Trusted by creators
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Join hundreds of businesses growing with MySEO.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-3xl border border-white/70 bg-white/60 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                      Client note
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      "Logging back in feels like coming home — everything is
                      exactly where I left it."
                    </p>
                    <div className="mt-3 text-xs font-medium text-slate-500">
                      — Returning user
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 p-6 shadow-glass">
                  <div className="text-sm font-semibold text-slate-900">
                    Your workspace
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Everything synced and ready to go.
                  </p>

                  <div className="relative mx-auto mt-6 h-44 w-44">
                    <div className="absolute inset-0 animate-spin rounded-full border border-dashed border-slate-900/90 [animation-duration:18s]" />

                    <OrbIcon
                      className="absolute left-1/2 top-1 -translate-x-1/2"
                      delay="0s"
                    >
                      <SearchIcon />
                    </OrbIcon>

                    <OrbIcon
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      delay="0.5s"
                    >
                      <GraphIcon />
                    </OrbIcon>

                    <OrbIcon
                      className="absolute bottom-1 left-1/2 -translate-x-1/2"
                      delay="1s"
                    >
                      <ShieldIcon />
                    </OrbIcon>

                    <OrbIcon
                      className="absolute left-1 top-1/2 -translate-y-1/2"
                      delay="1.5s"
                    >
                      <SparkIcon />
                    </OrbIcon>

                    <div className="absolute inset-12 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-700 shadow-xl">
                      <div className="text-center text-white">
                        <div className="text-sm font-semibold">MySEO</div>
                        <div className="mt-0.5 text-[9px] uppercase tracking-[0.3em] text-white/60">
                          Login
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <MiniCard title="Status" value="Active" />
                    <MiniCard title="Sync" value="Live" />
                  </div>
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes float {
                0%,
                100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-14px);
                }
              }

              @keyframes floatSlow {
                0%,
                100% {
                  transform: translateY(0px) scale(1);
                }
                50% {
                  transform: translateY(16px) scale(1.03);
                }
              }

              .animate-float {
                animation: float 7s ease-in-out infinite;
              }

              .animate-float-slow {
                animation: floatSlow 10s ease-in-out infinite;
              }
            `}</style>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Field({ label, type = "text", value, onChange }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label === "Email" ? "you@example.com" : "Your password"}
        className="mt-2 w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm shadow-glass outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10"
      />
    </label>
  );
}

function MiniCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/65 p-3 shadow-glass">
      <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
        {title}
      </div>
      <div className="mt-1.5 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function OrbIcon({ children, className = "", delay = "0s" }) {
  return (
    <div
      className={`animate-float flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-slate-900 shadow-glass ${className}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16L21 21" strokeLinecap="round" />
    </svg>
  );
}

function GraphIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 19V5" strokeLinecap="round" />
      <path d="M4 19H20" strokeLinecap="round" />
      <path
        d="M7 15L11 11L14 13L19 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M12 3L19 6V11C19 16 15.5 19.5 12 21C8.5 19.5 5 16 5 11V6L12 3Z"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12L11.3 13.8L14.8 10.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
