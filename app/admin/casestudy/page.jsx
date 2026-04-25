"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import PageShell from "../../../components/PageShell";
import { getUser } from "../../../lib/auth";
import { CaseStudyAPI } from "../../../lib/casestudyApi";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { Pencil, ImagePlus, Loader2, Trash2, Globe } from "lucide-react";
import "./page.css";

const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-slate-100 animate-pulse rounded-2xl" />
  ),
});

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Field({ label, value, onChange, placeholder, hint }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
        className="mt-2 w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm shadow-glass outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10"
      />
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <textarea
        rows={rows}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
        className="mt-2 w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm shadow-glass outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10"
      />
    </label>
  );
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  client: "",
  industry: "",
  content: "",
  coverImage: "",
  metaTitle: "",
  metaDescription: "",
  isPublished: true,
  publishedAt: new Date().toISOString(),
};

export default function AdminCaseStudies() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Start writing the case study...",
      minHeight: 400,
      theme: "default",
      toolbarAdaptive: false,
      buttons: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "ul",
        "ol",
        "|",
        "font",
        "fontsize",
        "paragraph",
        "|",
        "image",
        "table",
        "link",
        "|",
        "align",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "fullsize",
      ],
      uploader: { insertImageAsBase64URI: true },
      removeButtons: ["about"],
      showXPathInStatusbar: false,
    }),
    []
  );

  useEffect(() => {
    const u = getUser();
    if (!u) return void (window.location.href = "/login");
    if (u.role !== "admin") return void (window.location.href = "/profile");
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await CaseStudyAPI.adminGetAll();
      setItems(data.items || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load case studies");
    } finally {
      setLoading(false);
    }
  }

  function set(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const { data } = await api.post("/api/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set("coverImage", data.url);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function startEdit(cs) {
    setEditing(cs._id);
    setForm({
      title: cs.title || "",
      slug: cs.slug || "",
      client: cs.client || "",
      industry: cs.industry || "",
      content: cs.content || "",
      coverImage: cs.coverImage || "",
      metaTitle: cs.metaTitle || "",
      metaDescription: cs.metaDescription || "",
      isPublished: !!cs.isPublished,
      publishedAt: cs.publishedAt
        ? new Date(cs.publishedAt).toISOString()
        : new Date().toISOString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  async function save() {
    if (!form.title || !form.slug) {
      toast.error("Title and slug are required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await CaseStudyAPI.update(editing, form);
        toast.success("Updated ✨");
      } else {
        await CaseStudyAPI.create(form);
        toast.success("Created ✨");
      }
      cancelEdit();
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function del(id) {
    if (!confirm("Delete this case study? This cannot be undone.")) return;
    try {
      await CaseStudyAPI.delete(id);
      toast.success("Deleted");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  }

  async function togglePublish(cs) {
    try {
      await CaseStudyAPI.update(cs._id, { isPublished: !cs.isPublished });
      toast.success(cs.isPublished ? "Moved to Draft" : "Published! ✅");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  }

  return (
    <PageShell title="Case Studies" kicker="CMS">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Link
          href="/admin"
          className="rounded-2xl border border-white/60 bg-white/50 px-4 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/65 transition backdrop-blur"
        >
          ← Dashboard
        </Link>
        <Link
          href="/work"
          target="_blank"
          className="rounded-2xl border border-white/60 bg-white/50 px-4 py-2 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/65 transition backdrop-blur"
        >
          View public page ↗
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* ── Form ── */}
        <div className="lg:col-span-6 rounded-3xl border border-white/50 bg-white/45 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="text-sm font-semibold text-slate-900">
              {editing ? "Edit Case Study" : "New Case Study"}
            </div>
            {editing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-2xl border border-white/60 bg-white/55 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/70 transition"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Title"
                value={form.title}
                onChange={(v) => {
                  set("title", v);
                  if (!editing) set("slug", slugify(v));
                }}
                placeholder="Project title"
              />
              <Field
                label="Slug"
                value={form.slug}
                onChange={(v) => set("slug", slugify(v))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Client"
                value={form.client}
                onChange={(v) => set("client", v)}
                placeholder="e.g. SEO Corp"
              />
              <Field
                label="Industry"
                value={form.industry}
                onChange={(v) => set("industry", v)}
                placeholder="e.g. E-commerce"
              />
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-slate-500 ml-1">
                Cover Image
              </span>
              <div
                className="mt-1 relative group h-40 w-full rounded-2xl border-2 border-dashed border-white/80 bg-white/40 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-white/60 transition"
                onClick={() => document.getElementById("fileInput").click()}
              >
                {form.coverImage ? (
                  <>
                    <img
                      src={form.coverImage}
                      className="h-full w-full object-cover"
                      alt="Preview"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Pencil className="text-white h-6 w-6" />
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    {uploading ? (
                      <Loader2 className="animate-spin h-6 w-6 text-slate-400" />
                    ) : (
                      <ImagePlus className="h-6 w-6 text-slate-400 mx-auto" />
                    )}
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
                      Click to Upload
                    </p>
                  </div>
                )}
              </div>
              <input
                id="fileInput"
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <hr className="shadow" />

            <div>
              <span className="text-xs font-bold uppercase text-slate-500 ml-1">
                Main Content
              </span>
              <div className="overflow-hidden rounded-2xl border border-white/60 shadow-glass">
                <JoditEditor
                  key={editing ?? "new"}
                  value={form.content}
                  config={config}
                  onBlur={(newContent) => set("content", newContent)}
                />
              </div>
            </div>

            <div className="border-t border-white/40 pt-4 space-y-4">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-widest">
                SEO Settings
              </div>
              <Field
                label="Meta Title"
                value={form.metaTitle}
                onChange={(v) => set("metaTitle", v)}
              />
              <TextArea
                label="Meta Description"
                value={form.metaDescription}
                onChange={(v) => set("metaDescription", v)}
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/50 p-4 shadow-glass backdrop-blur">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">
                  Visibility Status
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                  {form.isPublished ? "Published ✅" : "Draft (Hidden) 📁"}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  set("isPublished", !form.isPublished);
                }}
                className={cx(
                  "relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  form.isPublished ? "bg-slate-900" : "bg-slate-300"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    form.isPublished ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={save}
              disabled={saving}
              className={cx(
                "w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition",
                saving ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-800"
              )}
            >
              {saving
                ? "Saving…"
                : editing
                ? "Update Case Study"
                : "Create Case Study"}
            </button>
          </div>
        </div>

        {/* ── List ── */}
        <div className="lg:col-span-6 rounded-3xl border border-white/50 bg-white/45 p-5 shadow-soft backdrop-blur-xl">
          <div className="text-sm font-semibold text-slate-900 mb-4">
            All Case Studies
          </div>

          {loading ? (
            <div className="text-sm text-slate-600 p-4">Loading…</div>
          ) : (
            <div className="space-y-3">
              {items.map((cs) => (
                <div
                  key={cs._id}
                  className="rounded-3xl border border-white/60 bg-white/55 p-4 shadow-glass backdrop-blur"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      {cs.coverImage && (
                        <img
                          src={cs.coverImage}
                          className="h-10 w-10 rounded-lg object-cover border border-white/60"
                          alt=""
                        />
                      )}
                      <div>
                        <div className="font-semibold text-slate-900 truncate text-sm">
                          {cs.title}
                        </div>
                        <div className="text-xs text-slate-500">/{cs.slug}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => togglePublish(cs)}
                        className="p-2 hover:bg-white rounded-xl transition text-slate-600 border border-transparent hover:border-white/60"
                        title="Toggle Publish Status"
                      >
                        <Globe
                          className={cx(
                            "h-4 w-4",
                            cs.isPublished
                              ? "text-emerald-600"
                              : "text-slate-400"
                          )}
                        />
                      </button>
                      <button
                        onClick={() => startEdit(cs)}
                        className="rounded-xl bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-glass hover:bg-white/80 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => del(cs._id)}
                        className="rounded-xl bg-rose-100/50 px-3 py-1.5 text-xs font-semibold text-rose-900 shadow-glass hover:bg-rose-100/70 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
