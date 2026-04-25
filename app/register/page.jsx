"use client";

import { useState } from "react";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";
import { setAuthSession } from "../../lib/auth";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    if (!token) return toast.error("Please verify reCAPTCHA");

    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", {
        ...form,
        recaptchaToken: token,
      });

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
      <div className="grid gap-8 items-start lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* Left: Sticky Form */}
        <div className="max-w-md self-start h-fit lg:sticky lg:top-24">
          <form
            onSubmit={submit}
            className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl"
          >
            <Field
              label="Full name"
              value={form.name}
              onChange={(v) => setForm((s) => ({ ...s, name: v }))}
            />
            <div className="mt-4" />
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => setForm((s) => ({ ...s, email: v }))}
            />
            <div className="mt-4" />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
            />
            <div className="mt-4" />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => setForm((s) => ({ ...s, password: v }))}
            />

            <div className="mt-5">
              {siteKey ? (
                <ReCAPTCHA
                  sitekey={siteKey}
                  onChange={(v) => setToken(v || "")}
                />
              ) : (
                <div className="text-sm text-rose-700">
                  Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY in frontend/.env.local
                </div>
              )}
            </div>

            <button
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-soft hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create account"}
            </button>

            <div className="mt-4 text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                className="font-medium text-slate-900 underline"
                href="/login"
              >
                Login
              </Link>
            </div>
          </form>
        </div>

        {/* Right: Scrollable Visual Panel */}
        <div className="hidden lg:block self-start">
          <div className="relative h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden rounded-3xl border border-white/50 bg-white/40 p-8 shadow-soft backdrop-blur-xl">
            {/* Background blobs */}
            <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-fuchsia-300/25 blur-3xl animate-float" />
            <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl animate-float-slow" />
            <div className="absolute bottom-10 left-28 h-60 w-60 rounded-full bg-indigo-300/20 blur-3xl animate-float" />

            <div className="relative z-10 flex flex-col">
              {/* Top badge */}
              <div className="inline-flex self-start rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
                SEO growth studio
              </div>

              {/* Heading */}
              <div className="mt-6 max-w-lg">
                <h3 className="text-4xl font-semibold tracking-tight text-slate-900">
                  Build your presence with a calm, premium workspace.
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Create your account and manage your profile, messages, and
                  replies in one elegant dashboard.
                </p>
              </div>

              {/* Main dashboard card */}
              <div className="mt-8 rounded-[2rem] border border-white/70 bg-white/55 p-5 shadow-glass">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Organic growth overview
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Visibility, trust, and lead flow in one place.
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-900/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
                    Live
                  </div>
                </div>

                <div className="mt-5">
                  <GrowthIllustration />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniStat
                    label="Visibility"
                    value="+240%"
                    tone="from-violet-500 to-fuchsia-500"
                  />
                  <MiniStat
                    label="Speed"
                    value="Fast"
                    tone="from-cyan-500 to-sky-500"
                  />
                  <MiniStat
                    label="Trust"
                    value="High"
                    tone="from-emerald-500 to-teal-500"
                  />
                </div>
              </div>

              {/* Feature cards */}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <FeatureCard
                  title="SEO Ready"
                  text="Clean structure and smart metadata."
                  icon={<SearchIcon />}
                />
                <FeatureCard
                  title="Protected"
                  text="Secure account and safe access."
                  icon={<ShieldIcon />}
                />
                <FeatureCard
                  title="Smart Growth"
                  text="Track leads, rank, and progress."
                  icon={<GraphIcon />}
                />
              </div>

              {/* Testimonial + rotating icons */}
              <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr] flex-1">
                <div className="rounded-[2rem] border border-white/70 bg-gradient-to-br from-white/70 to-white/35 p-6 shadow-glass">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-slate-900 p-3 text-white shadow-lg">
                      <SparkIcon />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Everything in one place
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Register once, then manage your profile, messages, and
                        admin replies without losing track of anything.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl border border-white/70 bg-white/60 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                      Client note
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      “The interface feels polished, clear, and easy to navigate
                      — exactly the kind of experience that builds trust.”
                    </p>
                    <div className="mt-3 text-xs font-medium text-slate-500">
                      — Happy customer
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 p-6 shadow-glass">
                  <div className="text-sm font-semibold text-slate-900">
                    Rotating brand icons
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    A subtle motion piece that makes the right panel feel alive.
                  </p>

                  <div className="relative mx-auto mt-8 h-56 w-56">
                    <div className="absolute inset-0 rounded-full border border-dashed border-slate-900/80 animate-spin [animation-duration:18s]" />

                    <OrbIcon
                      className="absolute left-1/2 top-2 -translate-x-1/2"
                      delay="0s"
                    >
                      <SearchIcon />
                    </OrbIcon>
                    <OrbIcon
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      delay="0.5s"
                    >
                      <GraphIcon />
                    </OrbIcon>
                    <OrbIcon
                      className="absolute bottom-2 left-1/2 -translate-x-1/2"
                      delay="1s"
                    >
                      <ShieldIcon />
                    </OrbIcon>
                    <OrbIcon
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      delay="1.5s"
                    >
                      <SparkIcon />
                    </OrbIcon>

                    <div className="absolute inset-14 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-700 shadow-xl">
                      <div className="text-center text-white">
                        <div className="text-lg font-semibold">MySEO</div>
                        <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
                          Register
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <MiniCard title="Speed" value="Optimized" />
                    <MiniCard title="Support" value="Centralized" />
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

function GrowthIllustration() {
  return (
    <svg viewBox="0 0 720 380" className="h-auto w-full">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      <rect
        x="18"
        y="18"
        width="684"
        height="344"
        rx="32"
        fill="url(#cardGrad)"
        stroke="rgba(15,23,42,0.08)"
      />

      <g opacity="0.4">
        <path d="M70 70H650" stroke="#cbd5e1" />
        <path d="M70 120H650" stroke="#e2e8f0" />
        <path d="M70 170H650" stroke="#e2e8f0" />
        <path d="M70 220H650" stroke="#e2e8f0" />
        <path d="M70 270H650" stroke="#e2e8f0" />
        <path d="M120 55V315" stroke="#e2e8f0" />
        <path d="M220 55V315" stroke="#e2e8f0" />
        <path d="M320 55V315" stroke="#e2e8f0" />
        <path d="M420 55V315" stroke="#e2e8f0" />
        <path d="M520 55V315" stroke="#e2e8f0" />
        <path d="M620 55V315" stroke="#e2e8f0" />
      </g>

      <path
        d="M78 250 C130 248, 152 236, 192 220 C240 200, 270 210, 315 184 C360 158, 398 142, 434 118 C486 84, 540 126, 606 74"
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M78 250 C130 248, 152 236, 192 220 C240 200, 270 210, 315 184 C360 158, 398 142, 434 118 C486 84, 540 126, 606 74 L606 315 L78 315 Z"
        fill="url(#lineGrad)"
        opacity="0.12"
      />

      <circle cx="78" cy="250" r="8" fill="#8b5cf6" />
      <circle cx="192" cy="220" r="8" fill="#ec4899" />
      <circle cx="315" cy="184" r="8" fill="#8b5cf6" />
      <circle cx="434" cy="118" r="8" fill="#ec4899" />
      <circle cx="606" cy="74" r="8" fill="#38bdf8" />

      <rect
        x="470"
        y="36"
        width="176"
        height="70"
        rx="18"
        fill="white"
        opacity="0.9"
      />
      <text x="492" y="64" fill="#0f172a" fontSize="16" fontWeight="700">
        +240% growth
      </text>
      <text x="492" y="86" fill="#64748b" fontSize="12">
        Organic visibility up
      </text>

      <rect
        x="86"
        y="42"
        width="120"
        height="38"
        rx="16"
        fill="#0f172a"
        opacity="0.94"
      />
      <text x="109" y="66" fill="#ffffff" fontSize="13" fontWeight="700">
        Live analysis
      </text>

      <rect
        x="82"
        y="286"
        width="130"
        height="26"
        rx="13"
        fill="#ffffff"
        opacity="0.9"
      />
      <rect
        x="222"
        y="286"
        width="160"
        height="26"
        rx="13"
        fill="#ffffff"
        opacity="0.9"
      />
      <rect
        x="392"
        y="286"
        width="108"
        height="26"
        rx="13"
        fill="#ffffff"
        opacity="0.9"
      />
      <rect
        x="510"
        y="286"
        width="118"
        height="26"
        rx="13"
        fill="#ffffff"
        opacity="0.9"
      />

      <circle cx="102" cy="299" r="5" fill="#8b5cf6" />
      <circle cx="242" cy="299" r="5" fill="#ec4899" />
      <circle cx="412" cy="299" r="5" fill="#38bdf8" />
      <circle cx="532" cy="299" r="5" fill="#8b5cf6" />
    </svg>
  );
}

function FeatureCard({ title, text, icon }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/55 p-4 shadow-glass">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
        {icon}
      </div>
      <div className="mt-4 text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-600">{text}</div>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-3 text-center shadow-glass">
      <div
        className={`mx-auto mb-2 h-2 w-14 rounded-full bg-gradient-to-r ${tone}`}
      />
      <div className="text-sm font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">
        {label}
      </div>
    </div>
  );
}

function MiniCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/65 p-4 shadow-glass">
      <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
        {title}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function OrbIcon({ children, className = "", delay = "0s" }) {
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-slate-900 shadow-glass animate-float ${className}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
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

function Field({ label, type = "text", value, onChange }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          label === "Full name"
            ? "John Doe"
            : label === "Email"
            ? "you@example.com"
            : label === "Phone"
            ? "+1 (555) 000-0000"
            : "At least 8 characters"
        }
        className="mt-2 w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm shadow-glass outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10"
      />
    </label>
  );
}
