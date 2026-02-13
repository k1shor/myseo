"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import PageShell from "../../components/PageShell";
import { getUser } from "../../lib/auth";

export default function AdminHome() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = getUser();
    if (!u) return void (window.location.href = "/login");
    if (u.role !== "admin") return void (window.location.href = "/profile");
    setUser(u);
  }, []);

  return (
    <PageShell title="Admin Dashboard" kicker="CMS">
      <div className="grid md:grid-cols-3 gap-4">
        <Card href="/admin/blogs" title="Blogs" desc="Create and edit posts + SEO fields + cover images." />
        <Card href="/admin/messages" title="Messages" desc="View contact form messages and reply." />
        <Card href="/admin/users" title="Users" desc="Manage users (activate/deactivate, create users)." />
        <Card href="/admin/settings" title="Site Settings" desc="Update global SEO defaults + contact/social." />
      </div>
      <div className="mt-8 text-xs text-slate-500">
        Tip: keep slugs short, use keywords naturally, and add an OG image for share previews ✨
      </div>
    </PageShell>
  );
}

function Card({ href, title, desc }) {
  return (
    <Link href={href} className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl hover:-translate-y-1 transition">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{desc}</div>
      <div className="mt-4 text-xs font-medium text-slate-900 underline">Open →</div>
    </Link>
  );
}
