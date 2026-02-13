"use client";
import { useEffect, useState } from "react";
import PageShell from "./PageShell";
import { api } from "../lib/api";
import { getUser } from "../lib/auth";
import toast from "react-hot-toast";
import Link from "next/link";

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function BlogEditor({ mode, id }) {
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "<p>Write your blog content here…</p>",
    coverImage: "",
    authorName: "Admin",
    keywordsText: "seo, marketing",
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
    isPublished: true,
    publishedAt: new Date().toISOString(),
  });

  useEffect(() => {
    const u = getUser();
    if (!u) return void (window.location.href = "/login");
    if (u.role !== "admin") return void (window.location.href = "/profile");
    if (u.name) setForm((s)=>({ ...s, authorName: u.name }));

    if (mode === "edit") load();
    // eslint-disable-next-line
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/api/blogs/admin/all");
      const b = (data.items || []).find(x => x._id === id);
      if (!b) throw new Error("Blog not found");
      setForm({
        title: b.title || "",
        slug: b.slug || "",
        excerpt: b.excerpt || "",
        content: b.content || "",
        coverImage: b.coverImage || "",
        authorName: b.authorName || "Admin",
        keywordsText: (b.keywords || []).join(", "),
        metaTitle: b.metaTitle || "",
        metaDescription: b.metaDescription || "",
        ogImage: b.ogImage || "",
        isPublished: !!b.isPublished,
        publishedAt: (b.publishedAt ? new Date(b.publishedAt) : new Date()).toISOString(),
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to load blog");
      window.location.href = "/admin/blogs";
    } finally {
      setLoading(false);
    }
  }

  async function uploadCover(file) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await api.post("/api/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm((s)=>({ ...s, coverImage: data.url, ogImage: s.ogImage || data.url }));
      toast.success("Uploaded ✨");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        coverImage: form.coverImage || undefined,
        authorName: form.authorName,
        keywords: form.keywordsText.split(",").map(s=>s.trim()).filter(Boolean),
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        ogImage: form.ogImage || undefined,
        isPublished: form.isPublished,
        publishedAt: form.publishedAt
      };

      if (mode === "new") {
        await api.post("/api/blogs", payload);
        toast.success("Created ✨");
      } else {
        await api.put(`/api/blogs/${id}`, payload);
        toast.success("Saved ✨");
      }
      window.location.href = "/admin/blogs";
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell title="Blog Editor" kicker="CMS">
        <div className="text-sm text-slate-600">Loading…</div>
      </PageShell>
    );
  }

  return (
    <PageShell title={mode === "new" ? "Create Blog" : "Edit Blog"} kicker="CMS">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/blogs" className="rounded-2xl bg-white/70 px-4 py-2 text-sm text-slate-800 shadow-glass hover:bg-white/85 transition">
          ← Back
        </Link>
        <button
          onClick={save}
          disabled={saving || uploading}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white shadow-soft hover:opacity-90 transition disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Block title="Core">
            <Field label="Title" value={form.title} onChange={(v)=>setForm(s=>({ ...s, title: v, slug: s.slug || slugify(v) }))} />
            <Field label="Slug" value={form.slug} onChange={(v)=>setForm(s=>({ ...s, slug: slugify(v) }))} hint="Clean URL for SEO (auto-slugifies)." />
            <Field label="Excerpt" value={form.excerpt} onChange={(v)=>setForm(s=>({ ...s, excerpt: v }))} />
          </Block>

          <Block title="Content (HTML)">
            <label className="block text-sm font-medium text-slate-700">Content</label>
            <textarea
              value={form.content}
              onChange={(e)=>setForm(s=>({ ...s, content: e.target.value }))}
              rows={14}
              className="mt-2 w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm shadow-glass outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <div className="mt-2 text-xs text-slate-500">
              Tip: You can paste rich HTML. For production, you may switch to a rich editor later.
            </div>
          </Block>
        </div>

        <div className="space-y-4">
          <Block title="Cover + Archive Thumbnail">
            {form.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.coverImage} alt="cover" className="w-full rounded-2xl border border-white/60 shadow-glass" />
            ) : (
              <div className="rounded-2xl bg-white/60 p-4 text-sm text-slate-600 shadow-glass">No cover yet.</div>
            )}

            <label className="mt-3 block text-sm font-medium text-slate-700">Upload cover image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e)=>uploadCover(e.target.files?.[0])}
              className="mt-2 w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm shadow-glass"
            />
            <div className="mt-2 text-xs text-slate-500">{uploading ? "Uploading…" : "Stored in Cloudinary."}</div>
          </Block>

          <Block title="Publishing">
            <Field label="Author name" value={form.authorName} onChange={(v)=>setForm(s=>({ ...s, authorName: v }))} />
            <Field label="Keywords (comma-separated)" value={form.keywordsText} onChange={(v)=>setForm(s=>({ ...s, keywordsText: v }))} />
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.isPublished} onChange={(e)=>setForm(s=>({ ...s, isPublished: e.target.checked }))} />
              Published
            </label>
          </Block>

          <Block title="SEO">
            <Field label="Meta title" value={form.metaTitle} onChange={(v)=>setForm(s=>({ ...s, metaTitle: v }))} />
            <Field label="Meta description" value={form.metaDescription} onChange={(v)=>setForm(s=>({ ...s, metaDescription: v }))} />
            <Field label="OG image URL (optional)" value={form.ogImage} onChange={(v)=>setForm(s=>({ ...s, ogImage: v }))} hint="If empty, cover image is used." />
          </Block>
        </div>
      </div>
    </PageShell>
  );
}

function Block({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/50 bg-white/45 p-5 shadow-soft backdrop-blur-xl">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, hint }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <input
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm shadow-glass outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10"
      />
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </label>
  );
}
