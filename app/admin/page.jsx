"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageShell from "../../components/PageShell";
import { getUser } from "../../lib/auth";

export default function AdminHome() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // ✅ Only run auth checks on client
    const u = getUser();

    if (!u) {
      window.location.href = "/login";
      return;
    }

    if (u.role !== "admin") {
      window.location.href = "/profile";
      return;
    }

    setUser(u);
    setChecking(false);
  }, []);

  const cards = useMemo(
    () => [
      {
        href: "/admin/blogs",
        title: "Blogs",
        desc: "Create and edit posts + SEO fields + cover images.",
        icon: "📝",
        gradient: "from-pink-200/40 via-violet-200/40 to-sky-200/40"
      },
      {
        href: "/admin/messages",
        title: "Messages",
        desc: "View contact form messages and reply.",
        icon: "💬",
        gradient: "from-emerald-200/40 via-sky-200/40 to-violet-200/40"
      },
      {
        href: "/admin/users",
        title: "Users",
        desc: "Manage users (activate/deactivate, create users).",
        icon: "👤",
        gradient: "from-amber-200/40 via-pink-200/40 to-violet-200/40"
      },
      {
        href: "/admin/settings",
        title: "Site Settings",
        desc: "Update global SEO defaults + contact/social.",
        icon: "⚙️",
        gradient: "from-sky-200/40 via-violet-200/40 to-emerald-200/40"
      },
      {
        href: "/admin/about",
        title: "About Section",
        desc: "Edit About page content + meta tags + OG/Twitter cards.",
        icon: "✨",
        gradient: "from-violet-200/40 via-sky-200/40 to-pink-200/40",
        badge: "NEW"
      }
    ],
    []
  );

  // ✅ Prevent hydration mismatch:
  // Server render: returns stable loader
  // First client render: also returns stable loader (until mounted/checking resolves)
  if (!mounted || checking) {
    return (
      <PageShell title="Admin Dashboard" kicker="CMS">
        <div className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
          <div className="text-sm font-semibold text-slate-900">Loading…</div>
          <div className="mt-2 text-sm text-slate-600">
            Checking your access permissions.
          </div>
        </div>
      </PageShell>
    );
  }

  // If redirected, this won’t matter, but keep safe:
  if (!user) return null;

  return (
    <PageShell
      title="Admin Dashboard"
      kicker="CMS"
      subtitle={user?.email ? `Signed in as ${user.email}` : ""}
    >
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card
            key={c.href}
            href={c.href}
            title={c.title}
            desc={c.desc}
            icon={c.icon}
            gradient={c.gradient}
            badge={c.badge}
          />
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
          <div className="text-sm font-semibold text-slate-900">Operational Notes</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>• Keep slugs short and intent-focused.</li>
            <li>• Always add OG image for share previews.</li>
            <li>• Use keywords naturally; don’t stuff.</li>
            <li>• For AI SEO / GEO, prioritize clarity + entity signals.</li>
          </ul>
          <div className="mt-4 text-xs text-slate-500">
            Tip: publish only after previewing on mobile + desktop ✨
          </div>
        </div>

        <div className="lg:col-span-4 rounded-3xl border border-white/50 bg-gradient-to-br from-pink-200/35 via-violet-200/35 to-sky-200/35 p-6 shadow-soft backdrop-blur-xl">
          <div className="text-sm font-semibold text-slate-900">Quick Actions</div>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/admin/about"
              className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-slate-800 transition"
            >
              Edit About + Meta
            </Link>
            <Link
              href="/admin/blogs"
              className="rounded-2xl border border-white/60 bg-white/50 px-4 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/65 transition backdrop-blur"
            >
              Create Blog Post
            </Link>
            <Link
              href="/admin/settings"
              className="rounded-2xl border border-white/60 bg-white/50 px-4 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/65 transition backdrop-blur"
            >
              Update Site Settings
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Card({ href, title, desc, icon, gradient, badge }) {
  return (
    <Link
      href={href}
      className={[
        "group relative overflow-hidden rounded-3xl border border-white/50",
        "bg-white/45 p-6 shadow-soft backdrop-blur-xl",
        "hover:-translate-y-1 transition"
      ].join(" ")}
    >
      {/* gradient wash */}
      <div
        className={[
          "pointer-events-none absolute -inset-1 opacity-70 blur-2xl",
          "bg-gradient-to-br",
          gradient || "from-pink-200/40 via-violet-200/40 to-sky-200/40"
        ].join(" ")}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon || "📌"}</span>
            <div className="text-sm font-semibold text-slate-900">{title}</div>
          </div>

          {badge ? (
            <span className="rounded-full border border-white/60 bg-white/55 px-2 py-1 text-[10px] font-semibold text-slate-800 shadow-glass backdrop-blur">
              {badge}
            </span>
          ) : null}
        </div>

        <div className="mt-2 text-sm text-slate-600">{desc}</div>

        <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-900 underline">
          Open <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </Link>
  );
}