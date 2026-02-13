"use client";
import { useEffect, useMemo, useState } from "react";
import PageShell from "../../../components/PageShell";
import { getUser } from "../../../lib/auth";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminBlogs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u) return void (window.location.href = "/login");
    if (u.role !== "admin") return void (window.location.href = "/profile");
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/api/blogs/admin/all");
      setItems(data.items || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }

  async function del(id) {
    if (!confirm("Delete this blog?")) return;
    try {
      await api.delete(`/api/blogs/${id}`);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  }

  return (
    <PageShell title="Admin — Blogs" kicker="CMS">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/blogs/new" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white shadow-soft hover:opacity-90 transition">
          + New Blog
        </Link>
        <Link href="/blogs" className="rounded-2xl bg-white/70 px-4 py-2 text-sm text-slate-800 shadow-glass hover:bg-white/85 transition">
          View public blogs
        </Link>
      </div>

      <div className="mt-6 rounded-3xl border border-white/50 bg-white/45 p-4 shadow-soft backdrop-blur-xl">
        {loading ? (
          <div className="text-sm text-slate-600 p-4">Loading…</div>
        ) : items.length ? (
          <div className="divide-y divide-white/50">
            {items.map(b => (
              <div key={b._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 truncate">{b.title}</div>
                  <div className="text-xs text-slate-500">/{b.slug} • {b.isPublished ? "Published" : "Draft"}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/blogs/${b._id}`} className="rounded-2xl bg-white/70 px-3 py-2 text-sm shadow-glass hover:bg-white/85 transition">Edit</Link>
                  <button onClick={() => del(b._id)} className="rounded-2xl bg-rose-600 px-3 py-2 text-sm text-white shadow-soft hover:opacity-90 transition">Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-600 p-4">No blogs yet.</div>
        )}
      </div>
    </PageShell>
  );
}
